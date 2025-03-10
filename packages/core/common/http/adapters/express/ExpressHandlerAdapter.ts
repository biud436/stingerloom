import { Request, Response } from "express";
import { HttpContext } from "../../interfaces";
import type { HttpHandler } from "../../types";
import { ExpressRequestAdapter } from "./ExpressRequestAdapter";
import { ExpressResponseAdapter } from "./ExpressResponseAdapter";

export class ExpressHandlerAdapter {
  static adapt(
    handler: HttpHandler,
  ): (request: Request, response: Response) => Promise<void> {
    return async (request: Request, response: Response) => {
      const context: HttpContext = {
        request: new ExpressRequestAdapter(request),
        response: new ExpressResponseAdapter(response),
      };

      return await handler(context);
    };
  }
}
