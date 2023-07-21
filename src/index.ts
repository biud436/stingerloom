/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance, fastify } from "fastify";
import "dotenv/config";
import "reflect-metadata";
import database from "./lib/Database";
import fastifyCookie from "@fastify/cookie";
import Container from "typedi";
import { ControllerMetadata, ControllerScanner } from "./lib/MetadataScanner";

import { ClazzType } from "./lib/RouterMapper";
import { PostController } from "./controllers/PostController";
import path from "path";
import { UserController } from "./controllers/UserController";

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

        this.createServer();
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
            const args = injectParameters;

            const targetController = new TargetController(...args);
            this._controllers.push(targetController);

            const controllerPath = metadata.path;

            metadata.routers.forEach((router) => {
                const targetMethod = router.method.toLowerCase();

                const handler = this.app[targetMethod as HttpMethod].bind(
                    this.app,
                );

                handler(
                    path.posix.join(controllerPath, router.path),
                    (router.router as any).bind(targetController),
                );
            });
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
        console.log(user);
    }
}

Promise.resolve(ServerBootstrapApplication.getInstance().start()).catch(
    (err) => {
        console.error(err);
    },
);
