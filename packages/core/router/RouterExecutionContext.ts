/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from "../common/Logger";
import { ContainerMetadata } from "../IoC/scanners/MetadataScanner";
import {
    ClazzType,
    HttpContext,
    HttpHandler,
    HttpMethod,
    HttpRouteRegistry,
    HttpServer,
    ValidationHandler,
} from "../common";
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
    private readonly routeRegistry: HttpRouteRegistry;

    constructor(private readonly server: HttpServer) {
        this.guardConsumer = new GuardConsumer();
        this.routeRegistry = this.server.getRouteRegistry();
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
                const routeHandler: HttpHandler = async (
                    context: HttpContext,
                ) => {
                    const { request, response } = context;
                    const req = request;
                    const res = response;
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
                        : this.transformResponse(result);
                };

                const registerPath = this.normalizePath(
                    controllerPath,
                    routerPath,
                );

                this.routeRegistry.register({
                    path: registerPath,
                    method: method as HttpMethod,
                    handler: routeHandler,
                });

                this.logger.info(
                    `{${registerPath}, ${method.toUpperCase()}} 에 route가 등록됨`,
                );
            },
        );
    }

    private normalizePath(controllerPath: string, routePath: string): string {
        return path.posix.join(controllerPath, routePath);
    }

    private transformResponse(result: any): any {
        return classToPlain(result);
    }
}
