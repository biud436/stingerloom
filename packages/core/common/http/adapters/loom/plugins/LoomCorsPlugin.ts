/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerPlugin } from "../../../interfaces";
import { LoomServer } from "../server/LoomServer";

/**
 * CORS (Cross-Origin Resource Sharing) 플러그인 옵션
 */
export interface CorsOptions {
  /** 허용할 Origin (기본값: "*") */
  origin?: string | string[] | ((origin: string) => boolean);
  /** 허용할 HTTP 메서드들 (기본값: "GET,HEAD,PUT,PATCH,POST,DELETE") */
  methods?: string | string[];
  /** 허용할 헤더들 (기본값: "Content-Type,Authorization") */
  allowedHeaders?: string | string[];
  /** 노출할 헤더들 */
  exposedHeaders?: string | string[];
  /** 자격 증명 허용 여부 (기본값: false) */
  credentials?: boolean;
  /** Preflight 요청의 최대 캐시 시간 (초) */
  maxAge?: number;
  /** OPTIONS 요청을 성공으로 처리할지 여부 (기본값: true) */
  optionsSuccessStatus?: number;
  /** Preflight 요청 계속 처리 여부 (기본값: false) */
  preflightContinue?: boolean;
}

/**
 * Loom 서버용 CORS 플러그인
 * Cross-Origin 요청을 처리하기 위한 헤더를 자동으로 설정합니다.
 */
export class LoomCorsPlugin implements ServerPlugin {
  public readonly name = "loom-cors";
  private readonly options: Required<CorsOptions>;

  constructor(options: CorsOptions = {}) {
    this.options = {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: "Content-Type,Authorization",
      exposedHeaders: "",
      credentials: false,
      maxAge: 86400, // 24시간
      optionsSuccessStatus: 204,
      preflightContinue: false,
      ...options,
    } as Required<CorsOptions>;
  }

  install(server: LoomServer): void {
    console.log(`[${this.name}] Installing CORS plugin...`);

    // CORS 미들웨어 등록
    server.use((req: unknown, res: unknown, next: () => void) => {
      const request = req as {
        method: string;
        headers: Record<string, string>;
        url: string;
      };
      const response = res as {
        setHeader: (key: string, value: string) => void;
        statusCode: number;
        end: () => void;
        writeHead: (
          statusCode: number,
          headers?: Record<string, string>,
        ) => void;
      };

      try {
        this.handleCors(request, response, next);
      } catch (error) {
        console.error(`[${this.name}] Error handling CORS:`, error);
        next();
      }
    });

    console.log(`[${this.name}] CORS plugin installed successfully`);
  }

  private handleCors(
    request: { method: string; headers: Record<string, string>; url: string },
    response: {
      setHeader: (key: string, value: string) => void;
      statusCode: number;
      end: () => void;
      writeHead: (statusCode: number, headers?: Record<string, string>) => void;
    },
    next: () => void,
  ): void {
    const origin = request.headers.origin || request.headers.host || "";

    // Access-Control-Allow-Origin 설정
    if (this.isOriginAllowed(origin)) {
      if (
        typeof this.options.origin === "string" &&
        this.options.origin === "*"
      ) {
        response.setHeader("Access-Control-Allow-Origin", "*");
      } else {
        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Vary", "Origin");
      }
    }

    // Access-Control-Allow-Credentials 설정
    if (this.options.credentials) {
      response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    // Access-Control-Expose-Headers 설정
    if (this.options.exposedHeaders) {
      const exposedHeaders = Array.isArray(this.options.exposedHeaders)
        ? this.options.exposedHeaders.join(",")
        : this.options.exposedHeaders;
      response.setHeader("Access-Control-Expose-Headers", exposedHeaders);
    }

    // Preflight 요청 처리 (OPTIONS 메서드)
    if (request.method === "OPTIONS") {
      this.handlePreflightRequest(request, response, next);
      return;
    }

    // 일반 요청은 다음 미들웨어로
    next();
  }

  private handlePreflightRequest(
    request: { method: string; headers: Record<string, string>; url: string },
    response: {
      setHeader: (key: string, value: string) => void;
      statusCode: number;
      end: () => void;
      writeHead: (statusCode: number, headers?: Record<string, string>) => void;
    },
    next: () => void,
  ): void {
    console.log(`[${this.name}] Handling preflight request for ${request.url}`);

    // Access-Control-Allow-Methods 설정
    const methods = Array.isArray(this.options.methods)
      ? this.options.methods.join(",")
      : this.options.methods;
    response.setHeader("Access-Control-Allow-Methods", methods);

    // Access-Control-Allow-Headers 설정
    const requestedHeaders = request.headers["access-control-request-headers"];
    if (requestedHeaders) {
      // 클라이언트가 요청한 헤더들을 허용
      response.setHeader("Access-Control-Allow-Headers", requestedHeaders);
    } else {
      // 기본 허용 헤더들 설정
      const allowedHeaders = Array.isArray(this.options.allowedHeaders)
        ? this.options.allowedHeaders.join(",")
        : this.options.allowedHeaders;
      response.setHeader("Access-Control-Allow-Headers", allowedHeaders);
    }

    // Access-Control-Max-Age 설정
    if (this.options.maxAge > 0) {
      response.setHeader(
        "Access-Control-Max-Age",
        this.options.maxAge.toString(),
      );
    }

    // Preflight 응답 처리
    if (this.options.preflightContinue) {
      next();
    } else {
      response.statusCode = this.options.optionsSuccessStatus;
      response.end();
    }
  }

  private isOriginAllowed(origin: string): boolean {
    if (!this.options.origin) return false;

    if (typeof this.options.origin === "string") {
      return this.options.origin === "*" || this.options.origin === origin;
    }

    if (Array.isArray(this.options.origin)) {
      return this.options.origin.includes(origin);
    }

    if (typeof this.options.origin === "function") {
      return this.options.origin(origin);
    }

    return false;
  }

  /**
   * 플러그인 설정 정보를 반환합니다.
   */
  public getConfig(): CorsOptions {
    return { ...this.options };
  }

  /**
   * Origin이 허용되는지 확인합니다.
   */
  public checkOrigin(origin: string): boolean {
    return this.isOriginAllowed(origin);
  }

  /**
   * 동적으로 CORS 설정을 업데이트합니다.
   */
  public updateConfig(newOptions: Partial<CorsOptions>): void {
    Object.assign(this.options, newOptions);
    console.log(`[${this.name}] CORS configuration updated`);
  }
}
