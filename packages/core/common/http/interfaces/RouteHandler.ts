/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";

/**
 * 라우트 핸들러 함수의 타입 정의
 * 요청을 받아서 응답을 생성하는 함수
 */
export type RouteHandler = (
    request: HttpRequest,
    response: HttpResponse,
) => Promise<any>;
