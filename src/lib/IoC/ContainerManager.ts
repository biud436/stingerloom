/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ClazzType } from "../common/RouterMapper";
import Container from "typedi";
import { ControllerScanner } from "./scanners/ControllerScanner";
import { ControllerMetadata } from "./scanners/MetadataScanner";
import { ExceptionScanner } from "./scanners/ExceptionScanner";
import { HttpMethod } from "../common/HttpMethod";
import { ValidationError, validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { HEADER_TOKEN } from "../common/decorators/Header";
import { ValidationHandler } from "../common/ValidationHandler";
import path from "path";
import { InstanceScanner } from "./scanners/InstanceScanner";

/**
 * @class ContainerManager
 */
export class ContainerManager {
    private _controllers: ClazzType<any>[] = [];
    private app!: FastifyInstance;

    constructor(app: FastifyInstance) {
        this.app = app;
    }

    public async register() {
        await this.registerControllers();
        await this.regsterExceptions();
    }

    private async registerControllers() {
        // Controller 스캐너 생성
        const controllerScanner = Container.get(ControllerScanner);
        const contollers = controllerScanner.makeControllers();
        let controller: IteratorResult<ControllerMetadata>;

        // Controller 스캔 시작
        while ((controller = contollers.next())) {
            if (controller.done) break;
            const metadata = controller.value as ControllerMetadata;

            const TargetController = metadata.target as ClazzType<any>;
            const injectParameters = metadata.repositoies;
            const args = injectParameters as any;

            const targetController = new TargetController(...args);
            this._controllers.push(targetController);

            const controllerPath = metadata.path;

            // 라우터 스캔 시작
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
                        /**
                         * @Req, @Res 데코레이터를 구현하기 위해 프록시로 감싸줍니다.
                         */
                        const req = _request as FastifyRequest;
                        const res = _reply as FastifyReply;

                        const bodyValidationActions: Promise<
                            ValidationError[]
                        >[] = [];

                        const args = parameters.map((param) => {
                            if (param.isReq) {
                                return req;
                            }

                            if (param.body) {
                                const bodyData = plainToClass(
                                    param.body.type,
                                    req.body,
                                );
                                bodyValidationActions.push(validate(bodyData));
                                return bodyData;
                            }

                            return param.value;
                        });

                        // 헤더 구현
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

                        return result;
                    };

                    handler(
                        path.posix.join(controllerPath, routerPath),
                        routerProxy,
                    );
                },
            );
        }
    }

    private async regsterExceptions() {
        // Exception 스캐너 생성
        const exceptionScanner = Container.get(ExceptionScanner);

        const instanceScanner = Container.get(InstanceScanner);
        this.app.setErrorHandler((err, _request, _reply) => {
            let errorData = {
                status: 500,
            } as any;

            for (const {
                target,
                exception,
                handlers,
            } of exceptionScanner.makeExceptions()) {
                if (err.name === exception.name) {
                    const ExceptionFilter = target as ClazzType<any>;

                    if (!instanceScanner.has(ExceptionFilter)) {
                        instanceScanner.set(
                            ExceptionFilter,
                            new ExceptionFilter(),
                        );
                    }

                    handlers.forEach((catcher) => {
                        const { advice } = catcher;
                        const instance = instanceScanner.get(ExceptionFilter);

                        switch (advice) {
                            case "throwing":
                                errorData = (catcher.handler as any).call(
                                    instance,
                                    err,
                                );
                                break;
                            case "before-throwing":
                            case "after-throwing":
                                (catcher.handler as any).call(instance);
                                break;
                            default:
                                break;
                        }
                    });
                }
            }

            if (!errorData) {
                errorData = err;
            }

            _reply.status(errorData?.status || 500).send(errorData);
        });
    }
}
