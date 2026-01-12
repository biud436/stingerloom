/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpRoute,
  HttpRouteRegistry,
  HttpRequest,
  HttpResponse,
} from "../../interfaces";
import { HttpMethod } from "../../../HttpMethod";
import { RouteTrie } from "./utils";
import { HttpStatus } from "@stingerloom/core/common/HttpStatus";
import { Logger } from "@stingerloom/core/common/Logger";

/**
 * Loom 서버의 라우트 레지스트리 구현체
 * Trie 자료구조를 사용하여 효율적인 URL 패턴 매칭과 파라미터 추출을 담당합니다.
 */
export class LoomRouteRegistry implements HttpRouteRegistry {
  private routeTries: Map<string, RouteTrie> = new Map();
  private routes: HttpRoute[] = []; // 전체 라우트 목록 유지 (호환성)
  private readonly logger = new Logger(LoomRouteRegistry.name);

  register(route: HttpRoute): void {
    const method = route.method.toUpperCase();

    // 메서드별 Trie가 없으면 생성
    if (!this.routeTries.has(method)) {
      this.routeTries.set(method, new RouteTrie());
    }

    // Trie에 라우트 삽입
    const trie = this.routeTries.get(method)!;
    trie.insert(route.path, route);

    // 전체 라우트 목록에도 추가 (호환성)
    this.routes.push(route);

    this.logger.info(`Registered route: ${method} ${route.path}`);
  }

  registerExceptionHandler(): void {
    // 예외 핸들러 등록 로직 (추후 구현)
    this.logger.info("Exception handler registered");
  }

  /**
   * 주어진 메서드와 경로에 대한 핸들러를 찾습니다.
   * Trie 자료구조를 사용하여 O(k) 시간복잡도로 라우트를 찾습니다. (k는 경로 길이)
   */
  findHandler(
    method: string,
    path: string,
  ): ((request: HttpRequest, response: HttpResponse) => Promise<void>) | null {
    const trie = this.routeTries.get(method.toUpperCase());
    if (!trie) {
      return null;
    }

    // Trie에서 라우트 검색
    const match = trie.search(path);
    if (!match) {
      return null;
    }

    const route = match.route;
    const params = match.params;

    return async (request: HttpRequest, response: HttpResponse) => {
      // URL 파라미터 설정
      if ("setParams" in request && typeof request.setParams === "function") {
        (request as any).setParams(params);
      }

      // 미들웨어 실행
      if (route.middleware && route.middleware.length > 0) {
        for (let i = 0; i < route.middleware.length; i++) {
          const middleware = route.middleware[i];
          let nextCalled = false;

          const next = async () => {
            nextCalled = true;
          };

          await middleware(request, response, next);

          if (!nextCalled) {
            // next()가 호출되지 않았으면 미들웨어 체인 중단
            return;
          }
        }
      }

      // 핸들러 실행
      try {
        const result = await route.handler({ request, response });

        const hasValidResult = result !== undefined && !(response as any)._sent;
        const isResultUndefined =
          result === undefined && !(response as any)._sent;
        if (hasValidResult) {
          const statusCode =
            route.method.toLowerCase() === "post"
              ? HttpStatus.CREATED
              : HttpStatus.OK;
          response.status(statusCode).json(result);
        } else if (isResultUndefined) {
          const statusCode =
            route.method.toLowerCase() === "post"
              ? HttpStatus.CREATED
              : HttpStatus.OK;
          response.status(statusCode).json({});
        }
      } catch (error) {
        this.logger.error(`Handler execution error: ${error}`);

        if (!(response as any)._sent) {
          const status =
            (error as any)?.status || HttpStatus.INTERNAL_SERVER_ERROR;
          const name = (error as any)?.name || "Internal Server Error";
          response.status(status).json({
            error: name,
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
            statusCode: status,
          });
        }
      }
    };
  }

  /**
   * 특정 경로에 대한 라우트가 존재하는지 확인합니다.
   */
  hasRoute(method: string, path: string): boolean {
    const trie = this.routeTries.get(method.toUpperCase());
    if (!trie) {
      return false;
    }

    const match = trie.search(path);
    return match !== null;
  }

  /**
   * 모든 Trie 구조를 시각화합니다 (디버깅용).
   */
  printTrieStructure(): void {
    for (const [method, trie] of this.routeTries.entries()) {
      this.logger.info(`\n${method} Routes Trie:`);
      trie.printTrie();
    }
  }

  /**
   * 라우트 등록 성능 벤치마크를 위한 메서드
   */
  getBenchmarkInfo(): {
    totalRoutes: number;
    totalMethods: number;
    averageDepth: number;
    totalNodes: number;
  } {
    let totalRoutes = 0;
    let totalNodes = 0;
    let totalDepth = 0;

    for (const trie of this.routeTries.values()) {
      const stats = trie.getStats();
      totalRoutes += stats.totalRoutes;
      totalNodes += stats.totalNodes;
      totalDepth += stats.maxDepth;
    }

    return {
      totalRoutes,
      totalMethods: this.routeTries.size,
      averageDepth:
        this.routeTries.size > 0 ? totalDepth / this.routeTries.size : 0,
      totalNodes,
    };
  }

  /**
   * 등록된 모든 라우트를 반환합니다.
   */
  getAllRoutes(): HttpRoute[] {
    return [...this.routes]; // 전체 라우트 배열 반환
  }

  /**
   * 특정 메서드의 라우트들을 반환합니다.
   */
  getRoutesByMethod(method: HttpMethod): HttpRoute[] {
    return this.routes.filter(
      (route) => route.method.toUpperCase() === method.toUpperCase(),
    );
  }

  /**
   * 라우트 정보를 출력합니다 (디버깅용)
   */
  printRoutes(): void {
    this.logger.info("\nRegistered Routes:");
    this.logger.info("====================");

    // 메서드별로 그룹화하여 출력
    const methodGroups = new Map<string, HttpRoute[]>();

    for (const route of this.routes) {
      const method = route.method.toUpperCase();
      if (!methodGroups.has(method)) {
        methodGroups.set(method, []);
      }
      methodGroups.get(method)!.push(route);
    }

    for (const [method, routes] of methodGroups.entries()) {
      for (const route of routes) {
        this.logger.info(`${method.padEnd(8)} ${route.path}`);
      }
    }

    this.logger.info("====================");

    // Trie 통계 출력
    this.printTrieStats();
  }

  /**
   * Trie 통계를 출력합니다.
   */
  printTrieStats(): void {
    this.logger.info("\nTrie Statistics:");
    this.logger.info("===================");

    let totalNodes = 0;
    let totalRoutes = 0;

    for (const [method, trie] of this.routeTries.entries()) {
      const stats = trie.getStats();
      this.logger.info(
        `${method}: ${stats.totalRoutes} routes, ${stats.totalNodes} nodes, depth ${stats.maxDepth}`,
      );
      totalNodes += stats.totalNodes;
      totalRoutes += stats.totalRoutes;
    }

    this.logger.info(`Total: ${totalRoutes} routes, ${totalNodes} nodes`);
    this.logger.info("===================\n");
  }
}
