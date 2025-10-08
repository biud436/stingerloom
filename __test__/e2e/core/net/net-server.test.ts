import { NetServerAdapter } from "../../../../packages/core/common/http/adapters/net";
import { HttpContext } from "../../../../packages/core/common/http/interfaces";
import axios from "axios";

describe("NetServerAdapter 테스트", () => {
  let server: NetServerAdapter;
  const PORT = 3001;
  const BASE_URL = `http://localhost:${PORT}`;

  beforeAll(async () => {
    server = new NetServerAdapter();

    // 라우트 등록
    server.getRouteRegistry().register({
      method: "get",
      path: "/",
      handler: async (context: HttpContext) => {
        context.response.json({
          message: "Hello from Net Server!",
          server: "Custom Net-based HTTP Server",
          timestamp: new Date().toISOString(),
        });
      },
    });

    server.getRouteRegistry().register({
      method: "get",
      path: "/health",
      handler: async (context: HttpContext) => {
        context.response.json({
          status: "healthy",
          server: "net-server",
          uptime: process.uptime(),
        });
      },
    });

    server.getRouteRegistry().register({
      method: "post",
      path: "/data",
      handler: async (context: HttpContext) => {
        const body = context.request.body;
        context.response.json({
          received: body,
          echo: true,
          server: "net-server",
        });
      },
    });

    server.getRouteRegistry().register({
      method: "get",
      path: "/users/:id",
      handler: async (context: HttpContext) => {
        // URL 매개변수는 현재 구현에서는 간단하게 처리
        const url = context.request.url;
        const id = url.split("/")[2];

        context.response.json({
          userId: id,
          message: `User ${id} found`,
          server: "net-server",
        });
      },
    });

    // 서버 시작
    await server.start({ port: PORT, host: "localhost" });

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
    expect(response.data.message).toBe("Hello from Net Server!");
    expect(response.data.server).toBe("Custom Net-based HTTP Server");
  });

  it("health 엔드포인트가 정상 작동해야 함", async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    expect(response.status).toBe(200);
    expect(response.data.status).toBe("healthy");
    expect(response.data.server).toBe("net-server");
    expect(typeof response.data.uptime).toBe("number");
  });

  it("POST 요청이 정상 작동해야 함", async () => {
    const testData = { test: "data", value: 123 };
    const response = await axios.post(`${BASE_URL}/data`, testData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.received).toEqual(testData);
    expect(response.data.echo).toBe(true);
    expect(response.data.server).toBe("net-server");
  });

  it("URL 파라미터가 올바르게 처리되어야 함", async () => {
    const userId = "123";
    const response = await axios.get(`${BASE_URL}/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.data.userId).toBe(userId);
    expect(response.data.message).toBe(`User ${userId} found`);
    expect(response.data.server).toBe("net-server");
  });

  it("존재하지 않는 경로는 404를 반환해야 함", async () => {
    try {
      await axios.get(`${BASE_URL}/nonexistent`);
    } catch (error: unknown) {
      const axiosError = error as {
        response: {
          status: number;
          data: { error: string; statusCode: number };
        };
      };
      expect(axiosError.response.status).toBe(404);
      expect(axiosError.response.data.error).toBe("Not Found");
      expect(axiosError.response.data.statusCode).toBe(404);
    }
  });

  it("다양한 HTTP 메서드를 지원해야 함", async () => {
    // GET은 이미 테스트됨

    // POST 테스트
    const postResponse = await axios.post(`${BASE_URL}/data`, {
      method: "POST",
    });
    expect(postResponse.status).toBe(200);

    // 404 테스트 (PUT은 등록되지 않았으므로)
    try {
      await axios.put(`${BASE_URL}/data`, { method: "PUT" });
    } catch (error: unknown) {
      const axiosError = error as { response: { status: number } };
      expect(axiosError.response.status).toBe(404);
    }
  });
});
