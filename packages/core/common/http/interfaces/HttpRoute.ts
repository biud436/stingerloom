import { Middleware } from "./Middleware";
import { HttpMethod } from "../../HttpMethod";
import { HttpHandler } from "../types";
/**
 * HTTP 라우트의 구조를 정의하는 인터페이스
 * 각 엔드포인트의 설정을 담당
 */

export interface HttpRoute {
  /** 라우트의 URL 경로 */
  path: string;
  /** HTTP 메서드 (GET, POST 등) */
  method: HttpMethod;
  /** 요청을 처리할 핸들러 함수 */
  handler: HttpHandler;
  /** 미들웨어 함수들의 배열 (옵션) */
  middleware?: Middleware[];
}
