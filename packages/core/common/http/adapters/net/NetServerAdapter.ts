/* eslint-disable @typescript-eslint/no-explicit-any */
import * as net from "net";
import * as url from "url";
import * as querystring from "querystring";
import { HttpServer, ServerOptions, HttpRouteRegistry } from "../../interfaces";
import { NetRouteRegistry } from "./NetRouteRegistry";
import { NetRequestAdapter } from "./NetRequestAdapter";
import { NetResponseAdapter } from "./NetResponseAdapter";

/**
 * Node.js net 모듈을 사용한 로우레벨 HTTP 서버 구현체
 * TCP 소켓을 직접 다루어 HTTP 프로토콜을 구현합니다.
 */
export class NetServerAdapter implements HttpServer {
  private server?: net.Server;
  private routeRegistry: NetRouteRegistry;

  constructor() {
    this.routeRegistry = new NetRouteRegistry();
  }

  async start(options: ServerOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        this.handleConnection(socket);
      });

      this.server.listen(options.port, options.host, () => {
        console.log(
          `Net Server is running on http://${options.host || "localhost"}:${options.port}`,
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
            console.log("Net Server has been stopped");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  getInstance(): net.Server | undefined {
    return this.server;
  }

  getRouteRegistry(): HttpRouteRegistry {
    return this.routeRegistry;
  }

  private handleConnection(socket: net.Socket): void {
    let buffer = "";
    let requestProcessed = false;

    const processRequest = async () => {
      if (requestProcessed) return;
      requestProcessed = true;

      try {
        console.log(`Received request: ${buffer.split("\r\n")[0]}`);
        const request = this.parseHttpRequest(buffer);
        const response = new NetResponseAdapter(socket);

        // 라우트 매칭 및 핸들러 실행
        const handler = this.routeRegistry.findHandler(
          request.method.toLowerCase(),
          request.path,
        );

        if (handler) {
          await handler(request, response);
        } else {
          // 404 Not Found
          response.status(404).json({
            error: "Not Found",
            message: `Cannot ${request.method} ${request.path}`,
            statusCode: 404,
          });
        }
      } catch (error) {
        console.error("Request handling error:", error);
        this.sendErrorResponse(socket, 500, "Internal Server Error");
      }
    };

    socket.on("data", async (data) => {
      buffer += data.toString();

      // HTTP 요청이 완성되었는지 확인 (헤더 끝을 찾음)
      const headerEndIndex = buffer.indexOf("\r\n\r\n");
      if (headerEndIndex !== -1 && !requestProcessed) {
        await processRequest();
      }
    });

    socket.on("end", async () => {
      if (!requestProcessed && buffer.length > 0) {
        await processRequest();
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      if (!socket.destroyed) {
        socket.destroy();
      }
    });

    // 타임아웃 설정 (30초)
    socket.setTimeout(30000, () => {
      console.log("Socket timeout, closing connection");
      if (!socket.destroyed) {
        socket.destroy();
      }
    });
  }

  private parseHttpRequest(rawRequest: string): NetRequestAdapter {
    const lines = rawRequest.split("\r\n");
    const requestLine = lines[0];
    const [method, fullPath, version] = requestLine.split(" ");

    // URL 파싱
    const parsedUrl = url.parse(fullPath, true);
    const path = parsedUrl.pathname || "/";
    const query = parsedUrl.query || {};

    // 헤더 파싱
    const headers: Record<string, string> = {};
    let bodyStartIndex = -1;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === "") {
        bodyStartIndex = i + 1;
        break;
      }
      const [key, value] = lines[i].split(": ");
      if (key && value) {
        headers[key.toLowerCase()] = value;
      }
    }

    // 바디 파싱
    let body: any = {};
    if (bodyStartIndex > -1 && method !== "GET" && method !== "HEAD") {
      const bodyLines = lines.slice(bodyStartIndex);
      const bodyContent = bodyLines.join("\r\n");

      if (bodyContent.trim()) {
        const contentType = headers["content-type"] || "";

        try {
          if (contentType.includes("application/json")) {
            body = JSON.parse(bodyContent);
          } else if (
            contentType.includes("application/x-www-form-urlencoded")
          ) {
            body = querystring.parse(bodyContent);
          } else {
            body = { _raw: bodyContent, _type: "unknown" };
          }
        } catch (error) {
          body = { _raw: bodyContent, _error: "Parse error" };
        }
      }
    }

    return new NetRequestAdapter({
      method,
      path,
      query,
      headers,
      body,
      version,
      socket: undefined, // 소켓 정보는 필요시 추가
    });
  }

  private sendErrorResponse(
    socket: net.Socket,
    statusCode: number,
    message: string,
  ): void {
    const response = JSON.stringify({
      error: message,
      statusCode,
    });

    const httpResponse = [
      `HTTP/1.1 ${statusCode} ${message}`,
      "Content-Type: application/json",
      "Content-Length: " + Buffer.byteLength(response),
      "Connection: close",
      "",
      response,
    ].join("\r\n");

    socket.write(httpResponse);
  }
}
