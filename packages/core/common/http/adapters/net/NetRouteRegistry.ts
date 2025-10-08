/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpStatus } from "@stingerloom/core/common/HttpStatus";
import { HttpRoute, HttpRouteRegistry } from "../../interfaces";
import { NetRequestAdapter } from "./NetRequestAdapter";
import { NetResponseAdapter } from "./NetResponseAdapter";

/**
 * Net 서버를 위한 라우트 레지스트리
 * 라우트를 등록하고 매칭하는 기능을 제공합니다.
 */
export class NetRouteRegistry implements HttpRouteRegistry {
  private routes: HttpRoute[] = [];

  register(route: HttpRoute): void {
    console.log(`Registering route: ${route.method} ${route.path}`);
    this.routes.push(route);
  }

  registerExceptionHandler(): void {
    // Net 서버의 예외 처리는 NetServerAdapter에서 직접 처리
    console.log("Exception handler registration for Net server");
  }

  /**
   * 주어진 메서드와 경로에 대한 핸들러를 찾습니다.
   */
  findHandler(
    method: string,
    path: string,
  ):
    | ((
        request: NetRequestAdapter,
        response: NetResponseAdapter,
      ) => Promise<void>)
    | null {
    const matchedRoute = this.routes.find(
      (route) =>
        route.method.toLowerCase() === method.toLowerCase() &&
        this.matchPath(route.path, path),
    );

    if (!matchedRoute) {
      return null;
    }

    // 원래 핸들러를 Net 어댑터용으로 변환
    return async (request: NetRequestAdapter, response: NetResponseAdapter) => {
      try {
        // HttpContext 형태로 변환하여 핸들러 호출
        const context = {
          request,
          response,
        };

        await matchedRoute.handler(context);
      } catch (error) {
        console.error("Handler execution error:", error);
        try {
          response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        } catch (responseError) {
          console.error("Failed to send error response:", responseError);
        }
      }
    };
  }

  /**
   * 경로 매칭 로직
   * 간단한 정확 매칭과 기본적인 와일드카드 지원
   */
  private matchPath(routePath: string, requestPath: string): boolean {
    // 정확 매칭
    if (routePath === requestPath) {
      return true;
    }

    // 파라미터 매칭 지원 (예: /users/:id)
    const routeSegments = routePath.split("/");
    const requestSegments = requestPath.split("/");

    if (routeSegments.length !== requestSegments.length) {
      return false;
    }

    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const requestSegment = requestSegments[i];

      // 파라미터 세그먼트 (:id 같은)
      if (routeSegment.startsWith(":")) {
        continue; // 매칭으로 간주
      }

      // 정확 매칭이 필요한 세그먼트
      if (routeSegment !== requestSegment) {
        return false;
      }
    }

    return true;
  }

  /**
   * 등록된 모든 라우트를 반환합니다.
   */
  getRoutes(): HttpRoute[] {
    return [...this.routes];
  }

  /**
   * 특정 조건에 맞는 라우트를 찾습니다.
   */
  findRoutes(predicate: (route: HttpRoute) => boolean): HttpRoute[] {
    return this.routes.filter(predicate);
  }

  /**
   * 라우트를 제거합니다.
   */
  unregister(method: string, path: string): boolean {
    const initialLength = this.routes.length;
    this.routes = this.routes.filter(
      (route) => !(route.method === method && route.path === path),
    );
    return this.routes.length < initialLength;
  }

  /**
   * 모든 라우트를 제거합니다.
   */
  clear(): void {
    this.routes = [];
  }
}
