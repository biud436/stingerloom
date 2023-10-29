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
import { FastifyRequest } from "fastify";

export class RouteParameterTransformer {
    constructor(private readonly targetController: ClazzType<any>) {}

    transform(
        routerName: string,
        req: FastifyRequest,
        parameters: HttpRouterParameter[],
        bodyValidationActions: Promise<ValidationError[]>[],
    ) {
        const { targetController } = this;

        const args = parameters.map((param) => {
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

                const context = new ServerContext(req, param.type!);
                return callback[
                    getParamDecoratorUniqueKey(
                        targetController,
                        routerName,
                        param.index,
                    )
                ].callback(param.value, context);
            }

            // Body 요청 구현
            if (param.body) {
                const bodyData = plainToClass(param.body.type, req.body);
                bodyValidationActions.push(validate(bodyData));
                return bodyData;
            }

            return param.value;
        });

        return args;
    }
}
