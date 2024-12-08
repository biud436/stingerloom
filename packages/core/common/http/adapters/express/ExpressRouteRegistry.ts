/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    HttpContext,
    HttpError,
    HttpRoute,
    HttpRouteRegistry,
} from "../../interfaces";
import express, { Application, Request, Response, NextFunction } from "express";
import { ExpressHandlerAdapter } from "./ExpressHandlerAdapter";
import { ExceptionHandler, HttpMethod } from "../../../";
import { ExpressRequestAdapter } from "./ExpressRequestAdapter";
import { ExpressResponseAdapter } from "./ExpressResponseAdapter";

export class ExpressRouteRegistry implements HttpRouteRegistry {
    private router = express.Router();

    constructor(
        private app: Application,
        private readonly exceptionHandler: ExceptionHandler,
    ) {}

    register(route: HttpRoute): void {
        const handler = ExpressHandlerAdapter.adapt(route.handler);
        const targetMethod = route.method.toLowerCase() as HttpMethod;

        const statusCode = targetMethod === "post" ? 201 : 200;

        const routerProxy = async (
            req: Request,
            res: Response,
            next: NextFunction,
        ) => {
            try {
                const result = await handler(req, res);

                // 응답이 아직 전송되지 않았다면
                if (!res.headersSent) {
                    // result가 존재하면 전송
                    if (result !== undefined) {
                        res.status(statusCode).send(result);
                    } else {
                        // result가 없으면 기본 200 응답
                        res.status(statusCode).send();
                    }
                }
            } catch (error) {
                next(error);
            }
        };

        this.app[targetMethod](route.path, routerProxy);
    }
    registerExceptionHandler(): void {
        this.app.use(
            async (
                error: any,
                req: Request,
                res: Response,
                _next: NextFunction,
            ) => {
                const context: HttpContext = {
                    request: new ExpressRequestAdapter(req),
                    response: new ExpressResponseAdapter(res),
                };

                const { status, body } =
                    await this.exceptionHandler.handleException(
                        {
                            name: error.name || "Error",
                            message: error.message || "Internal Server Error",
                            stack: error.stack || "",
                            code: +error.code || 500,
                            status: error.status || 500,
                        } as HttpError,
                        context,
                    );

                res.status(status).send(body);
            },
        );
    }
}
