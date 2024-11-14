/**
 * 서버 시작 시 필요한 설정 옵션들을 정의하는 인터페이스
 */

export interface ServerOptions {
    /** 서버가 리스닝할 포트 번호 */
    port: number;
    /** 서버가 바인딩될 호스트 주소 (선택적) */
    host?: string;
}
