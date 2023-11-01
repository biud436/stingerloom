/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ClazzType,
    CustomParamDecoratorMetadata,
    HTTP_PARAM_DECORATOR_TOKEN,
    HttpRouterParameter,
    ServerContext,
    createSessionProxy,
    getParamDecoratorUniqueKey,
} from "@stingerloom/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationError } from "class-validator/types/validation/ValidationError";
import { FastifyReply, FastifyRequest } from "fastify";

export class RouteParameterTransformer {
    constructor(private readonly targetController: ClazzType<any>) {}

    async transform(
        routerName: string,
        req: FastifyRequest,
        res: FastifyReply,
        parameters: HttpRouterParameter[],
        bodyValidationActions: Promise<ValidationError[]>[],
    ) {
        const args = [];
        for (const param of parameters) {
            const value = await this.handle(
                routerName,
                req,
                res,
                parameters,
                bodyValidationActions,
                param,
            );

            args.push(value);
        }

        return args;
    }

    async handle(
        routerName: string,
        req: FastifyRequest,
        res: FastifyReply,
        parameters: HttpRouterParameter[],
        bodyValidationActions: Promise<ValidationError[]>[],
        param: HttpRouterParameter,
    ) {
        const { targetController } = this;

        // Req 객체 요청
        if (param.isReq) {
            return req;
        }

        // 세션 요청
        if (param.isSession) {
            return createSessionProxy(req);
        }

        // 커스텀 매개변수 구현
        if (param.isCustom) {
            const callback = Reflect.getMetadata(
                HTTP_PARAM_DECORATOR_TOKEN,
                targetController,
                routerName,
            ) as CustomParamDecoratorMetadata;

            const context = new ServerContext(req, res, param.type!);

            const host =
                callback[
                    getParamDecoratorUniqueKey(
                        targetController,
                        routerName,
                        param.index,
                    )
                ];

            if (host.callback instanceof Promise) {
                return await host.callback(param.value, context);
            }

            return host.callback(param.value, context);
        }

        // Body 요청 구현
        if (param.body) {
            const bodyData = plainToClass(param.body.type, req.body);
            bodyValidationActions.push(validate(bodyData));
            return bodyData;
        }

        return param.value;
    }
}
