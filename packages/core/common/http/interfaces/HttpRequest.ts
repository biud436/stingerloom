/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * HTTP 요청 객체의 구조를 정의하는 인터페이스
 */
export interface HttpRequest {
    /** 요청 본문 데이터 */
    body: any;
    /** URL 파라미터 (/users/:id 의 id 등) */
    params: Record<string, string>;
    /** 쿼리 파라미터 (?name=value 등) */
    query: Record<string, string>;
    /** HTTP 헤더 */
    headers: Record<string, string>;
}
