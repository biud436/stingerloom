/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrieNode, RouteMatch } from "./types";

/**
 * Trie 기반 라우트 트리
 * 효율적인 라우트 매칭을 위한 트리 자료구조
 */
export class RouteTrie {
  private root: TrieNode;

  constructor() {
    this.root = {
      children: new Map(),
      isEndOfRoute: false,
    };
  }

  /**
   * 라우트를 Trie에 삽입합니다.
   *
   * @param path 라우트 경로 (예: "/api/users/:id")
   * @param route 라우트 정보
   */
  insert(path: string, route: any): void {
    const segments = this.pathToSegments(path);
    let currentNode = this.root;

    for (const segment of segments) {
      if (segment.startsWith(":")) {
        // 파라미터 세그먼트 (:id, :name 등)
        if (!currentNode.paramNode) {
          currentNode.paramNode = {
            children: new Map(),
            isEndOfRoute: false,
          };
        }
        currentNode.paramNode.paramName = segment.slice(1); // ':' 제거
        currentNode = currentNode.paramNode;
      } else if (segment === "*") {
        // 와일드카드 세그먼트
        if (!currentNode.wildcardNode) {
          currentNode.wildcardNode = {
            children: new Map(),
            isEndOfRoute: false,
          };
        }
        currentNode = currentNode.wildcardNode;
      } else {
        // 정적 세그먼트
        if (!currentNode.children.has(segment)) {
          currentNode.children.set(segment, {
            children: new Map(),
            isEndOfRoute: false,
          });
        }
        currentNode = currentNode.children.get(segment)!;
      }
    }

    currentNode.isEndOfRoute = true;
    currentNode.route = route;
  }

  /**
   * 주어진 경로에 매칭되는 라우트를 찾습니다.
   *
   * @param path 요청 경로 (예: "/api/users/123")
   * @returns 매칭된 라우트와 파라미터들
   */
  search(path: string): RouteMatch | null {
    const segments = this.pathToSegments(path);
    const params: Record<string, string> = {};

    const result = this.searchRecursive(this.root, segments, 0, params);

    if (result) {
      return {
        route: result.route,
        params,
      };
    }

    return null;
  }

  /**
   * 재귀적으로 라우트를 검색합니다.
   */
  private searchRecursive(
    node: TrieNode,
    segments: string[],
    index: number,
    params: Record<string, string>,
  ): TrieNode | null {
    // 모든 세그먼트를 처리했는지 확인
    if (index === segments.length) {
      return node.isEndOfRoute ? node : null;
    }

    const segment = segments[index];

    // 1. 정적 매칭 시도
    if (node.children.has(segment)) {
      const result = this.searchRecursive(
        node.children.get(segment)!,
        segments,
        index + 1,
        params,
      );
      if (result) return result;
    }

    // 2. 파라미터 매칭 시도
    if (node.paramNode) {
      if (node.paramNode.paramName) {
        params[node.paramNode.paramName] = decodeURIComponent(segment);
      }

      const result = this.searchRecursive(
        node.paramNode,
        segments,
        index + 1,
        params,
      );

      if (result) return result;

      // 백트래킹: 파라미터 제거
      if (node.paramNode.paramName) {
        delete params[node.paramNode.paramName];
      }
    }

    // 3. 와일드카드 매칭 시도
    if (node.wildcardNode) {
      // 와일드카드는 나머지 모든 세그먼트를 매칭
      return node.wildcardNode.isEndOfRoute ? node.wildcardNode : null;
    }

    return null;
  }

  /**
   * 경로를 세그먼트 배열로 변환합니다.
   *
   * @param path 경로 문자열
   * @returns 세그먼트 배열
   */
  private pathToSegments(path: string): string[] {
    return path.split("/").filter((segment) => segment.length > 0);
  }

  /**
   * Trie의 모든 라우트를 반환합니다.
   */
  getAllRoutes(): any[] {
    const routes: any[] = [];
    this.collectRoutes(this.root, routes);
    return routes;
  }

  /**
   * 재귀적으로 모든 라우트를 수집합니다.
   */
  private collectRoutes(node: TrieNode, routes: any[]): void {
    if (node.isEndOfRoute && node.route) {
      routes.push(node.route);
    }

    // 정적 자식 노드들 탐색
    for (const child of node.children.values()) {
      this.collectRoutes(child, routes);
    }

    // 파라미터 노드 탐색
    if (node.paramNode) {
      this.collectRoutes(node.paramNode, routes);
    }

    // 와일드카드 노드 탐색
    if (node.wildcardNode) {
      this.collectRoutes(node.wildcardNode, routes);
    }
  }

  /**
   * Trie 구조를 시각화합니다 (디버깅용).
   */
  printTrie(): void {
    console.log("\n Route Trie Structure:");
    console.log("========================");
    this.printTrieRecursive(this.root, "", 0);
    console.log("========================\n");
  }

  /**
   * 재귀적으로 Trie 구조를 출력합니다.
   */
  private printTrieRecursive(
    node: TrieNode,
    prefix: string,
    depth: number,
  ): void {
    const indent = "  ".repeat(depth);

    if (node.isEndOfRoute) {
      console.log(
        `${indent}${prefix} ✓ (route: ${node.route?.method || "unknown"} ${node.route?.path || "unknown"})`,
      );
    } else if (prefix) {
      console.log(`${indent}${prefix}`);
    }

    // 정적 자식들 출력
    for (const [segment, child] of node.children.entries()) {
      this.printTrieRecursive(child, segment, depth + 1);
    }

    // 파라미터 노드 출력
    if (node.paramNode) {
      this.printTrieRecursive(
        node.paramNode,
        `:${node.paramNode.paramName || "param"}`,
        depth + 1,
      );
    }

    // 와일드카드 노드 출력
    if (node.wildcardNode) {
      this.printTrieRecursive(node.wildcardNode, "*", depth + 1);
    }
  }

  /**
   * Trie의 통계 정보를 반환합니다.
   */
  getStats(): {
    totalNodes: number;
    totalRoutes: number;
    maxDepth: number;
    parameterRoutes: number;
    wildcardRoutes: number;
  } {
    const stats = {
      totalNodes: 0,
      totalRoutes: 0,
      maxDepth: 0,
      parameterRoutes: 0,
      wildcardRoutes: 0,
    };

    this.calculateStats(this.root, 0, stats);

    return stats;
  }

  /**
   * 재귀적으로 통계를 계산합니다.
   */
  private calculateStats(node: TrieNode, depth: number, stats: any): void {
    stats.totalNodes++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (node.isEndOfRoute) {
      stats.totalRoutes++;
    }

    if (node.paramNode) {
      stats.parameterRoutes++;
      this.calculateStats(node.paramNode, depth + 1, stats);
    }

    if (node.wildcardNode) {
      stats.wildcardRoutes++;
      this.calculateStats(node.wildcardNode, depth + 1, stats);
    }

    for (const child of node.children.values()) {
      this.calculateStats(child, depth + 1, stats);
    }
  }
}
