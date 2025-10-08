/* eslint-disable @typescript-eslint/no-explicit-any */
import * as http from "http";
import * as url from "url";
import * as querystring from "querystring";
import {
  HttpServer,
  ServerOptions,
  HttpRouteRegistry,
} from "../../../interfaces";
import { LoomRouteRegistry } from "../LoomRouteRegistry";
import { LoomRequestAdapter } from "../LoomRequestAdapter";
import { LoomResponseAdapter } from "../LoomResponseAdapter";

/**
 * Stingerloom 프레임워크의 네이티브 HTTP 서버 구현체
 * Node.js의 기본 http 모듈을 사용하여 구현됩니다.
 */
export class LoomServer implements HttpServer {
  private server?: http.Server;
  private routeRegistry: LoomRouteRegistry;

  constructor() {
    this.routeRegistry = new LoomRouteRegistry();
  }

  async start(options: ServerOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(options.port, options.host, () => {
        console.log(
          `🚀 Loom Server is running on http://${options.host || "localhost"}:${options.port}`,
        );
        resolve();
      });

      this.server.on("error", (error) => {
        reject(error);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error) => {
          if (error) {
            reject(error);
          } else {
            console.log("🛑 Loom Server has been stopped");
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
        response.status(404).json({
          error: "Not Found",
          message: `Cannot ${method} ${pathname}`,
          statusCode: 404,
        });
      }
    } catch (error) {
      console.error("Request handling error:", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Internal Server Error",
          message: "An unexpected error occurred",
          statusCode: 500,
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
}
