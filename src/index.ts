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
import database from "./lib/Database";
import fastifyCookie from "@fastify/cookie";
import Container from "typedi";
import { ControllerMetadata } from "./lib/MetadataScanner";
import { ControllerScanner } from "./lib/ControllerScanner";

import { ClazzType } from "./lib/RouterMapper";
import { PostController } from "./controllers/PostController";
import path from "path";
import { UserController } from "./controllers/UserController";
import { plainToClass } from "class-transformer";
import { ValidationError, validate } from "class-validator";
import { ValidationHandler } from "./lib/ValidationHandler";
import { HEADER_TOKEN } from "./lib/Header";
import ts, { Identifier, MethodDeclaration, MethodSignature } from "typescript";
import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const imports = [PostController, UserController];
type HttpMethod = "get" | "post" | "patch" | "put" | "delete";

class ServerBootstrapApplication {
    private app!: FastifyInstance;
    private static INSTANCE: ServerBootstrapApplication;
    private _controllers: ClazzType<any>[] = [];

    private constructor() {
        this.app = fastify({
            logger: true,
        });
    }

    public static getInstance(): ServerBootstrapApplication {
        if (!ServerBootstrapApplication.INSTANCE) {
            ServerBootstrapApplication.INSTANCE =
                new ServerBootstrapApplication();
        }

        return ServerBootstrapApplication.INSTANCE;
    }

    public async start(): Promise<void> {
        // prettier-ignore
        this.handleGuards()
            .applyMiddlewares()
            .handleRoute();

        await this.connectDatabase();
        await this.registerControllers();
        await this.readJsDoc();

        this.createServer();
    }

    public async readJsDoc() {
        const targetPath = path.join(__dirname, "controllers");

        const files = fs.readdirSync(targetPath);

        const program = ts.createProgram(
            files.map((file) => path.join(targetPath, file)),
            {},
        );

        const sourceFile = program.getSourceFile(
            "./src/controllers/PostController.ts",
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

    private async registerControllers(): Promise<this> {
        const controllerScanner = Container.get(ControllerScanner);
        const contollers = controllerScanner.makeControllers();
        let controller: IteratorResult<ControllerMetadata>;
        while ((controller = contollers.next())) {
            if (controller.done) break;
            const metadata = controller.value as ControllerMetadata;

            const TargetController = metadata.target as ClazzType<any>;
            const injectParameters = metadata.repositoies;
            const args = injectParameters as any;

            const targetController = new TargetController(...args);
            this._controllers.push(targetController);

            const controllerPath = metadata.path;

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
                        try {
                            /**
                             * @Req, @Res 데코레이터를 구현하기 위해 프록시로 감싸준다.
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
                                    bodyValidationActions.push(
                                        validate(bodyData),
                                    );
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
                        } catch (err: any) {
                            // TODO: Exception Filter가 여기에 들어갈 수 있음.
                            console.error(err);
                        }
                    };

                    handler(
                        path.posix.join(controllerPath, routerPath),
                        routerProxy,
                    );
                },
            );
        }

        return this;
    }

    private handleGuards(): this {
        const handleErrorWather = (err: unknown) => {
            console.error(err);
        };
        process.on("uncaughtException", handleErrorWather);
        process.on("unhandledRejection", handleErrorWather);

        return this;
    }

    private handleRoute(): this {
        this.app.register(import("./routes"), {
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
