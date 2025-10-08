/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import "reflect-metadata";

import { ContainerManager } from "@stingerloom/core/IoC/ContainerManager";
import { ParameterListManager } from "@stingerloom/core/common/ParameterListManager";
import {
  ClazzType,
  DynamicModuleOption,
  EventService,
  FastifyServerFactory,
  HttpServer,
  Logger,
  MODULE_OPTIONS_TOKEN,
  ModuleOptions,
  ServerFactory,
  ServerOptions,
} from "@stingerloom/core/common";
import Container from "typedi";
import { InstanceScanner } from "@stingerloom/core/IoC";
import { DiscoveryService } from "@stingerloom/core/services";
import { EventEmitter } from "events";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ParameterListManager.initAllocator();

/**
 * @class ServerBootstrapApplication
 * @description
 * 이 클래스는 서버를 시작하는 역할을 하며 `Stingerloom`의 핵심 클래스입니다.
 * 컨트롤러를 스캔하고 라우터를 동적으로 등록하여 서버를 구동시키는 역할을 합니다.
 */
export class ServerBootstrapApplication extends EventEmitter {
  protected server!: HttpServer;
  private containerManager!: ContainerManager;
  protected moduleOptions!: ModuleOptions;
  protected entryModule: ClazzType<any>;
  private logger = new Logger(ServerBootstrapApplication.name);

  constructor(
    moduleGetter: ClazzType,
    serverFactory: ServerFactory = new FastifyServerFactory(),
  ) {
    super();

    this.entryModule = moduleGetter;
    this.server = serverFactory.createServer();
  }

  getAppModuleOptions(): DynamicModuleOption {
    const options = Reflect.getMetadata(
      MODULE_OPTIONS_TOKEN,
      this.entryModule,
    ) as DynamicModuleOption;

    return options || {};
  }

  /**
   * 서버를 시작합니다.
   */
  public async start(options?: ServerOptions): Promise<void> {
    this.beforeStart();
    this.mergeModuleOptions();

    // prettier-ignore
    this.handleGuards()
            .applyMiddlewares(this.server);

    await this.prepare();

    await this.registerControllers();

    await this.createServer(options);
  }

  /**
   * 서버를 시작하기 전에 실행되는 함수입니다.
   * 자식 클래스에서 이 함수를 오버라이딩하여 사용할 수 있습니다.
   */
  protected beforeStart() {}
  protected async prepare() {}

  private mergeModuleOptions(): void {
    const appModuleOptions = this.getAppModuleOptions();

    this.moduleOptions = ModuleOptions.merge(appModuleOptions, {
      controllers: [],
      providers: [EventService, DiscoveryService],
    });
  }

  /**
   * 컨트롤러를 스캔하고 라우터를 동적으로 등록합니다.
   */
  private async registerControllers(): Promise<this> {
    const options = this.getAppModuleOptions();

    this.containerManager = new ContainerManager(this.server, this.entryModule);

    await this.containerManager.register();

    return this;
  }

  private async onApplicationShutdown(): Promise<void> {
    this.logger.info("Application is shutting down...");

    await this.containerManager.propagateShutdown();
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

  protected applyMiddlewares(server: HttpServer): this {
    return this;
  }

  private async createServer(
    options: ServerOptions = {
      port: +(process.env.SERVER_PORT || 3000),
    },
  ): Promise<void> {
    await this.server.start(options);
    this.emit("start");
  }

  /**
   * 테스트를 위해 컨테이너에 등록된 인스턴스를 가져옵니다.
   *
   * @param type 가져올 인스턴스의 타입
   * @returns
   */
  public get<T>(type: new (...args: any[]) => T): T {
    const instanceScanner = Container.get(InstanceScanner);

    return instanceScanner.get(type);
  }

  /**
   * 서버를 종료합니다.
   */
  public async stop(): Promise<void> {
    await this.server.stop();

    this.emit("stop");

    const eventService = this.get<EventService>(EventService);
    if (eventService) {
      eventService.emit("stop");
    }

    await this.onApplicationShutdown();
  }

  public async close(): Promise<void> {
    await this.stop();
  }
}
