/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpServer } from "../../interfaces";
import { ServerFactory } from "../../ServerFactory";
import { LoomServer } from "./server";
import { LoomServerAdapter } from "./LoomServerAdapter";

/**
 * Loom 서버 팩토리
 * Loom 서버 인스턴스를 생성하고 설정합니다.
 */
export class LoomServerFactory implements ServerFactory {
  /**
   * ServerFactory 인터페이스 구현
   */
  createServer(): HttpServer {
    const loomServer = new LoomServer();
    return new LoomServerAdapter(loomServer);
  }
}
