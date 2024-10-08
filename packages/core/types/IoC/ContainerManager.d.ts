import { FastifyInstance } from "fastify";
import { ClazzType } from "../common/RouterMapper";
declare const LAZY_INJECTED_EXPLORER_SYMBOL: unique symbol;
/**
 * @class ContainerManager
 */
export declare class ContainerManager {
    private _controllers;
    private _injectables;
    private app;
    private entityManager;
    private readonly logger;
    private readonly routerExecutionContext;
    private readonly [LAZY_INJECTED_EXPLORER_SYMBOL];
    constructor(app: FastifyInstance);
    initEntityManager(): void;
    register(): Promise<void>;
    /**
     * 프로세스가 종료될 때 호출됩니다.
     */
    propagateShutdown(): Promise<void>;
    private registerEntities;
    /**
     * injectable을 스캔하고 생성합니다.
     */
    private registerInjectables;
    /**
     * 컨트롤러를 스캔하고 라우터로 등록합니다.
     */
    private registerControllers;
    private printInjectables;
    /**
     * 예외 처리를 스캔하고 예외를 캐치합니다.
     */
    private registerExceptions;
    printLazyInjectedExplorer(): Promise<void>;
    /**
     * onModuleInit가 정의되어있는지 확인하고 정의되어있으면 호출합니다.
     * @param targetInstance
     * @returns
     */
    private callOnModuleInit;
    findInjectable<T>(target: ClazzType<T>): T | undefined;
}
export {};
