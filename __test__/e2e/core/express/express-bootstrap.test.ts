/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  Controller,
  DatabaseModule,
  EntryModule,
  Get,
  Ip,
  ServerBootstrapApplication,
} from "@stingerloom/core";
import { ExpressServerFactory } from "@stingerloom/core/common/http/adapters/express";
import axios from "axios";
import configService from "@stingerloom/core/common/ConfigService";

describe("서버 세팅 및 시작 테스트", () => {
  let application: TestServerApplication;
  const PORT = 3000;

  @Controller("/")
  class AppController {
    @Get("/d")
    d() {
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

    @Get("/")
    index() {
      return "Hello, Stingerloom!";
    }
  }

  @EntryModule({
    imports: [
      DatabaseModule.forRoot({
        type: "mysql",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        database: configService.get<string>("DB_NAME"),
        password: configService.get<string>("DB_PASSWORD"),
        username: configService.get<string>("DB_USER"),
        entities: [__dirname + "/entity/*.ts", __dirname + "/entity/map/*.ts"],
        synchronize: true,
        logging: true,
      }),
    ],
    controllers: [AppController],
    providers: [],
  })
  class AppModule {}

  class TestServerApplication extends ServerBootstrapApplication {
    override beforeStart(): void {}
  }

  beforeAll((done) => {
    application = new TestServerApplication(
      AppModule,
      new ExpressServerFactory(),
    );
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

  it("/d 에 접근", async () => {
    const res = await axios.get(`http://localhost:${PORT}/d`);

    expect(res.data).toBe("Hello World");
  });
  it("/ 에 접근", async () => {
    const res = await axios.get(`http://localhost:${PORT}`);

    expect(res.data).toBe("Hello, Stingerloom!");
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
