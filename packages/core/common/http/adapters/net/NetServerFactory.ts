import { ServerFactory } from "../../ServerFactory";
import { HttpServer } from "../../interfaces";
import { NetServerAdapter } from "./NetServerAdapter";

/**
 * Net 서버 팩토리
 * Node.js net 모듈을 사용한 로우레벨 HTTP 서버를 생성합니다.
 */
export class NetServerFactory implements ServerFactory {
  createServer(): HttpServer {
    return new NetServerAdapter();
  }
}
