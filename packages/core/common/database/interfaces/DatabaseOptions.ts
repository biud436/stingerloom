/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 데이터베이스 설정 옵션 인터페이스
 * 모든 ORM 어댑터가 사용할 수 있는 공통 설정
 */
export interface DatabaseOptions<T = any> {
  type: string;
  provider?: string; // 어댑터 타입 지정을 위한 옵션
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  entities?: T[];
  synchronize?: boolean;
  logging?: boolean | string[];
  [key: string]: any; // 추가 옵션을 위한 인덱스 시그니처
}
