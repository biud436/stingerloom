/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from "@stingerloom/common/Logger";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ContainerMetadata } from "../IoC/scanners/MetadataScanner";
import { ClazzType, HttpMethod, ValidationHandler } from "@stingerloom/common";
import { ValidationError } from "class-validator";
import { classToPlain } from "class-transformer";
import path from "path";
import { GuardConsumer } from "./GuardConsumer";
import { RouteParameterTransformer } from "./RouteParameterTransformer";
import { HeaderConsumer } from "./HeaderConsumer";
import { RenderConsumer } from "./RenderConsumer";

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
        const routeParameterTransformer = new RouteParameterTransformer(
            targetController,
        );
        const headerConsumer = new HeaderConsumer(targetController);
        const renderConsumer = new RenderConsumer(targetController);

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

                    // Parameters Consumer
                    const args = await routeParameterTransformer.transform(
                        routerName,
                        req,
                        res,
                        parameters,
                        bodyValidationActions,
                    );

                    // Header Consumer
                    headerConsumer.execute(res, routerName);

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

                    return renderConsumer.isRender(routerName)
                        ? renderConsumer.execute(
                              res,
                              routerName,
                              result instanceof Promise ? await result : result,
                          )
                        : classToPlain(result);
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
