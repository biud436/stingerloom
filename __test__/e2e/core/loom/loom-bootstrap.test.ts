/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  Controller,
  EntryModule,
  Get,
  Ip,
  ServerBootstrapApplication,
} from "@stingerloom/core";
import { LoomServerFactory } from "@stingerloom/core/common/http/adapters/loom";
import axios from "axios";

describe("Loom 서버 세팅 및 시작 테스트", () => {
  let application: TestServerApplication;
  const PORT = 3001; // Express와 다른 포트 사용

  @Controller("/")
  class AppController {
    @Get("/")
    index() {
      return "Hello, Loom Server!";
    }

    @Get("/health")
    health() {
      return {
        status: "ok",
        server: "loom",
        engine: "native",
        timestamp: new Date().toISOString(),
      };
    }

    @Get("/test")
    test() {
      throw new BadRequestException("test error from loom");
      return "this is test";
    }

    @Get("/ips")
    ips(@Ip() ip: string) {
      return {
        ip,
        server: "loom",
        message: "IP extracted by Loom server",
      };
    }

    @Get("/trie-demo")
    trieDemo() {
      return {
        message: "Trie-based routing works!",
        server: "loom",
        routing: "O(k) complexity",
        algorithm: "Trie (Prefix Tree)",
      };
    }
  }

  @EntryModule({
    imports: [],
    controllers: [AppController],
    providers: [],
  })
  class AppModule {}

  class TestServerApplication extends ServerBootstrapApplication {
    override beforeStart(): void {
      console.log("Starting Loom Server for E2E testing...");
    }
  }

  beforeAll((done) => {
    application = new TestServerApplication(
      AppModule,
      new LoomServerFactory(), // Loom 서버 팩토리 사용
    );

    application.on("start", () => {
      console.log(`Loom server started on port ${PORT}`);
      done();
    });

    application.start({
      port: PORT,
    });
  }, 30000); // 30초 타임아웃

  afterAll(async () => {
    console.log("Stopping Loom server...");
    await application.stop();
  }, 15000);

  describe("기본 라우팅 테스트", () => {
    it("/ 에 접근 - Loom 서버 응답 확인", async () => {
      console.log("Sending request to /");
      const res = await axios.get(`http://localhost:${PORT}/`);

      console.log("Response from /:", res.data);

      expect(res.data).toBe("Hello, Loom Server!");
      expect(res.status).toBe(200);
    }, 10000);

    it("/health 에 접근 - 헬스체크 응답 확인", async () => {
      const res = await axios.get(`http://localhost:${PORT}/health`);

      expect(res.data).toEqual({
        status: "ok",
        server: "loom",
        engine: "native",
        timestamp: expect.any(String),
      });
      expect(res.status).toBe(200);
    }, 10000);

    it("/trie-demo 에 접근 - Trie 라우팅 확인", async () => {
      const res = await axios.get(`http://localhost:${PORT}/trie-demo`);

      expect(res.data).toEqual({
        message: "Trie-based routing works!",
        server: "loom",
        routing: "O(k) complexity",
        algorithm: "Trie (Prefix Tree)",
      });
      expect(res.status).toBe(200);
    }, 10000);
  });

  describe("에러 처리 테스트", () => {
    it("400번 오류가 제대로 검출되는가?", async () => {
      try {
        await axios.get(`http://localhost:${PORT}/test`);
        fail("예외가 발생해야 합니다");
      } catch (error) {
        const axiosError = error as {
          response: {
            status: number;
            data: { statusCode: number; message: string };
          };
        };
        expect(axiosError.response.status).toBe(400);
        expect(axiosError.response.data).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: "test error from loom",
          }),
        );
      }
    }, 10000);

    it("404 에러 처리 - 존재하지 않는 경로", async () => {
      try {
        await axios.get(`http://localhost:${PORT}/nonexistent`);
        fail("예외가 발생해야 합니다");
      } catch (error) {
        const axiosError = error as { response: { status: number } };
        expect(axiosError.response.status).toBe(404);
      }
    }, 10000);
  });

  describe("IP 추출 테스트", () => {
    it("IP가 제대로 반환되는가?", async () => {
      const res = await axios.get(`http://localhost:${PORT}/ips`);

      expect(res.data).toEqual({
        ip: expect.any(String),
        server: "loom",
        message: "IP extracted by Loom server",
      });
      expect(res.status).toBe(200);

      // IPv6 loopback 또는 IPv4 loopback 확인
      expect(["::1", "127.0.0.1"]).toContain(res.data.ip);
    }, 10000);
  });

  describe("성능 및 안정성 테스트", () => {
    it("동시 요청 처리 테스트", async () => {
      const promises = [];

      // 10개의 동시 요청
      for (let i = 0; i < 10; i++) {
        promises.push(
          axios.get(`http://localhost:${PORT}/health`).then((res) => res.data),
        );
      }

      const results = await Promise.all(promises);

      // 모든 요청이 성공적으로 처리되었는지 확인
      results.forEach((result) => {
        expect(result.status).toBe("ok");
        expect(result.server).toBe("loom");
      });
    }, 15000);

    it("연속 요청 처리 테스트", async () => {
      const responses = [];

      // 연속 요청 수를 줄여서 테스트 시간 단축
      for (let i = 0; i < 20; i++) {
        const res = await axios.get(`http://localhost:${PORT}/trie-demo`);
        responses.push(res.data);
      }

      // 모든 요청이 동일한 응답을 반환하는지 확인
      responses.forEach((response) => {
        expect(response.message).toBe("Trie-based routing works!");
        expect(response.server).toBe("loom");
      });
    }, 20000);
  });
});
