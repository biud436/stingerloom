/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * HTTP 요청 객체의 구조를 정의하는 인터페이스
 */
export interface HttpRequest {
  /** HTTP 메서드 (GET, POST, etc.) */
  readonly method: string;

  /** 요청 URL */
  readonly url: string;

  /** 요청 본문 데이터 */
  readonly body: any;

  /** URL 파라미터 (/users/:id 의 id 등) */
  readonly params: Record<string, string>;

  /** 쿼리 파라미터 (?name=value 등) */
  readonly query: Record<string, unknown>;

  /** HTTP 헤더 */
  readonly headers: Record<string, string>;

  /**
   * 세션 데이터
   */
  readonly session?: any;

  /**
   * 클라이언트 IP 주소
   */
  readonly ip?: string;

  /**
   * cookie 데이터
   */
  readonly cookies?: Record<string, unknown>;

  /**
   * 클라이언트 호스트 이름
   */
  readonly hostname?: string;

  /**
   * User Agent 문자열
   */
  readonly userAgent?: string;

  /**
   * 특정 헤더 값을 가져옵니다.
   */
  header(name: string): string | undefined;
}
