/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  Controller,
  Get,
  Ip,
  Module,
  ModuleOptions,
  ServerBootstrapApplication,
} from "@stingerloom/core";
import { ExpressServerFactory } from "@stingerloom/core/common/http/adapters/express";
import axios from "axios";

describe("서버 세팅 및 시작 테스트", () => {
  let application: TestServerApplication;
  const PORT = 3000;

  @Controller("/")
  class AppController {
    @Get("/")
    index() {
      return "Hello World";
    }

    @Get("/test")
    test() {
      throw new BadRequestException("test");

      return "this is test";
    }

    @Get("/ips")
    ips(@Ip() ip: string) {
      return ip;
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
    application = new TestServerApplication(new ExpressServerFactory());
    application.on("start", () => {
      done();
    });

    application.start({
      port: PORT,
    });
  });

  afterAll(async () => {
    await application.stop();
  });

  it("에코 테스트가 성공하는가?", async () => {
    const res = await axios.get(`http://localhost:${PORT}`);

    expect(res.data).toBe("Hello World");
  });

  it("400번 오류가 제대로 검출되는가?", async () => {
    try {
      await axios.get(`http://localhost:${PORT}/test`);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  it("IP가 제대로 반환되는가?", async () => {
    const res = await axios.get(`http://localhost:${PORT}/ips`);

    expect(res.data).toBe("::1");
  });
});
