/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpServer } from "../../interfaces";
import { LoomServer } from "./server";

/**
 * Loom 서버 어댑터
 * HttpServer 인터페이스의 구현체를 래핑하여 추가 기능을 제공합니다.
 */
export class LoomServerAdapter implements HttpServer {
  constructor(private loomServer: LoomServer) {}

  async start(options: any): Promise<void> {
    console.log("Starting Loom Server...");
    await this.loomServer.start(options);
  }

  async stop(): Promise<void> {
    console.log("Stopping Loom Server...");
    await this.loomServer.stop();
  }

  getInstance(): any {
    return this.loomServer.getInstance();
  }

  getRouteRegistry(): any {
    return this.loomServer.getRouteRegistry();
  }

  /**
   * 서버의 상태를 확인합니다.
   */
  isRunning(): boolean {
    const instance = this.getInstance();
    return instance && instance.listening;
  }

  /**
   * 서버 통계를 반환합니다.
   */
  getStats(): {
    uptime: number;
    routes: number;
    isRunning: boolean;
  } {
    const routeRegistry = this.getRouteRegistry();
    const routes = routeRegistry.getAllRoutes
      ? routeRegistry.getAllRoutes()
      : [];

    return {
      uptime: process.uptime(),
      routes: routes.length,
      isRunning: this.isRunning(),
    };
  }

  /**
   * 헬스체크 엔드포인트를 등록합니다.
   */
  enableHealthCheck(path: string = "/health"): void {
    const routeRegistry = this.getRouteRegistry();

    routeRegistry.register({
      path,
      method: "GET",
      handler: async (context: any) => {
        const stats = this.getStats();
        context.response.json({
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: stats.uptime,
          routes: stats.routes,
          server: "loom",
        });
      },
    });

    console.log(`Health check enabled at ${path}`);
  }

  /**
   * 기본 미들웨어들을 설정합니다.
   */
  useDefaultMiddleware(): void {
    // CORS 미들웨어
    this.useCors();

    // 로깅 미들웨어
    this.useLogging();
  }

  /**
   * CORS 미들웨어를 추가합니다.
   */
  private useCors(): void {
    // CORS 로직은 추후 구현
    console.log("CORS middleware enabled");
  }

  /**
   * 로깅 미들웨어를 추가합니다.
   */
  private useLogging(): void {
    // 로깅 로직은 추후 구현
    console.log("Logging middleware enabled");
  }
}
