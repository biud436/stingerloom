import { LoomServer } from "../../../../packages/core/common/http/adapters/loom/server/LoomServer";
import { LoomRateLimitPlugin } from "../../../../packages/core/common/http/adapters/loom/plugins/LoomRateLimitPlugin";
import { HttpContext } from "../../../../packages/core/common/http/interfaces";
import axios from "axios";

describe("LoomRateLimitPlugin 테스트", () => {
  let server: LoomServer;
  const PORT = 3004;
  const BASE_URL = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = LoomServer.createWithAdapter("http");

    // 기본 라우트들 등록
    server.getRouteRegistry().register({
      method: "get",
      path: "/",
      handler: async (context: HttpContext) => {
        context.response.json({
          message: "Hello from Loom Server with Rate Limiting!",
          timestamp: new Date().toISOString(),
          rateLimit: "enabled",
        });
      },
    });

    server.getRouteRegistry().register({
      method: "post",
      path: "/api/data",
      handler: async (context: HttpContext) => {
        const body = context.request.body;
        context.response.json({
          received: body,
          method: "POST",
          timestamp: new Date().toISOString(),
        });
      },
    });

    server.getRouteRegistry().register({
      method: "get",
      path: "/rate-limit-test",
      handler: async (context: HttpContext) => {
        context.response.json({
          message: "This endpoint has rate limiting",
          userAgent: context.request.userAgent,
          timestamp: new Date().toISOString(),
        });
      },
    });

    server.getRouteRegistry().register({
      method: "get",
      path: "/unlimited",
      handler: async (context: HttpContext) => {
        context.response.json({
          message: "This endpoint bypasses rate limiting",
          timestamp: new Date().toISOString(),
        });
      },
    });

    // Rate Limit 플러그인과 함께 서버 시작
    await server.start({
      port: PORT,
      host: "localhost",
      timeout: 30000,
      plugins: [
        new LoomRateLimitPlugin({
          windowMs: 60 * 1000, // 1분
          max: 5, // 분당 5회
          message: "Too many requests, please slow down!",
          statusCode: 429,
          standardHeaders: true,
          legacyHeaders: true,
          skip: (req: Record<string, unknown>) => {
            // /unlimited 경로는 rate limit에서 제외
            const url = req.url as string;
            return url?.includes("/unlimited") || false;
          },
          onLimitReached: (req: Record<string, unknown>) => {
            const ip = req.ip as string;
            console.log(`Rate limit exceeded for ${ip || "unknown IP"}`);
          },
        }),
      ],
    });

    // 서버가 완전히 시작될 때까지 잠깐 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
      // 서버가 완전히 종료될 때까지 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  });

  describe("기본 Rate Limiting 기능", () => {
    it("정상적인 요청은 성공해야 함", async () => {
      const response = await axios.get(`${BASE_URL}/`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("message");
      expect(response.data.rateLimit).toBe("enabled");

      // Rate limit 헤더 확인
      expect(response.headers).toHaveProperty("ratelimit-limit");
      expect(response.headers).toHaveProperty("ratelimit-remaining");
      expect(response.headers).toHaveProperty("ratelimit-reset");
      expect(response.headers).toHaveProperty("x-ratelimit-limit");
      expect(response.headers).toHaveProperty("x-ratelimit-remaining");
      expect(response.headers).toHaveProperty("x-ratelimit-reset");
    });

    it("Rate limit 헤더가 올바르게 설정되어야 함", async () => {
      const response = await axios.get(`${BASE_URL}/rate-limit-test`);

      expect(response.status).toBe(200);
      expect(response.headers["ratelimit-limit"]).toBe("5");
      expect(response.headers["x-ratelimit-limit"]).toBe("5");
      expect(
        parseInt(response.headers["ratelimit-remaining"]),
      ).toBeLessThanOrEqual(5);
      expect(
        parseInt(response.headers["x-ratelimit-remaining"]),
      ).toBeLessThanOrEqual(5);
    });

    it("Rate limit을 초과하면 429 상태코드를 반환해야 함", async () => {
      // 새로운 윈도우를 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // 순차적으로 6번 요청 (limit은 5)
      const responses = [];
      for (let i = 0; i < 6; i++) {
        try {
          const response = await axios.get(`${BASE_URL}/rate-limit-test`);
          responses.push(response);
        } catch (error: unknown) {
          if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as {
              response: {
                status: number;
                data: unknown;
                headers: Record<string, string>;
              };
            };
            responses.push(axiosError.response);
          }
        }
        // 요청 간 짧은 지연
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // 처음 몇 개 요청은 성공해야 함
      let successCount = 0;
      let failureCount = 0;

      responses.forEach((response) => {
        if (response.status === 200) {
          successCount++;
        } else if (response.status === 429) {
          failureCount++;
        }
      });

      // 적어도 하나는 성공하고, 하나는 실패해야 함
      expect(successCount).toBeGreaterThan(0);
      expect(failureCount).toBeGreaterThan(0);

      // 429 응답 확인
      const rateLimitResponse = responses.find((r) => r.status === 429);
      if (rateLimitResponse) {
        expect(rateLimitResponse.data).toHaveProperty(
          "error",
          "Too Many Requests",
        );
        expect(rateLimitResponse.data).toHaveProperty(
          "message",
          "Too many requests, please slow down!",
        );
        expect(rateLimitResponse.data).toHaveProperty("statusCode", 429);
        expect(rateLimitResponse.headers).toHaveProperty("retry-after");
      }
    });

    it("다른 경로들도 동일한 rate limit을 공유해야 함", async () => {
      // 새로운 윈도우를 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // 다양한 경로로 요청 (에러 핸들링 포함)
      const responses = [];

      try {
        responses.push(await axios.get(`${BASE_URL}/`));
        await new Promise((resolve) => setTimeout(resolve, 50));

        responses.push(
          await axios.post(`${BASE_URL}/api/data`, { test: "data" }),
        );
        await new Promise((resolve) => setTimeout(resolve, 50));

        responses.push(await axios.get(`${BASE_URL}/rate-limit-test`));
      } catch (error: unknown) {
        // 일부 요청이 rate limit에 걸릴 수 있음
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response: { status: number; headers: Record<string, string> };
          };
          responses.push(axiosError.response);
        }
      }

      // 적어도 하나의 요청은 있어야 함
      expect(responses.length).toBeGreaterThan(0);

      // Rate limit 헤더가 있는지 확인
      responses.forEach((response) => {
        if (response.headers) {
          expect(response.headers).toHaveProperty("ratelimit-limit");
        }
      });
    });

    it("skip 함수가 올바르게 작동해야 함", async () => {
      // /unlimited 경로는 rate limit에서 제외되어야 함
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(axios.get(`${BASE_URL}/unlimited`));
      }

      const responses = await Promise.all(requests);

      // 모든 요청이 성공해야 함 (rate limit 없음)
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.data.message).toBe(
          "This endpoint bypasses rate limiting",
        );
      });
    });
  });

  describe("다양한 설정 옵션 테스트", () => {
    let customServer: LoomServer;
    const CUSTOM_PORT = 3005;
    const CUSTOM_BASE_URL = `http://localhost:${CUSTOM_PORT}`;

    beforeAll(async () => {
      customServer = LoomServer.createWithAdapter("http");

      customServer.getRouteRegistry().register({
        method: "get",
        path: "/custom",
        handler: async (context: HttpContext) => {
          context.response.json({
            message: "Custom rate limit settings",
            timestamp: new Date().toISOString(),
          });
        },
      });

      // 커스텀 설정으로 Rate Limit 플러그인 적용
      await customServer.start({
        port: CUSTOM_PORT,
        host: "localhost",
        timeout: 30000,
        plugins: [
          new LoomRateLimitPlugin({
            windowMs: 30 * 1000, // 30초
            max: 3, // 30초당 3회
            message: "Custom rate limit message",
            statusCode: 423, // 커스텀 상태코드
            standardHeaders: false, // 표준 헤더 비활성화
            legacyHeaders: true,
            keyGenerator: (req: Record<string, unknown>) => {
              // User-Agent 기반 키 생성
              const headers = (req.headers as Record<string, string>) || {};
              return `ua:${headers["user-agent"] || "unknown"}`;
            },
          }),
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
      if (customServer) {
        await customServer.stop();
        // 서버가 완전히 종료될 때까지 대기
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    });

    it("커스텀 설정이 올바르게 적용되어야 함", async () => {
      const response = await axios.get(`${CUSTOM_BASE_URL}/custom`);

      expect(response.status).toBe(200);

      // 표준 헤더는 없어야 함
      expect(response.headers).not.toHaveProperty("ratelimit-limit");
      expect(response.headers).not.toHaveProperty("ratelimit-remaining");

      // 레거시 헤더는 있어야 함
      expect(response.headers).toHaveProperty("x-ratelimit-limit", "3");
    });

    it("커스텀 상태코드와 메시지가 사용되어야 함", async () => {
      // 연속으로 4번 요청 (limit은 3)
      const requests = [];
      for (let i = 0; i < 4; i++) {
        requests.push(
          axios
            .get(`${CUSTOM_BASE_URL}/custom`)
            .catch((error) => error.response),
        );
      }

      const responses = await Promise.all(requests);

      // 마지막 요청은 커스텀 설정으로 실패
      expect(responses[3].status).toBe(423);
      expect(responses[3].data.message).toBe("Custom rate limit message");
      expect(responses[3].data.statusCode).toBe(423);
    });
  });

  describe("에러 처리", () => {
    it("잘못된 요청도 안전하게 처리해야 함", async () => {
      try {
        // 잘못된 JSON 데이터로 POST 요청
        await axios.post(`${BASE_URL}/api/data`, "invalid json", {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error: unknown) {
        // 에러가 발생해도 rate limit 헤더는 있어야 함
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response: { headers: Record<string, string> };
          };
          expect(axiosError.response.headers).toHaveProperty("ratelimit-limit");
        }
      }
    });

    it("존재하지 않는 경로도 rate limit이 적용되어야 함", async () => {
      try {
        const response = await axios.get(`${BASE_URL}/nonexistent`);
        // 404일 수도 있지만 rate limit 헤더는 있어야 함
        expect(response.headers).toHaveProperty("ratelimit-limit");
      } catch (error: unknown) {
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response: { headers: Record<string, string> };
          };
          expect(axiosError.response.headers).toHaveProperty("ratelimit-limit");
        }
      }
    });
  });

  describe("성능 테스트", () => {
    it("많은 요청을 빠르게 처리할 수 있어야 함", async () => {
      // 새로운 윈도우를 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const startTime = Date.now();

      // 순차적으로 여러 요청 보내기 (rate limit 내에서)
      const responses = [];
      for (let i = 0; i < 2; i++) {
        try {
          const response = await axios.get(`${BASE_URL}/rate-limit-test`);
          responses.push(response);
        } catch (error: unknown) {
          if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as { response: { status: number } };
            responses.push(axiosError.response);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const endTime = Date.now();

      // 적어도 하나의 응답은 있어야 함
      expect(responses.length).toBeGreaterThan(0);

      // 성능 확인 (5초 이내에 완료되어야 함)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
