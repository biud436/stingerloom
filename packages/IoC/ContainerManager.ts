/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ClazzType } from "@stingerloom/common/RouterMapper";
import Container from "typedi";
import { ControllerScanner } from "./scanners/ControllerScanner";
import {
    ContainerMetadata,
    InjectableMetadata,
} from "./scanners/MetadataScanner";
import { ExceptionScanner } from "./scanners/ExceptionScanner";
import { HttpMethod } from "@stingerloom/common/HttpMethod";
import { ValidationError, validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { HEADER_TOKEN } from "@stingerloom/common/decorators/Header";
import { ValidationHandler } from "@stingerloom/common/ValidationHandler";
import path from "path";
import { InstanceScanner } from "./scanners/InstanceScanner";
import { HttpStatus } from "@stingerloom/common/HttpStatus";
import { ReflectManager } from "@stingerloom/common/ReflectManager";
import { transformBasicParameter } from "@stingerloom/common/allocators";
import { InjectableScanner } from "./scanners/InjectableScanner";
import { AdviceType } from "./AdviceType";
import { createSessionProxy } from "@stingerloom/common/SessionProxy";

/**
 * @class ContainerManager
 */
export class ContainerManager {
    private _controllers: ClazzType<any>[] = [];
    private _injectables: ClazzType<any>[] = [];
    private app!: FastifyInstance;

    constructor(app: FastifyInstance) {
        this.app = app;
    }

    public async register() {
        await this.registerInjectables();
        await this.registerControllers();
        await this.registerExceptions();
    }

    /**
     * injectable을 스캔하고 생성합니다.
     */
    private async registerInjectables() {
        const injectableScanner = Container.get(InjectableScanner);
        const injectables = injectableScanner.makeInjectables();

        const instanceScanner = Container.get(InstanceScanner);

        let injectable: IteratorResult<InjectableMetadata>;

        while ((injectable = injectables.next())) {
            if (injectable.done) break;
            const metadata = injectable.value as InjectableMetadata;

            const TargetInjectable = metadata.target as ClazzType<any>;
            if (!ReflectManager.isInjectable(TargetInjectable)) {
                throw new Error(
                    `${TargetInjectable.name}은 injectable이 아닌 것 같습니다.`,
                );
            }

            const injectParameters = metadata.parameters;
            let args = injectParameters as any;

            if (Array.isArray(args)) {
                args = args.map((target) => transformBasicParameter(target));
            }

            const targetInjectable = new TargetInjectable(...args);

            this._injectables.push(targetInjectable);

            instanceScanner.set(TargetInjectable, targetInjectable);
        }
    }

    /**
     * 컨트롤러를 스캔하고 라우터로 등록합니다.
     */
    private async registerControllers() {
        // Controller 스캐너 생성
        const controllerScanner = Container.get(ControllerScanner);
        const contollers = controllerScanner.makeControllers();
        let controller: IteratorResult<ContainerMetadata>;

        // Controller 스캔 시작
        while ((controller = contollers.next())) {
            if (controller.done) break;
            const metadata = controller.value as ContainerMetadata;

            const TargetController = metadata.target as ClazzType<any>;
            if (!ReflectManager.isController(TargetController)) {
                throw new Error(
                    `${TargetController.name}은 컨트롤러가 아닌 것 같습니다.`,
                );
            }

            const injectParameters = metadata.parameters;
            let args = injectParameters as any;

            // TODO: 이 단계에서 repository가 주입되어야 합니다.
            if (Array.isArray(args)) {
                args = args.map((target) => transformBasicParameter(target));
            }

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

                            if (param.isSession) {
                                return createSessionProxy(req);
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

    /**
     * 예외 처리를 스캔하고 예외를 캐치합니다.
     */
    private async registerExceptions() {
        // Exception 스캐너 생성
        const exceptionScanner = Container.get(ExceptionScanner);

        const instanceScanner = Container.get(InstanceScanner);
        this.app.setErrorHandler((err, _request, _reply) => {
            let errorData = {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
            } as any;

            for (const {
                target,
                exception,
                handlers,
            } of exceptionScanner.makeExceptions()) {
                if (err.name === exception.name) {
                    const ExceptionFilter = target as ClazzType<any>;

                    // Advice 처리
                    handlers.forEach((catcher) => {
                        const { advice } = catcher;
                        const context = instanceScanner.wrap(ExceptionFilter);

                        switch (advice) {
                            case AdviceType.THROWING:
                                errorData = (catcher.handler as any).call(
                                    context,
                                    err,
                                );
                                break;
                            case AdviceType.BEFORE_THROWING:
                            case AdviceType.AFTER_THROWING:
                                (catcher.handler as any).call(context);
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

    public findInjectable<T>(target: ClazzType<T>): T | undefined {
        if (ReflectManager.isInjectable(target)) {
            return this._injectables.find(
                (injectable) => injectable instanceof target,
            ) as T;
        }

        return undefined;
    }
}
