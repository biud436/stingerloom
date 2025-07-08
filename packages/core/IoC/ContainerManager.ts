/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "../common/RouterMapper";
import Container from "typedi";
import { ControllerScanner } from "./scanners/ControllerScanner";
import {
  ContainerMetadata,
  InjectableMetadata,
} from "./scanners/MetadataScanner";
import { ReflectManager } from "@stingerloom/core/common/ReflectManager";
import { transformBasicParameter } from "@stingerloom/core/common/allocators";
import {
  HttpServer,
  Logger,
  OnApplicationShutdown,
  TransactionManager,
} from "@stingerloom/core/common";
import { RouterExecutionContext } from "@stingerloom/core/router/RouterExecutionContext";
import chalk from "chalk";
import { createAutoWiredFactory } from "./utils/createAutoWiredFactory";
// import { EntityManager } from "@stingerloom/core/orm/core/EntityManager";
import { InjectableScanner, InstanceScanner } from "./scanners";

const LAZY_INJECTED_EXPLORER_SYMBOL = Symbol.for("LAZY_INJECTED_EXPLORER");

/**
 * @class ContainerManager
 */
export class ContainerManager {
  private _controllers: ClazzType<any>[] = [];
  private _injectables: ClazzType<any>[] = [];
  private server!: HttpServer;
  // private entityManager!: EntityManager;

  private readonly logger = new Logger(ContainerManager.name);
  private readonly routerExecutionContext;
  private readonly [LAZY_INJECTED_EXPLORER_SYMBOL]: ((
    ...args: unknown[]
  ) => void)[] = [];

  constructor(server: HttpServer) {
    this.server = server;
    this.routerExecutionContext = new RouterExecutionContext(this.server);
  }

  public async register() {
    await this.registerEntities();
    await this.registerInjectables();
    await this.registerControllers();
    await this.registerExceptions();
    await this.printLazyInjectedExplorer();
  }

  /**
   * 프로세스가 종료될 때 호출됩니다.
   */
  public async propagateShutdown() {
    const consumers: unknown[] = this._injectables.concat(this._controllers);

    // await this.entityManager.propagateShutdown();

    for (const consumer of consumers) {
      const handler = consumer as OnApplicationShutdown;
      if (handler.onApplicationShutdown instanceof Promise) {
        await handler.onApplicationShutdown?.();
      } else {
        handler.onApplicationShutdown?.();
      }
    }
  }

  private async registerEntities() {
    console.log("registerEntities");
    // await this.entityManager.register();
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
        this.printInjectables(args, TargetInjectable);

        args = args.map((target, index) =>
          transformBasicParameter(target, TargetInjectable, index),
        );
      }

      const targetInjectable = new TargetInjectable(...args);

      createAutoWiredFactory(targetInjectable);

      await this.callOnModuleInit(targetInjectable);

      await TransactionManager.checkTransactionalZone(
        TargetInjectable,
        targetInjectable,
        instanceScanner,
      );

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
    // const instanceScanner = Container.get(InstanceScanner);
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

      if (Array.isArray(args)) {
        this.printInjectables(args, TargetController);

        args = args.map((target, index) => {
          return transformBasicParameter(target, TargetController, index);
        });
      }

      const targetController = new TargetController(...args);
      createAutoWiredFactory(targetController);

      await this.callOnModuleInit(targetController);

      this._controllers.push(targetController);

      const controllerPath = metadata.path;

      // 라우터를 등록합니다.
      await this.routerExecutionContext.create(
        metadata,
        targetController,
        controllerPath,
      );
    }
  }

  private printInjectables(args: any[], TargetController: ClazzType<any>) {
    args.forEach((arg: any) => {
      this[LAZY_INJECTED_EXPLORER_SYMBOL].push(() =>
        this.logger.info(
          `${TargetController.name}에 ${arg.name ?? arg.constructor.name}가 ${
            ReflectManager.isInjectable(arg) || ReflectManager.isRepository(arg)
              ? chalk.yellow("SINGLETON SCOPE")
              : chalk.red("TRANSIENT SCOPE")
          }로 inject됨`,
        ),
      );
    });
  }

  /**
   * 예외 처리를 스캔하고 예외를 캐치합니다.
   */
  private async registerExceptions() {
    // // Exception 스캐너 생성
    const routerRegistery = this.server.getRouteRegistry();

    routerRegistery.registerExceptionHandler();
  }

  async printLazyInjectedExplorer() {
    this[LAZY_INJECTED_EXPLORER_SYMBOL].forEach((explorer) => explorer());
  }

  /**
   * onModuleInit가 정의되어있는지 확인하고 정의되어있으면 호출합니다.
   * @param targetInstance
   * @returns
   */
  private async callOnModuleInit(targetInstance: any) {
    if (!targetInstance.onModuleInit) {
      return;
    }

    // 비동기 또는 동기인지 확인하고 호출합니다.
    if (targetInstance.onModuleInit instanceof Promise) {
      await targetInstance.onModuleInit();
    } else {
      targetInstance.onModuleInit();
    }
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
