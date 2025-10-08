/* eslint-disable @typescript-eslint/no-explicit-any */
import * as net from "net";
import { HttpResponse } from "../../interfaces";
import { HttpStatus } from "@stingerloom/core/common/HttpStatus";

/**
 * TCP 소켓을 사용한 HTTP 응답 어댑터
 * 직접 HTTP 응답을 구성하여 소켓에 전송합니다.
 */
export class NetResponseAdapter implements HttpResponse {
  private _statusCode: number = HttpStatus.OK;
  private _headers: Record<string, string> = {};
  private _isHeadersSent: boolean = false;
  private _isResponseSent: boolean = false;

  constructor(private socket: net.Socket) {}

  status(code: number): this {
    if (this._isHeadersSent) {
      throw new Error("Cannot set status after headers have been sent");
    }
    this._statusCode = code;
    return this;
  }

  setHeader(name: string, value: string | number | string[]): this {
    if (this._isHeadersSent) {
      throw new Error("Cannot set headers after they have been sent");
    }
    this._headers[name] = Array.isArray(value)
      ? value.join(", ")
      : String(value);
    return this;
  }

  send(body: any): void {
    if (this._isResponseSent) {
      throw new Error("Response has already been sent");
    }

    const content = typeof body === "string" ? body : JSON.stringify(body);
    const contentType = this._headers["Content-Type"] || "text/plain";

    this.setHeader("Content-Type", contentType);
    this.setHeader("Content-Length", Buffer.byteLength(content));
    this.setHeader("Connection", "close");

    this._sendResponse(content);
  }

  json(body: any): void {
    if (this._isResponseSent) {
      throw new Error("Response has already been sent");
    }

    const content = JSON.stringify(body);
    this.setHeader("Content-Type", "application/json");
    this.setHeader("Content-Length", Buffer.byteLength(content));
    this.setHeader("Connection", "close");

    this._sendResponse(content);
  }

  view(path: string, data?: any): void {
    // 템플릿 엔진 구현은 나중에 추가
    const content = JSON.stringify({
      template: path,
      data: data || {},
      message: "Template rendering not implemented for NetServerAdapter",
    });

    this.setHeader("Content-Type", "application/json");
    this.setHeader("Content-Length", Buffer.byteLength(content));
    this.setHeader("Connection", "close");

    this._sendResponse(content);
  }

  cookie(
    name: string,
    value: string,
    options: {
      maxAge?: number;
      expires?: Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax" | "none";
    } = {},
  ): this {
    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }
    if (options.expires) {
      cookieString += `; Expires=${options.expires.toUTCString()}`;
    }
    if (options.path) {
      cookieString += `; Path=${options.path}`;
    }
    if (options.domain) {
      cookieString += `; Domain=${options.domain}`;
    }
    if (options.secure) {
      cookieString += "; Secure";
    }
    if (options.httpOnly) {
      cookieString += "; HttpOnly";
    }
    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }

    // Set-Cookie 헤더는 여러 개 가능하므로 배열로 처리
    const existingCookies = this._headers["Set-Cookie"];
    if (existingCookies) {
      this._headers["Set-Cookie"] = `${existingCookies}, ${cookieString}`;
    } else {
      this._headers["Set-Cookie"] = cookieString;
    }

    return this;
  }

  redirect(url: string, statusCode: number = 302): void {
    if (this._isResponseSent) {
      throw new Error("Response has already been sent");
    }

    this._statusCode = statusCode;
    this.setHeader("Location", url);
    this.setHeader("Content-Length", "0");
    this.setHeader("Connection", "close");

    this._sendResponse("");
  }

  private _sendResponse(content: string): void {
    if (this._isResponseSent) {
      return;
    }

    // HTTP 상태 메시지 매핑
    const statusMessages: Record<number, string> = {
      200: "OK",
      201: "Created",
      204: "No Content",
      302: "Found",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
    };

    const statusMessage = statusMessages[this._statusCode] || "Unknown";

    // HTTP 응답 구성
    const responseLines = [`HTTP/1.1 ${this._statusCode} ${statusMessage}`];

    // 헤더 추가
    Object.entries(this._headers).forEach(([key, value]) => {
      responseLines.push(`${key}: ${value}`);
    });

    // 빈 줄로 헤더와 바디 구분
    responseLines.push("");
    responseLines.push(content);

    const response = responseLines.join("\r\n");

    this._isHeadersSent = true;
    this._isResponseSent = true;

    // 소켓에 응답 전송 후 연결 종료
    this.socket.write(response, () => {
      console.log("Response sent, closing connection");
      if (!this.socket.destroyed) {
        this.socket.end();
      }
    });
  }
}
