/* eslint-disable @typescript-eslint/no-explicit-any */
import * as http from "http";
import { HttpResponse } from "../../interfaces";

/**
 * Loom 서버의 HTTP 응답 어댑터
 * Node.js의 기본 ServerResponse를 HttpResponse 인터페이스로 변환합니다.
 */
export class LoomResponseAdapter implements HttpResponse {
  private _statusCode: number = 200;
  private _headers: Record<string, string> = {};
  private _sent: boolean = false;

  constructor(private serverResponse: http.ServerResponse) {
    console.log("LoomResponseAdapter initialized");
  }

  status(code: number): this {
    this._statusCode = code;
    return this;
  }

  send(body: any): void {
    if (this._sent) {
      console.warn("Response already sent");
      return;
    }

    this._sent = true;
    this.serverResponse.statusCode = this._statusCode;

    // 헤더 설정
    for (const [key, value] of Object.entries(this._headers)) {
      this.serverResponse.setHeader(key, value);
    }

    // Content-Type이 설정되지 않은 경우 기본값 설정
    if (!this._headers["content-type"]) {
      if (typeof body === "object") {
        this.serverResponse.setHeader("Content-Type", "application/json");
        this.serverResponse.end(JSON.stringify(body));
      } else if (typeof body === "string") {
        this.serverResponse.setHeader("Content-Type", "text/plain");
        this.serverResponse.end(body);
      } else {
        this.serverResponse.setHeader("Content-Type", "text/plain");
        this.serverResponse.end(String(body));
      }
    } else {
      if (
        typeof body === "object" &&
        this._headers["content-type"].includes("application/json")
      ) {
        this.serverResponse.end(JSON.stringify(body));
      } else {
        this.serverResponse.end(String(body));
      }
    }
  }

  json(body: any): void {
    if (this._sent) {
      console.warn("Response already sent");
      return;
    }

    console.log("Sending JSON response:", body);

    this._sent = true;
    this.serverResponse.statusCode = this._statusCode;

    // 헤더 설정
    for (const [key, value] of Object.entries(this._headers)) {
      this.serverResponse.setHeader(key, value);
    }

    this.serverResponse.setHeader("Content-Type", "application/json");
    this.serverResponse.end(JSON.stringify(body));
  }

  setHeader(name: string, value: string): this {
    this._headers[name.toLowerCase()] = value;
    return this;
  }

  view(path: string, data: any): void {
    // 뷰 엔진 구현은 추후 확장 가능
    // 현재는 간단히 JSON으로 응답
    this.json({
      template: path,
      data: data,
      message: "View rendering not implemented yet",
    });
  }

  /**
   * 쿠키를 설정합니다.
   */
  setCookie(
    name: string,
    value: string,
    options?: {
      maxAge?: number;
      domain?: string;
      path?: string;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax" | "none";
    },
  ): this {
    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options) {
      if (options.maxAge) {
        cookieString += `; Max-Age=${options.maxAge}`;
      }
      if (options.domain) {
        cookieString += `; Domain=${options.domain}`;
      }
      if (options.path) {
        cookieString += `; Path=${options.path}`;
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
    }

    const existingCookies = this._headers["set-cookie"] || "";
    if (existingCookies) {
      this._headers["set-cookie"] = `${existingCookies}, ${cookieString}`;
    } else {
      this._headers["set-cookie"] = cookieString;
    }

    return this;
  }

  /**
   * 리다이렉트를 수행합니다.
   */
  redirect(url: string, statusCode: number = 302): void {
    this.status(statusCode).setHeader("Location", url).send("");
  }
}
