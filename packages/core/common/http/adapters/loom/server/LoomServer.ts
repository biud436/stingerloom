/* eslint-disable @typescript-eslint/no-explicit-any */
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as url from "url";
import * as querystring from "querystring";
import {
  HttpServer,
  ServerOptions,
  HttpRouteRegistry,
  ServerPlugin,
} from "../../../interfaces";
import { LoomRouteRegistry } from "../LoomRouteRegistry";
import { LoomRequestAdapter } from "../LoomRequestAdapter";
import { LoomResponseAdapter } from "../LoomResponseAdapter";
import { HttpStatus } from "@stingerloom/core/common/HttpStatus";

/**
 * Loom 서버 전용 미들웨어 타입
 * Node.js의 기본 IncomingMessage와 ServerResponse를 사용
 */
export type LoomMiddleware = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: (error?: any) => void,
) => void;

/**
 * Stingerloom 프레임워크의 네이티브 HTTP 서버 구현체
 * Node.js의 기본 http/https 모듈을 사용하여 구현됩니다.
 *
 * 지원 기능:
 * - HTTP/HTTPS 프로토콜
 * - 플러그인 시스템
 * - 고급 라우팅
 * - 미들웨어 체인
 * - 커스텀 어댑터 패턴
 */
export class LoomServer implements HttpServer {
  private server?: http.Server | https.Server;
  private routeRegistry: LoomRouteRegistry;
  private middlewares: LoomMiddleware[] = [];
  private plugins: Map<string, ServerPlugin> = new Map();
  private serverOptions?: ServerOptions;

  constructor() {
    this.routeRegistry = new LoomRouteRegistry();
  }

  async start(options: ServerOptions): Promise<void> {
    this.serverOptions = options;

    return new Promise((resolve, reject) => {
      try {
        // HTTPS 서버 또는 HTTP 서버 생성
        if (options.https) {
          const httpsOptions: https.ServerOptions = {
            key: fs.readFileSync(options.https.key),
            cert: fs.readFileSync(options.https.cert),
          };

          if (options.https.ca) {
            httpsOptions.ca = fs.readFileSync(options.https.ca);
          }

          this.server = https.createServer(httpsOptions, (req, res) => {
            this.handleRequest(req, res);
          });
        } else {
          this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
          });
        }

        // 서버 설정 적용
        if (options.timeout) {
          this.server.timeout = options.timeout;
        }

        if (options.keepAliveTimeout) {
          this.server.keepAliveTimeout = options.keepAliveTimeout;
        }

        // 플러그인 설치
        if (options.plugins) {
          for (const plugin of options.plugins) {
            this.installPlugin(plugin);
          }
        }

        this.server.listen(options.port, options.host, () => {
          const protocol = options.https ? "https" : "http";
          console.log(
            `Loom Server is running on ${protocol}://${options.host || "localhost"}:${options.port}`,
          );
          resolve();
        });

        this.server.on("error", (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error) => {
          if (error) {
            reject(error);
          } else {
            console.log("Loom Server has been stopped");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  getInstance(): http.Server | undefined {
    return this.server;
  }

  getRouteRegistry(): HttpRouteRegistry {
    return this.routeRegistry;
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> {
    try {
      const parsedUrl = url.parse(req.url || "", true);
      const pathname = parsedUrl.pathname || "/";
      const method = req.method?.toUpperCase() || "GET";

      // 미들웨어 실행
      await this.executeMiddlewares(req, res);

      // 응답이 이미 전송되었으면 종료
      if (res.headersSent || res.writableEnded) {
        return;
      }

      // 요청 본문 읽기
      const body = await this.readRequestBody(req);

      // 어댑터 생성
      const request = new LoomRequestAdapter(req, parsedUrl, body);
      const response = new LoomResponseAdapter(res);

      // 라우트 매칭 및 핸들러 실행
      const handler = this.routeRegistry.findHandler(method, pathname);

      if (handler) {
        await handler(request, response);
      } else {
        // 404 Not Found
        response.status(HttpStatus.NOT_FOUND).json({
          error: "Not Found",
          message: `Cannot ${method} ${pathname}`,
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
    } catch (error) {
      console.error("Request handling error:", error);
      res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Internal Server Error",
          message: "An unexpected error occurred",
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    }
  }

  private readRequestBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve) => {
      // GET, HEAD, DELETE 요청은 일반적으로 body가 없으므로 즉시 반환
      const method = req.method?.toUpperCase();
      if (method === "GET" || method === "HEAD" || method === "DELETE") {
        console.log(
          `[DEBUG] ${method} request - no body expected, returning empty object`,
        );
        resolve({});
        return;
      }

      let body = "";
      const chunks: Buffer[] = [];
      let isResolved = false;

      // 타임아웃 설정 (10초로 단축)
      const timeout = setTimeout(() => {
        if (!isResolved) {
          console.error("[ERROR] Request body read timeout");
          isResolved = true;
          resolve({ _error: "Request timeout" });
        }
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeout);
        isResolved = true;
      };

      req.on("data", (chunk: Buffer) => {
        if (!isResolved) {
          chunks.push(chunk);
          body += chunk.toString("utf8");
        }
      });

      req.on("end", () => {
        if (isResolved) return;

        cleanup();

        try {
          // Content-Type에 따라 파싱
          const contentType = req.headers["content-type"] || "";

          // 빈 본문 처리
          if (!body || body.trim() === "") {
            console.log("[DEBUG] Empty body, returning empty object");
            resolve({});
            return;
          }

          if (contentType.includes("application/json")) {
            try {
              const parsed = JSON.parse(body);
              resolve(parsed);
            } catch (jsonError) {
              resolve({ _raw: body, _error: "Invalid JSON" });
            }
          } else if (
            contentType.includes("application/x-www-form-urlencoded")
          ) {
            const parsed = querystring.parse(body);
            resolve(parsed);
          } else if (contentType.includes("multipart/form-data")) {
            resolve({ _raw: body, _type: "multipart" });
          } else {
            resolve({ _raw: body, _type: "unknown" });
          }
        } catch (error) {
          console.error("[ERROR] Body parsing error:", error);
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          resolve({ _raw: body, _error: errorMessage });
        }
      });

      req.on("error", (error) => {
        if (isResolved) return;

        cleanup();
        console.error("[ERROR] Request error while reading body:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        resolve({ _error: errorMessage });
      });

      // 요청이 이미 끝났을 수도 있으므로 체크
      if (req.readableEnded) {
        console.log("[DEBUG] Request already ended, processing empty body");
        cleanup();
        resolve({});
      }
    });
  }

  /**
   * 플러그인을 설치합니다.
   */
  private installPlugin(plugin: ServerPlugin): void {
    console.log(`Installing plugin: ${plugin.name}`);
    this.plugins.set(plugin.name, plugin);

    if (typeof plugin.install === "function") {
      plugin.install(this);
    }
  }

  /**
   * 플러그인을 수동으로 설치합니다 (테스트용).
   */
  public addPlugin(plugin: ServerPlugin): void {
    this.installPlugin(plugin);
  }

  /**
   * 미들웨어를 추가합니다.
   */
  public use(middleware: LoomMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * 설치된 플러그인을 가져옵니다.
   */
  public getPlugin(name: string): ServerPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 모든 설치된 플러그인을 가져옵니다.
   */
  public getPlugins(): Map<string, any> {
    return this.plugins;
  }

  /**
   * 서버 어댑터 팩토리 메서드
   * 다양한 백엔드 서버를 생성할 수 있습니다.
   */
  public static createWithAdapter(
    adapterType: "http" | "https" | "net" = "http",
  ): LoomServer {
    const server = new LoomServer();

    // 어댑터별 초기 설정
    switch (adapterType) {
      case "https":
        console.log("Loom Server configured for HTTPS");
        break;
      case "net":
        console.log("Loom Server configured for low-level networking");
        break;
      default:
        console.log("Loom Server configured for HTTP");
    }

    return server;
  }

  /**
   * 서버 상태 정보를 반환합니다.
   */
  public getServerInfo(): any {
    return {
      isRunning: !!this.server && this.server.listening,
      options: this.serverOptions,
      pluginCount: this.plugins.size,
      middlewareCount: this.middlewares.length,
      routes: this.routeRegistry.getAllRoutes?.() || [],
    };
  }

  /**
   * 미들웨어들을 순차적으로 실행합니다.
   */
  private async executeMiddlewares(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let currentIndex = 0;

      const next = (error?: any): void => {
        if (error) {
          reject(error);
          return;
        }

        if (currentIndex >= this.middlewares.length) {
          resolve();
          return;
        }

        const middleware = this.middlewares[currentIndex++];

        try {
          middleware(req, res, next);
        } catch (error) {
          reject(error);
        }
      };

      next();
    });
  }
}
