/**
 * 서버 시작 시 필요한 설정 옵션들을 정의하는 인터페이스
 */

export interface ServerOptions {
  /** 서버가 리스닝할 포트 번호 */
  port: number;
  /** 서버가 바인딩될 호스트 주소 (선택적) */
  host?: string;
  /** HTTPS 설정 (선택적) */
  https?: {
    key: string;
    cert: string;
    ca?: string;
  };
  /** WebSocket 지원 여부 (선택적) */
  websocket?: boolean;
  /** 요청 타임아웃 (밀리초, 기본값: 30000) */
  timeout?: number;
  /** 최대 헤더 크기 (바이트, 기본값: 8192) */
  maxHeaderSize?: number;
  /** Keep-Alive 타임아웃 (밀리초, 기본값: 5000) */
  keepAliveTimeout?: number;
  /** 서버 플러그인 목록 (선택적) */
  plugins?: ServerPlugin[];
}

/**
 * 서버 플러그인 인터페이스
 */
export interface ServerPlugin {
  name: string;
  install(server: unknown): void | Promise<void>;
}
