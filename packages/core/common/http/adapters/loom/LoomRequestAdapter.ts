/* eslint-disable @typescript-eslint/no-explicit-any */
import * as http from "http";
import * as url from "url";
import { HttpRequest } from "../../interfaces";

/**
 * Loom 서버의 HTTP 요청 어댑터
 * Node.js의 기본 IncomingMessage를 HttpRequest 인터페이스로 변환합니다.
 */
export class LoomRequestAdapter implements HttpRequest {
  private _body: any;
  private _params: Record<string, string> = {};
  private _query: Record<string, unknown>;
  private _headers: Record<string, string>;
  private _cookies: Record<string, unknown> = {};

  constructor(
    private incomingMessage: http.IncomingMessage,
    parsedUrl: url.UrlWithParsedQuery,
    body: any,
  ) {
    this._body = body;
    this._query = parsedUrl.query || {};
    this._headers = this.parseHeaders(incomingMessage.headers);
    this._cookies = this.parseCookies();
  }

  get method(): string {
    return this.incomingMessage.method || "GET";
  }

  get url(): string {
    return this.incomingMessage.url || "/";
  }

  get body(): any {
    return this._body;
  }

  get params(): Record<string, string> {
    return this._params;
  }

  get query(): Record<string, unknown> {
    return this._query;
  }

  get headers(): Record<string, string> {
    return this._headers;
  }

  get session(): any {
    // 세션은 별도 미들웨어에서 구현되어야 함
    return undefined;
  }

  get ip(): string {
    const forwarded = this._headers["x-forwarded-for"];
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    const realIp = this._headers["x-real-ip"];
    if (realIp) {
      return realIp;
    }

    return this.incomingMessage.socket.remoteAddress || "unknown";
  }

  get cookies(): Record<string, unknown> {
    return this._cookies;
  }

  get hostname(): string {
    return this._headers["host"] || "localhost";
  }

  get userAgent(): string {
    return this._headers["user-agent"] || "";
  }

  header(name: string): string | undefined {
    return this._headers[name.toLowerCase()];
  }

  /**
   * URL 파라미터를 설정합니다 (라우터에서 호출됨)
   */
  setParams(params: Record<string, string>): void {
    this._params = params;
  }

  private parseHeaders(
    headers: http.IncomingHttpHeaders,
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === "string") {
        result[key.toLowerCase()] = value;
      } else if (Array.isArray(value)) {
        result[key.toLowerCase()] = value.join(", ");
      }
    }

    return result;
  }

  private parseCookies(): Record<string, unknown> {
    const cookieHeader = this._headers["cookie"];
    if (!cookieHeader) {
      return {};
    }

    const cookies: Record<string, unknown> = {};

    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      if (name && rest.length > 0) {
        cookies[name] = decodeURIComponent(rest.join("="));
      }
    });

    return cookies;
  }
}
