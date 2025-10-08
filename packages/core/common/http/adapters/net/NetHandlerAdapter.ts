import { HttpContext } from "../../interfaces";
import type { HttpHandler } from "../../types";
import { NetRequestAdapter } from "./NetRequestAdapter";
import { NetResponseAdapter } from "./NetResponseAdapter";

/**
 * Net 서버의 핸들러를 프레임워크의 핸들러로 변환하는 어댑터
 */
export class NetHandlerAdapter {
  static adapt(
    handler: HttpHandler,
  ): (
    request: NetRequestAdapter,
    response: NetResponseAdapter,
  ) => Promise<void> {
    return async (request: NetRequestAdapter, response: NetResponseAdapter) => {
      const context: HttpContext = {
        request,
        response,
      };

      return await handler(context);
    };
  }
}
