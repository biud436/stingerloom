import { FastifyReply, FastifyRequest } from "fastify";
import { HttpContext } from "../../interfaces";
import type { HttpHandler } from "../../types";
import { FastifyRequestAdapter } from "./FastifyRequestAdapter";
import { FastifyResponseAdapter } from "./FastifyResponseAdapter";

/**
 * Fastify의 핸들러를 프레임워크의 핸들러로 변환하는 어댑터
 */
export class FastifyHandlerAdapter {
  static adapt(
    handler: HttpHandler,
  ): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const context: HttpContext = {
        request: new FastifyRequestAdapter(request),
        response: new FastifyResponseAdapter(reply),
      };

      return await handler(context);
    };
  }
}
