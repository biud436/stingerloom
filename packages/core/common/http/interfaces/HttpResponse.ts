/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * HTTP 응답 객체의 구조를 정의하는 인터페이스
 */
export interface HttpResponse {
    /**
     * HTTP 상태 코드를 설정합니다.
     *
     * @returns this 메서드 체이닝을 위해 자신을 반환
     */
    status(code: number): this;

    /**
     * 일반 데이터를 응답으로 보냅니다.
     *
     * @param body 전송할 데이터
     */
    send(body: any): void;

    /**
     * JSON 데이터를 응답으로 보냅니다.
     *
     * @param body 전송할 JSON 데이터
     */
    json(body: any): void;

    /**
     * HTTP 헤더를 설정합니다.
     *
     * @returns this 메서드 체이닝을 위해 자기 자신을 반환
     */
    setHeader(name: string, value: string): this;

    /**
     * 뷰 템플릿을 렌더링합니다.
     */
    view(path: string, data: any): void;
}
