/**
 * @interface OnApplicationShutdown
 * @description 애플리케이션이 종료될 때 실행되는 함수를 정의합니다.
 */
export interface OnApplicationShutdown {
  onApplicationShutdown(): Promise<void> | void;
}
