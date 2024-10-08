/// <reference types="node" />
import { FastifyInstance } from "fastify";
import "dotenv/config";
import "reflect-metadata";
import { ModuleOptions } from "@stingerloom/core/common";
import { EventEmitter } from "events";
/**
 * @class ServerBootstrapApplication
 * @description
 * 이 클래스는 서버를 시작하는 역할을 하며 `Stingerloom`의 핵심 클래스입니다.
 * 컨트롤러를 스캔하고 라우터를 동적으로 등록하여 서버를 구동시키는 역할을 합니다.
 */
export declare class ServerBootstrapApplication extends EventEmitter {
    protected app: FastifyInstance;
    private containerManager;
    protected moduleOptions: ModuleOptions;
    private logger;
    constructor();
    /**
     * 서버를 시작합니다.
     */
    start(): Promise<void>;
    /**
     * 서버를 시작하기 전에 실행되는 함수입니다.
     * 자식 클래스에서 이 함수를 오버라이딩하여 사용할 수 있습니다.
     */
    protected beforeStart(): void;
    private mergeModuleOptions;
    /**
     * 컨트롤러를 스캔하고 라우터를 동적으로 등록합니다.
     */
    private registerControllers;
    private onApplicationShutdown;
    /**
     * Exception Filter로 잡아내지 못한 서버 오류를 캐치합니다.
     *
     * @returns
     */
    private handleGuards;
    protected applyMiddlewares(): this;
    private createServer;
    /**
     * 테스트를 위해 컨테이너에 등록된 인스턴스를 가져옵니다.
     *
     * @param type 가져올 인스턴스의 타입
     * @returns
     */
    get<T>(type: new (...args: any[]) => T): T;
    /**
     * 서버를 종료합니다.
     */
    stop(): Promise<void>;
    close(): Promise<void>;
    private connectDatabase;
}
