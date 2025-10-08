/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerPlugin } from "../../../interfaces";
import { LoomServer } from "../server/LoomServer";

/**
 * Rate Limit 플러그인 옵션
 */
export interface RateLimitOptions {
  /** 시간 윈도우 (밀리초, 기본값: 15분) */
  windowMs?: number;
  /** 시간 윈도우당 최대 요청 수 (기본값: 100) */
  max?: number;
  /** 제한 초과 시 응답 메시지 */
  message?: string;
  /** 제한 초과 시 HTTP 상태 코드 (기본값: 429) */
  statusCode?: number;
  /** Rate limit 헤더를 응답에 포함할지 여부 (기본값: true) */
  standardHeaders?: boolean;
  /** Legacy 헤더를 응답에 포함할지 여부 (기본값: true) */
  legacyHeaders?: boolean;
  /** IP 주소를 추출하는 함수 (기본값: req.ip 또는 req.connection.remoteAddress) */
  keyGenerator?: (req: Record<string, unknown>) => string;
  /** 특정 요청을 Rate limit에서 제외하는 함수 */
  skip?: (req: Record<string, unknown>) => boolean;
  /** Rate limit 적용 전 호출되는 콜백 */
  onLimitReached?: (
    req: Record<string, unknown>,
    res: Record<string, unknown>,
  ) => void;
}

/**
 * Rate limit 정보를 저장하는 인터페이스
 */
interface RateLimitInfo {
  /** 현재 요청 수 */
  count: number;
  /** 윈도우 시작 시간 */
  resetTime: number;
}

/**
 * Loom 서버용 Rate Limiting 플러그인
 * IP 주소별로 요청 수를 제한하여 DoS 공격을 방지합니다.
 */
export class LoomRateLimitPlugin implements ServerPlugin {
  public readonly name = "loom-rate-limit";
  private readonly options: Required<
    Omit<RateLimitOptions, "keyGenerator" | "skip" | "onLimitReached">
  > & {
    keyGenerator?: (req: Record<string, unknown>) => string;
    skip?: (req: Record<string, unknown>) => boolean;
    onLimitReached?: (
      req: Record<string, unknown>,
      res: Record<string, unknown>,
    ) => void;
  };
  private readonly store = new Map<string, RateLimitInfo>();
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: RateLimitOptions = {}) {
    this.options = {
      windowMs: 15 * 60 * 1000, // 15분
      max: 100,
      message: "Too many requests from this IP, please try again later.",
      statusCode: 429,
      standardHeaders: true,
      legacyHeaders: true,
      keyGenerator: options.keyGenerator,
      skip: options.skip,
      onLimitReached: options.onLimitReached,
      ...options,
    } as Required<
      Omit<RateLimitOptions, "keyGenerator" | "skip" | "onLimitReached">
    > & {
      keyGenerator?: (req: any) => string;
      skip?: (req: any) => boolean;
      onLimitReached?: (req: any, res: any) => void;
    };
  }

  install(server: LoomServer): void {
    console.log(`[${this.name}] Installing Rate Limit plugin...`);

    // Rate limit 미들웨어 등록
    server.use((req: unknown, res: unknown, next: () => void) => {
      const request = req as {
        method: string;
        headers: Record<string, string>;
        url: string;
        ip?: string;
        connection?: { remoteAddress?: string };
        socket?: { remoteAddress?: string };
      };
      const response = res as {
        setHeader: (key: string, value: string) => void;
        statusCode: number;
        end: (data?: string) => void;
        writeHead: (
          statusCode: number,
          headers?: Record<string, string>,
        ) => void;
      };

      try {
        this.handleRateLimit(request, response, next);
      } catch (error) {
        console.error(`[${this.name}] Error handling rate limit:`, error);
        next();
      }
    });

    // 주기적으로 만료된 엔트리 정리
    this.startCleanupTimer();

    console.log(`[${this.name}] Rate Limit plugin installed successfully`);
  }

  private handleRateLimit(
    request: {
      method: string;
      headers: Record<string, string>;
      url: string;
      ip?: string;
      connection?: { remoteAddress?: string };
      socket?: { remoteAddress?: string };
    },
    response: {
      setHeader: (key: string, value: string) => void;
      statusCode: number;
      end: (data?: string) => void;
      writeHead: (statusCode: number, headers?: Record<string, string>) => void;
    },
    next: () => void,
  ): void {
    // skip 함수가 있고 true를 반환하면 rate limit을 적용하지 않음
    if (this.options.skip && this.options.skip(request)) {
      next();
      return;
    }

    // 클라이언트 식별키 생성
    const key = this.getClientKey(request);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // 현재 클라이언트의 rate limit 정보 가져오기
    let clientInfo = this.store.get(key);

    // 새로운 윈도우가 시작되었거나 첫 요청인 경우
    if (!clientInfo || clientInfo.resetTime <= windowStart) {
      clientInfo = {
        count: 1,
        resetTime: now + this.options.windowMs,
      };
      this.store.set(key, clientInfo);
    } else {
      // 기존 윈도우 내의 요청
      clientInfo.count++;
    }

    const remaining = Math.max(0, this.options.max - clientInfo.count);
    const resetTime = new Date(clientInfo.resetTime);

    // Rate limit 헤더 설정
    if (this.options.standardHeaders) {
      response.setHeader("RateLimit-Limit", this.options.max.toString());
      response.setHeader("RateLimit-Remaining", remaining.toString());
      response.setHeader(
        "RateLimit-Reset",
        Math.ceil(clientInfo.resetTime / 1000).toString(),
      );
    }

    if (this.options.legacyHeaders) {
      response.setHeader("X-RateLimit-Limit", this.options.max.toString());
      response.setHeader("X-RateLimit-Remaining", remaining.toString());
      response.setHeader(
        "X-RateLimit-Reset",
        Math.ceil(clientInfo.resetTime / 1000).toString(),
      );
    }

    // Rate limit 초과 검사
    if (clientInfo.count > this.options.max) {
      // onLimitReached 콜백 호출
      if (this.options.onLimitReached) {
        this.options.onLimitReached(request, response);
      }

      // Retry-After 헤더 설정
      const retryAfter = Math.ceil((clientInfo.resetTime - now) / 1000);
      response.setHeader("Retry-After", retryAfter.toString());

      // 429 Too Many Requests 응답
      response.statusCode = this.options.statusCode;
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify({
          error: "Too Many Requests",
          message: this.options.message,
          statusCode: this.options.statusCode,
          retryAfter: retryAfter,
          resetTime: resetTime.toISOString(),
        }),
      );
      return;
    }

    next();
  }

  private getClientKey(request: {
    ip?: string;
    connection?: { remoteAddress?: string };
    socket?: { remoteAddress?: string };
    headers: Record<string, string>;
  }): string {
    // 사용자 정의 키 생성 함수가 있으면 사용
    if (this.options.keyGenerator) {
      return this.options.keyGenerator(request);
    }

    // IP 주소 추출 (여러 소스에서 시도)
    const ip =
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      request.headers["x-real-ip"] ||
      request.headers["x-client-ip"] ||
      "unknown";

    return `ip:${ip}`;
  }

  private startCleanupTimer(): void {
    // 매 5분마다 만료된 엔트리 정리
    this.cleanupTimer = setInterval(
      () => {
        const now = Date.now();
        for (const [key, info] of this.store.entries()) {
          if (info.resetTime <= now) {
            this.store.delete(key);
          }
        }
      },
      5 * 60 * 1000,
    ); // 5분
  }

  /**
   * 특정 클라이언트의 rate limit 정보를 초기화합니다.
   * @param key 클라이언트 키 (IP 주소 등)
   */
  public resetClient(key: string): void {
    this.store.delete(key);
  }

  /**
   * 모든 클라이언트의 rate limit 정보를 초기화합니다.
   */
  public resetAll(): void {
    this.store.clear();
  }

  /**
   * 현재 저장된 클라이언트 수를 반환합니다.
   */
  public getClientCount(): number {
    return this.store.size;
  }

  /**
   * 특정 클라이언트의 현재 rate limit 정보를 반환합니다.
   * @param key 클라이언트 키
   */
  public getClientInfo(key: string): RateLimitInfo | undefined {
    return this.store.get(key);
  }

  /**
   * 플러그인 정리 (테스트용)
   */
  public cleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.store.clear();
  }
}
