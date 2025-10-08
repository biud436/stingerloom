import { LoomServer } from "../../../../packages/core/common/http/adapters/loom/server/LoomServer";
import { LoomCorsPlugin } from "../../../../packages/core/common/http/adapters/loom/plugins/LoomCorsPlugin";
import { HttpContext } from "../../../../packages/core/common/http/interfaces";
import axios from "axios";

describe("LoomCorsPlugin 테스트", () => {
  let server: LoomServer;
  const PORT = 3003;
  const BASE_URL = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = LoomServer.createWithAdapter("http");

    // 기본 라우트들 등록
    server.getRouteRegistry().register({
      method: "get",
      path: "/",
      handler: async (context: HttpContext) => {
        context.response.json({
          message: "Hello from Loom Server with CORS!",
          timestamp: new Date().toISOString(),
          cors: "enabled",
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
      path: "/cors-test",
      handler: async (context: HttpContext) => {
        context.response.json({
          message: "This endpoint supports CORS",
          origin: context.request.headers.origin || "no origin",
          userAgent: context.request.userAgent,
          timestamp: new Date().toISOString(),
        });
      },
    });

    // CORS 플러그인과 함께 서버 시작
    await server.start({
      port: PORT,
      host: "localhost",
      timeout: 30000,
      plugins: [
        new LoomCorsPlugin({
          origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://example.com",
          ],
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
          exposedHeaders: ["X-Total-Count", "X-Custom-Header"],
          credentials: true,
          maxAge: 3600, // 1시간
          optionsSuccessStatus: 200,
        }),
      ],
    });

    // 서버가 완전히 시작될 때까지 잠깐 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  it("서버가 정상적으로 시작되어야 함", async () => {
    const response = await axios.get(`${BASE_URL}/`);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe("Hello from Loom Server with CORS!");
    expect(response.data.cors).toBe("enabled");
  });

  it("CORS 헤더가 올바르게 설정되어야 함", async () => {
    const response = await axios.get(`${BASE_URL}/cors-test`, {
      headers: {
        Origin: "http://localhost:3000",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("Preflight 요청이 올바르게 처리되어야 함", async () => {
    const response = await axios.options(`${BASE_URL}/api/data`, {
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Content-Type",
    );
    expect(response.headers["access-control-max-age"]).toBe("3600");
  });

  it("허용되지 않은 Origin은 CORS 헤더가 없어야 함", async () => {
    const response = await axios.get(`${BASE_URL}/cors-test`, {
      headers: {
        Origin: "http://unauthorized-domain.com",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("POST 요청이 CORS와 함께 정상 작동해야 함", async () => {
    const testData = { test: "data" };
    const response = await axios.post(`${BASE_URL}/api/data`, testData, {
      headers: {
        Origin: "http://localhost:3000",
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.received).toEqual(testData);
    expect(response.data.method).toBe("POST");
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
  });
});
