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

  /**
   * 새로운 Loom 서버 인스턴스를 생성합니다.
   */
  static create(): HttpServer {
    const factory = new LoomServerFactory();
    return factory.createServer();
  }

  /**
   * 옵션과 함께 Loom 서버 인스턴스를 생성합니다.
   */
  static createWithOptions(options?: {
    cors?: boolean;
    compression?: boolean;
    logging?: boolean;
  }): HttpServer {
    const server = LoomServerFactory.create();

    // 기본 미들웨어 설정 (추후 확장 가능)
    if (options?.cors) {
      console.log("CORS enabled for Loom server");
    }

    if (options?.compression) {
      console.log("Compression enabled for Loom server");
    }

    if (options?.logging) {
      console.log("Logging enabled for Loom server");
    }

    return server;
  }
}
