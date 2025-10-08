/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Trie 노드 인터페이스
 * 라우트 트리의 각 노드를 나타냅니다.
 */
export interface TrieNode {
  /** 자식 노드들 (정적 경로) */
  children: Map<string, TrieNode>;

  /** 파라미터 노드 (:id 같은 동적 경로) */
  paramNode?: TrieNode;

  /** 파라미터 이름 (:id에서 "id") */
  paramName?: string;

  /** 이 노드에서 끝나는 라우트 정보 */
  route?: any;

  /** 와일드카드 노드 (*) */
  wildcardNode?: TrieNode;

  /** 이 경로가 라우트의 끝인지 여부 */
  isEndOfRoute: boolean;
}

/**
 * 라우트 매칭 결과
 */
export interface RouteMatch {
  /** 매칭된 라우트 정보 */
  route: any;

  /** URL에서 추출된 파라미터들 */
  params: Record<string, string>;
}
