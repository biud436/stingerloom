/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance, fastify } from "fastify";
import "dotenv/config";
import "reflect-metadata";
import fastifyCookie from "@fastify/cookie";

// import { InstanceLoader } from "@stingerloom/example/InstanceLoader";

import { ContainerManager } from "@stingerloom/IoC/ContainerManager";
import { ParameterListManager } from "@stingerloom/common/ParameterListManager";
import { ModuleOptions } from "@stingerloom/common";
import Database from "@stingerloom/common/Database";
import Container from "typedi";
import { InstanceScanner } from "@stingerloom/IoC";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ParameterListManager.initAllocator();

export class ServerBootstrapApplication {
    private app!: FastifyInstance;
    // private static INSTANCE: ServerBootstrapApplication;
    private containerManager!: ContainerManager;
    protected moduleOptions!: ModuleOptions;

    constructor() {
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

    // /**
    //  * 인스턴스를 취득합니다.
    //  */
    // public static getInstance(): ServerBootstrapApplication {
    //     if (!ServerBootstrapApplication.INSTANCE) {
    //         ServerBootstrapApplication.INSTANCE =
    //             new ServerBootstrapApplication();
    //     }

    //     return ServerBootstrapApplication.INSTANCE;
    // }

    /**
     * 서버를 시작합니다.
     */
    public async start(): Promise<void> {
        this.beforeStart();

        // prettier-ignore
        this.handleGuards()
            .applyMiddlewares();

        await this.connectDatabase();
        await this.registerControllers();

        this.createServer();
    }

    protected beforeStart() {}

    /**
     * 컨트롤러를 스캔하고 라우터를 동적으로 등록합니다.
     */
    private async registerControllers(): Promise<this> {
        this.containerManager = new ContainerManager(this.app);

        await this.containerManager.register();

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
        if (!this.moduleOptions) {
            throw new Error("Database configuration is undefined.");
        }

        const database = new Database(this.moduleOptions.configuration);

        const instanceScanner = Container.get(InstanceScanner);
        instanceScanner.set(Database, database);

        await database.start();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const user = await database.echoUser();
    }
}
