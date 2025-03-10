/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnApplicationShutdown } from "../../OnApplicationShutdown";

/**
 * 데이터베이스 컨텍스트를 위한 추상 인터페이스
 * 모든 ORM 어댑터가 구현해야 하는 공통 메서드 정의
 */
export interface DatabaseContext extends OnApplicationShutdown {
  /**
   * 데이터베이스 연결을 초기화합니다.
   */
  start(): Promise<void>;

  /**
   * 원본 데이터베이스 클라이언트/연결을 반환합니다.
   */
  getNativeConnection(): any;

  /**
   * 엔티티에 대한 리포지토리를 반환합니다.
   *
   * @param entity 엔티티 클래스
   */
  getRepository<T>(entity: new () => T): any;
}
