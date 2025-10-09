import axios from "axios";
import {
  BadRequestException,
  Controller,
  DatabaseModule,
  EntryModule,
  Get,
  Param,
  ServerBootstrapApplication,
  Post,
  Body,
  InternalServerException,
  NotFoundException,
} from "@stingerloom/core";
import { LoomServerFactory } from "@stingerloom/core/common/http/adapters/loom";
import configService from "@stingerloom/core/common/ConfigService";
import { IsOptional, IsString, IsNumber } from "class-validator";

class JsonTestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  [key: string]: unknown;
}

describe("Loom 서버 에러 처리 테스트", () => {
  let application: TestServerApplication;
  const PORT = 3004;

  @Controller("/")
  class ErrorTestController {
    @Get("/")
    index() {
      return {
        message: "Loom Error Test Server",
        server: "loom",
        version: "1.0.0",
      };
    }

    @Get("/error/400")
    badRequest() {
      throw new BadRequestException("Bad request from Loom");
    }

    @Get("/error/404")
    notFound() {
      throw new NotFoundException("Not found in Loom");
    }

    @Get("/error/500")
    internalError() {
      throw new InternalServerException("Internal error in Loom");
    }

    @Get("/users/:id")
    getUser(@Param("id") id: string) {
      if (id === "error") {
        throw new BadRequestException("Invalid user ID");
      }
      return { id, name: `User ${id}`, server: "loom" };
    }

    @Get("/special/:param")
    specialChars(@Param("param") param: string) {
      return { param, decoded: decodeURIComponent(param), server: "loom" };
    }

    @Post("/json")
    jsonTest(@Body() data: JsonTestDto) {
      // undefined 값들만 있는지 확인하여 빈 객체인지 판단
      const hasValidData =
        data && (data.name !== undefined || data.value !== undefined);
      if (!hasValidData) {
        throw new BadRequestException("Empty body");
      }
      return { received: data, server: "loom" };
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
        entities: [__dirname + "/entity/*.ts"],
        synchronize: true,
        logging: false,
      }),
    ],
    controllers: [ErrorTestController],
    providers: [],
  })
  class AppModule {}

  class TestServerApplication extends ServerBootstrapApplication {
    override beforeStart(): void {
      console.log("Starting Loom Error Test Server...");
    }
  }

  beforeAll((done) => {
    application = new TestServerApplication(AppModule, new LoomServerFactory());
    application.on("start", () => {
      console.log(`Loom error test server started on port ${PORT}`);
      done();
    });
    application.start({ port: PORT });
  }, 30000);

  afterAll(async () => {
    console.log("Stopping Loom error test server...");
    await application.stop();
  }, 15000);

  it("정상 요청 처리", async () => {
    const res = await axios.get(`http://localhost:${PORT}/`);
    expect(res.status).toBe(200);
    expect(res.data.server).toBe("loom");
  }, 10000);

  it("400 에러 처리", async () => {
    try {
      await axios.get(`http://localhost:${PORT}/error/400`);
      fail("에러가 발생해야 합니다");
    } catch (error) {
      const err = error as {
        response: {
          status: number;
          data: { statusCode: number; message: string };
        };
      };
      expect(err.response.status).toBe(400);
      expect(err.response.data.statusCode).toBe(400);
      expect(err.response.data.message).toBe("Bad request from Loom");
    }
  }, 10000);

  it("404 에러 처리", async () => {
    try {
      await axios.get(`http://localhost:${PORT}/error/404`);
      fail("에러가 발생해야 합니다");
    } catch (error) {
      const err = error as {
        response: {
          status: number;
          data: { statusCode: number; message: string };
        };
      };
      expect(err.response.status).toBe(404);
      expect(err.response.data.statusCode).toBe(404);
      expect(err.response.data.message).toBe("Not found in Loom");
    }
  }, 10000);

  it("500 에러 처리", async () => {
    try {
      await axios.get(`http://localhost:${PORT}/error/500`);
      fail("에러가 발생해야 합니다");
    } catch (error) {
      const err = error as {
        response: {
          status: number;
          data: { statusCode: number; message: string };
        };
      };
      expect(err.response.status).toBe(500);
      expect(err.response.data.statusCode).toBe(500);
      expect(err.response.data.message).toBe("Internal error in Loom");
    }
  }, 10000);

  it("존재하지 않는 라우트 - 404", async () => {
    try {
      await axios.get(`http://localhost:${PORT}/nonexistent`);
      fail("에러가 발생해야 합니다");
    } catch (error) {
      const err = error as { response: { status: number } };
      expect(err.response.status).toBe(404);
    }
  }, 10000);

  it("파라미터 기반 에러", async () => {
    try {
      await axios.get(`http://localhost:${PORT}/users/error`);
      fail("에러가 발생해야 합니다");
    } catch (error) {
      const err = error as {
        response: { status: number; data: { message: string } };
      };
      expect(err.response.status).toBe(400);
      expect(err.response.data.message).toBe("Invalid user ID");
    }
  }, 10000);

  it("특수 문자 처리", async () => {
    const param = encodeURIComponent("hello world!");
    const res = await axios.get(`http://localhost:${PORT}/special/${param}`);

    expect(res.status).toBe(200);
    expect(res.data.param).toBe(param);
    expect(res.data.decoded).toBe("hello world!");
    expect(res.data.server).toBe("loom");
  }, 10000);

  it("JSON POST 요청", async () => {
    const testData = { name: "test", value: 123 };
    const res = await axios.post(`http://localhost:${PORT}/json`, testData);

    expect(res.status).toBe(201); // POST 요청은 201 Created 반환
    expect(res.data.received).toEqual(testData);
    expect(res.data.server).toBe("loom");
  }, 10000);

  it("빈 JSON 요청 - 400 에러", async () => {
    try {
      await axios.post(`http://localhost:${PORT}/json`, {});
      fail("에러가 발생해야 합니다");
    } catch (error) {
      const err = error as {
        response: { status: number; data: { message: string } };
      };
      expect(err.response.status).toBe(400);
      expect(err.response.data.message).toBe("Empty body");
    }
  }, 10000);

  it("동시 에러 요청 처리", async () => {
    const promises = Array.from({ length: 10 }, () =>
      axios.get(`http://localhost:${PORT}/error/400`).catch((e) => e.response),
    );

    const responses = await Promise.all(promises);

    responses.forEach((response) => {
      expect(response.status).toBe(400);
      expect(response.data.statusCode).toBe(400);
    });
  }, 15000);
});
