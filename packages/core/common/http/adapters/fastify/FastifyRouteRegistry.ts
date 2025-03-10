/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpContext,
  HttpError,
  HttpRoute,
  HttpRouteRegistry,
} from "../../interfaces";

import { FastifyInstance } from "fastify";
import { FastifyHandlerAdapter } from "./FastifyHandlerAdapter";
import {
  ExceptionHandler,
  FastifyRequestAdapter,
  FastifyResponseAdapter,
  HttpMethod,
} from "../../../";
import { Exception } from "@stingerloom/core/error";

export class FastifyRouteRegistry implements HttpRouteRegistry {
  constructor(
    private app: FastifyInstance,
    private readonly exceptionHandler: ExceptionHandler,
  ) {}

  register(route: HttpRoute): void {
    const handler = FastifyHandlerAdapter.adapt(route.handler);

    const targetMethod = route.method.toLowerCase() as HttpMethod;

    this.app[targetMethod](route.path, handler);
  }

  registerExceptionHandler(): void {
    this.app.setErrorHandler(async (error, request, reply) => {
      const context: HttpContext = {
        request: new FastifyRequestAdapter(request),
        response: new FastifyResponseAdapter(reply),
      };

      const { status, body } = await this.exceptionHandler.handleException(
        {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: +error.code,
          status: (error as unknown as Exception).status || error.statusCode,
        } as HttpError,
        context,
      );

      reply.status(status).send(body);
    });
  }
}
