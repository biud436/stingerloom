/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyInstance, FastifyListenOptions, fastify } from "fastify";
import "dotenv/config";
import "reflect-metadata";

// import { InstanceLoader } from "@stingerloom/example/InstanceLoader";

import { ContainerManager } from "@stingerloom/IoC/ContainerManager";
import { ParameterListManager } from "@stingerloom/common/ParameterListManager";
import { Logger, ModuleOptions } from "@stingerloom/common";
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
    protected app!: FastifyInstance;
    private containerManager!: ContainerManager;
    protected moduleOptions!: ModuleOptions;
    private logger = new Logger(ServerBootstrapApplication.name);

    constructor() {
        this.app = fastify({
            // logger: {
            //     transport: {
            //         target: "pino-pretty",
            //         options: {
            //             translateTime: "HH:MM:ss Z",
            //             ignore: "pid,hostname",
            //         },
            //     },
            // },
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

    private async onApplicationShutdown(): Promise<void> {
        this.logger.info("Application is shutting down...");

        await this.containerManager.propagateShutdown();

        const instanceScanner = Container.get(InstanceScanner);
        const database = instanceScanner.get<Database>(Database);

        await database.onApplicationShutdown();
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

        // SIGTERM
        process.on("SIGTERM", () => {
            this.onApplicationShutdown.call(this);
        });

        return this;
    }

    protected applyMiddlewares(): this {
        return this;
    }

    private createServer(
        options: FastifyListenOptions = { port: process.env.SERVER_PORT },
    ): void {
        this.app.listen(options, (err) => {
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
    }
}
