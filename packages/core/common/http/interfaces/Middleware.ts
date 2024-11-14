import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";

/**
 * 미들웨어 함수의 타입 정의
 * 요청 처리 전/후에 실행되는 함수
 */

export type Middleware = (
    request: HttpRequest,
    response: HttpResponse,
    next: () => Promise<void>,
) => Promise<void>;
