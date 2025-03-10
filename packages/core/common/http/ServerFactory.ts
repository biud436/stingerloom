import { HttpServer } from "./interfaces";

/**
 * 서버 팩토리 인터페이스
 * 서버 인스턴스 생성을 추상화
 */
export interface ServerFactory {
  /** 새로운 서버 인스턴스를 생성하는 메서드 */
  createServer(): HttpServer;
}
