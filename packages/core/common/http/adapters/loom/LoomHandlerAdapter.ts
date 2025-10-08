/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpStatus } from "@stingerloom/core/common/HttpStatus";
import { HttpRequest, HttpResponse, HttpContext } from "../../interfaces";
import { HttpHandler } from "../../types";

/**
 * Loom 서버의 핸들러 어댑터
 * 컨트롤러 메서드를 Loom 서버의 핸들러 형식으로 변환합니다.
 */
export class LoomHandlerAdapter {
  /**
   * 컨트롤러 메서드를 HttpHandler로 변환합니다.
   */
  static adapt(
    handleRouteRequest: (...args: any[]) => any,
    target: any,
  ): HttpHandler {
    return async (context: HttpContext): Promise<void> => {
      const { request, response } = context;
      try {
        // 컨트롤러 메서드 실행
        const result = await handleRouteRequest.call(target, request, response);

        // 결과가 있고 아직 응답이 전송되지 않았다면 JSON으로 응답
        if (result !== undefined && !this.isResponseSent(response)) {
          response.json(result);
        }
      } catch (error) {
        if (!this.isResponseSent(response)) {
          const status =
            (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;

          response.status(status).json({
            error: "Internal Server Error",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
            statusCode: status,
          });
        }
      }
    };
  }

  /**
   * 응답이 이미 전송되었는지 확인합니다.
   */
  private static isResponseSent(response: HttpResponse): boolean {
    // LoomResponseAdapter의 _sent 프로퍼티 확인
    return (response as any)._sent === true;
  }

  /**
   * 함수형 핸들러를 HttpHandler로 변환합니다.
   */
  static adaptFunction(
    handlerFunction: (req: HttpRequest, res: HttpResponse) => Promise<any>,
  ): HttpHandler {
    return async (context: HttpContext): Promise<void> => {
      const { request, response } = context;

      try {
        const result = await handlerFunction(request, response);

        if (result !== undefined && !this.isResponseSent(response)) {
          response.json(result);
        }
      } catch (error) {
        console.error("Handler function execution error:", error);

        if (!this.isResponseSent(response)) {
          const status =
            (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
          response.status(status).json({
            error: "Internal Server Error",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
            statusCode: status,
          });
        }
      }
    };
  }
}
