/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AfterCatch,
  BeforeCatch,
  Catch,
  Controller,
  ExceptionFilter,
  Filter,
  Get,
  InternalServerException,
  Logger,
  Module,
  ModuleOptions,
  ServerBootstrapApplication,
} from "@stingerloom/core";
import axios from "axios";

describe("서버 세팅 및 시작 테스트", () => {
  let application: TestServerApplication;

  @ExceptionFilter(InternalServerException)
  class InternalErrorFilter implements Filter {
    private readonly logger = new Logger();

    @BeforeCatch()
    public beforeCatch() {
      this.logger.info("before catch");
    }

    @Catch()
    public catch(error: any) {
      this.logger.info("[Internal Server Error] " + error.message);

      return {
        message: error.message,
        status: error.status,
        result: "failure",
      };
    }

    @AfterCatch()
    public afterCatch() {
      this.logger.info("after catch");
    }
  }

  @Controller("/")
  class AppController {
    @Get()
    index() {
      return "Hello World";
    }

    @Get("test")
    test() {
      throw new InternalServerException("test error");

      return "this is test";
    }
  }

  @Module({
    controllers: [AppController],
    providers: [InternalErrorFilter],
  })
  class TestServerApplication extends ServerBootstrapApplication {
    override beforeStart(): void {
      this.moduleOptions = ModuleOptions.merge({
        controllers: [],
        providers: [],
      });
    }
  }

  beforeAll((done) => {
    application = new TestServerApplication();
    application.on("start", () => {
      done();
    });

    application.start();
  });

  afterAll(async () => {
    await application.stop();
  });

  it("/를 호출한다", async () => {
    const res = await axios.get("http://localhost:3002");

    expect(res.data).toBe("Hello World");
  });

  it("/test를 호출 시 InternalServerException가 발생하는가?", async () => {
    const stub = async () => {
      const res = await axios.get("http://localhost:3002/test");

      console.log(res.data);
    };

    expect(stub).rejects.toThrow();
  });
});
