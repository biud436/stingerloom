import {
  Controller,
  Get,
  Module,
  ModuleOptions,
  ServerBootstrapApplication,
} from "@stingerloom/core";
import axios from "axios";

describe("서버 세팅 및 시작 테스트", () => {
  let application: TestServerApplication;

  @Controller("/")
  class AppController {
    @Get()
    index() {
      return "Hello World";
    }

    @Get("test")
    test() {
      return "this is test";
    }
  }

  @Module({
    controllers: [AppController],
    providers: [],
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

  it("/test를 호출한다", async () => {
    const res = await axios.get("http://localhost:3002/test");

    expect(res.data).toBe("this is test");
  });
});
