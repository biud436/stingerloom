/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from "@stingerloom/common/Logger";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ContainerMetadata } from "./scanners/MetadataScanner";
import {
    ClazzType,
    HEADER_TOKEN,
    HttpMethod,
    ValidationHandler,
} from "@stingerloom/common";
import { ValidationError } from "class-validator";
import { classToPlain } from "class-transformer";
import path from "path";
import { GuardConsumer } from "./GuardConsumer";
import { RouteParameterTransformer } from "./RouteParameterTransformer";

/**
 * @class RouterExecutionContext
 * @author 어진석(biud436)
 * @description
 * 라우터를 실행하기 위한 컨텍스트 클래스입니다.
 */
export class RouterExecutionContext {
    private readonly logger = new Logger(RouterExecutionContext.name);
    private readonly guardConsumer: GuardConsumer;

    constructor(private readonly app: FastifyInstance) {
        this.guardConsumer = new GuardConsumer();
    }

    public async create(
        metadata: ContainerMetadata,
        targetController: ClazzType<any>,
        controllerPath: string,
    ) {
        metadata.routers.forEach(
            ({ method, path: routerPath, router, parameters }) => {
                const targetMethod = method.toLowerCase();

                const handler = this.app[targetMethod as HttpMethod].bind(
                    this.app,
                );

                const routerProxy: FastifyFPHandler = async (
                    _request,
                    _reply,
                ) => {
                    const req = _request as FastifyRequest;
                    const res = _reply as FastifyReply;
                    const bodyValidationActions: Promise<ValidationError[]>[] =
                        [];
                    const routerName = (
                        router as (...args: unknown[]) => unknown
                    ).name;

                    // Guard Consumer
                    await this.guardConsumer.create(
                        req,
                        targetController,
                        routerName,
                    );

                    const routeParameterTransformer =
                        new RouteParameterTransformer(
                            req,
                            targetController,
                            routerName,
                            bodyValidationActions,
                        );

                    // Parameters Consumer
                    const args =
                        routeParameterTransformer.transform(parameters);

                    // Header Consumer
                    const header = Reflect.getMetadata(
                        HEADER_TOKEN,
                        targetController,
                        (router as any).name,
                    );
                    if (header) {
                        res.header(header.key, header.value);
                    }

                    const validationHandler = new ValidationHandler(
                        res,
                        bodyValidationActions,
                    );

                    if (await validationHandler.isError()) {
                        return validationHandler.getResponse();
                    }

                    const result = (router as any).call(
                        targetController,
                        ...args,
                    );

                    return classToPlain(result);
                };

                const registerPath = path.posix.join(
                    controllerPath,
                    routerPath,
                );
                handler(registerPath, routerProxy);

                this.logger.info(
                    `{${registerPath}, ${targetMethod.toUpperCase()}} 에 route가 등록됨`,
                );
            },
        );
    }
}
