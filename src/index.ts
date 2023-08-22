/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
    fastify,
} from "fastify";
import "dotenv/config";
import "reflect-metadata";
import database from "./lib/common/Database";
import fastifyCookie from "@fastify/cookie";
import Container from "typedi";
import { ControllerMetadata } from "./lib/scanner/MetadataScanner";
import { ControllerScanner } from "./lib/scanner/ControllerScanner";

import { ClazzType } from "./lib/common/RouterMapper";
import { PostController } from "./example/controllers/PostController";
import path from "path";
import { UserController } from "./example/controllers/UserController";
import { plainToClass } from "class-transformer";
import { ValidationError, validate } from "class-validator";
import { ValidationHandler } from "./lib/common/ValidationHandler";
import { HEADER_TOKEN } from "./lib/common/decorators/Header";
import ts, { Identifier, MethodDeclaration, MethodSignature } from "typescript";
import fs from "fs";
import { ExceptionScanner } from "./lib/scanner/ExceptionScanner";
import { InternalServerException } from "./lib/error/InternalServerException";
import { InternalErrorFilter } from "./example/exceptions/InternalErrorFilter";
import { Logger } from "./lib/common/Logger";
import { InstanceLoader } from "./example/InstanceLoader";
import { InstanceScanner } from "./lib/scanner/InstanceScanner";

// eslint-disable-next-line @typescript-eslint/no-unused-vars

type HttpMethod = "get" | "post" | "patch" | "put" | "delete";

class ServerBootstrapApplication {
    private app!: FastifyInstance;
    private static INSTANCE: ServerBootstrapApplication;
    private _controllers: ClazzType<any>[] = [];

    private constructor() {
        this.app = fastify({
            logger: {
                transport: {
                    target: "pino-pretty",
                    options: {
                        translateTime: "HH:MM:ss Z",
                        ignore: "pid,hostname",
                    },
                },
            },
        });
    }

    /**
     * 인스턴스를 취득합니다.
     */
    public static getInstance(): ServerBootstrapApplication {
        if (!ServerBootstrapApplication.INSTANCE) {
            ServerBootstrapApplication.INSTANCE =
                new ServerBootstrapApplication();
        }

        return ServerBootstrapApplication.INSTANCE;
    }

    /**
     * 서버를 시작합니다.
     */
    public async start(): Promise<void> {
        InstanceLoader.load();

        // prettier-ignore
        this.handleGuards()
            .applyMiddlewares()
            .handleStaticRoute();

        await this.connectDatabase();
        await this.registerControllers();
        await this.readJsDoc();

        this.createServer();
    }

    /**
     * jsDoc을 읽어옵니다.
     */
    public async readJsDoc() {
        const targetPath = path.join(__dirname, "example", "controllers");

        const files = fs.readdirSync(targetPath);

        const program = ts.createProgram(
            files.map((file) => path.join(targetPath, file)),
            {},
        );

        const sourceFile = program.getSourceFile(
            "./src/example/controllers/PostController.ts",
        );

        ts.forEachChild(sourceFile!, (node) => {
            if (ts.isClassDeclaration(node)) {
                const name = node.name?.escapedText;

                if (name === "PostController") {
                    ts.forEachChild(node, (node) => {
                        if (ts.isMethodDeclaration(node)) {
                            console.log((node as any).jsDoc[0].comment);

                            node.getChildren(sourceFile).forEach((child) => {
                                if (child.kind === ts.SyntaxKind.JSDoc) {
                                    console.log(child.getText(sourceFile));
                                }
                            });
                        }
                    });
                }
            }
        });

        function visitNode(node: ts.Node) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                    {
                        const classDeclaration = node as ts.ClassDeclaration;
                        const className =
                            classDeclaration.name?.getText(sourceFile);
                        console.log(className);
                    }
                    break;
                case ts.SyntaxKind.MethodDeclaration:
                    {
                        const methodDeclaration = node as ts.MethodDeclaration;
                        const methodName =
                            methodDeclaration.name?.getText(sourceFile);
                        console.log(methodName);
                    }
                    break;
                case ts.SyntaxKind.Decorator:
                    {
                        const decorator = node as ts.Decorator;
                        const decoratorName =
                            decorator.expression.getText(sourceFile);
                        console.log(decoratorName);
                    }
                    break;
            }

            ts.forEachChild(node, visitNode);
        }

        visitNode(sourceFile!);
    }

    /**
     * 컨트롤러를 스캔하고 라우터를 동적으로 등록합니다.
     */
    private async registerControllers(): Promise<this> {
        // Controller 스캐너 생성
        const controllerScanner = Container.get(ControllerScanner);
        const contollers = controllerScanner.makeControllers();
        let controller: IteratorResult<ControllerMetadata>;

        // Exception 스캐너 생성
        const exceptionScanner = Container.get(ExceptionScanner);

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

        return this;
    }

    /**
     * Exception Filter로 잡아내지 못한 서버 오류를 캐치합니다.
     *
     * @returns
     */
    private handleGuards(): this {
        const handleErrorWather = (err: unknown) => {
            console.error(err);
        };
        process.on("uncaughtException", handleErrorWather);
        process.on("unhandledRejection", handleErrorWather);

        return this;
    }

    /**
     * 정적 라우터를 등록합니다.
     *
     * @returns
     */
    private handleStaticRoute(): this {
        this.app.register(import("./example/routes"), {
            prefix: "/api",
        });

        return this;
    }

    private applyMiddlewares(): this {
        this.app.register(fastifyCookie, {
            secret: process.env.COOKIE_SECRET,
            hook: "onRequest",
        });

        return this;
    }

    private createServer(): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.listen({ port: process.env.SERVER_PORT }, (err, _address) => {
            if (err) {
                console.error(err);
            }
        });
    }

    private async connectDatabase(): Promise<void> {
        await database.start();
        const user = await database.echoUser();
    }
}

Promise.resolve(ServerBootstrapApplication.getInstance().start()).catch(
    (err) => {
        console.error(err);
    },
);
