/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpRequest } from "../../interfaces";

/**
 * 로우레벨 HTTP 요청 데이터를 HttpRequest 인터페이스로 변환하는 어댑터
 */
export class NetRequestAdapter implements HttpRequest {
  private _method: string;
  private _path: string;
  private _query: Record<string, any>;
  private _headers: Record<string, string>;
  private _body: any;
  private _version: string;
  private _socket: any;

  constructor(data: {
    method: string;
    path: string;
    query: Record<string, any>;
    headers: Record<string, string>;
    body: any;
    version: string;
    socket: any;
  }) {
    this._method = data.method;
    this._path = data.path;
    this._query = data.query;
    this._headers = data.headers;
    this._body = data.body;
    this._version = data.version;
    this._socket = data.socket;
  }

  get method(): string {
    return this._method;
  }

  get url(): string {
    return this._path;
  }

  get path(): string {
    return this._path;
  }

  get query(): Record<string, any> {
    return this._query;
  }

  get params(): Record<string, any> {
    // URL 매개변수는 라우터에서 설정될 예정
    return {};
  }

  get headers(): Record<string, string> {
    return this._headers;
  }

  get body(): any {
    return this._body;
  }

  get cookies(): Record<string, string> {
    const cookieHeader = this._headers.cookie;
    if (!cookieHeader) {
      return {};
    }

    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        cookies[key] = decodeURIComponent(value);
      }
    });

    return cookies;
  }

  get ip(): string {
    return (
      this._headers["x-forwarded-for"] ||
      this._headers["x-real-ip"] ||
      "127.0.0.1"
    );
  }

  get userAgent(): string {
    return this._headers["user-agent"] || "";
  }

  get hostname(): string {
    return this._headers.host || "localhost";
  }

  get version(): string {
    return this._version;
  }

  header(name: string): string | undefined {
    return this._headers[name.toLowerCase()];
  }
}
