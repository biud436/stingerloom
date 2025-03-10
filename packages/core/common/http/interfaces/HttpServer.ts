/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpRouteRegistry } from "./HttpRouteRegistry";
import { ServerOptions } from "./ServerOptions";

/**
 * HTTP 서버의 기본 동작을 정의하는 인터페이스
 */
export interface HttpServer {
  /**
   * 서버를 시작합니다.
   * @param options 포트, 호스트 등 서버 시작에 필요한 옵션
   */
  start(options: ServerOptions): Promise<void>;

  /**
   * 서버를 안전하게 종료합니다.
   */
  stop(): Promise<void>;

  /**
   * 실제 서버 인스턴스를 반환합니다.
   */
  getInstance(): any;

  /**
   * HttpRouteRegistry를 반환합니다.
   */
  getRouteRegistry(): HttpRouteRegistry;
}
