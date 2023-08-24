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
import { DiscoveryService } from "@stingerloom/services";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ParameterListManager.initAllocator();

/**
 * @class ServerBootstrapApplication
 * @description
 * 이 클래스는 서버를 시작하는 역할을 하며 `Stingerloom`의 핵심 클래스입니다.
 * 컨트롤러를 스캔하고 라우터를 동적으로 등록하여 서버를 구동시키는 역할을 합니다.
 */
export class ServerBootstrapApplication {
    private app!: FastifyInstance;
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

    /**
     * 서버를 시작합니다.
     */
    public async start(): Promise<void> {
        this.beforeStart();
        this.mergeModuleOptions();

        // prettier-ignore
        this.handleGuards()
            .applyMiddlewares();

        await this.connectDatabase();
        await this.registerControllers();

        this.createServer();
    }

    /**
     * 서버를 시작하기 전에 실행되는 함수입니다.
     * 자식 클래스에서 이 함수를 오버라이딩하여 사용할 수 있습니다.
     */
    protected beforeStart() {}

    private mergeModuleOptions(): void {
        this.moduleOptions = ModuleOptions.merge(this.moduleOptions, {
            controllers: [],
            providers: [DiscoveryService],
        });
    }

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
