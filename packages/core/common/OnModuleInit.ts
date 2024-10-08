/**
 * @interface OnModuleInit
 * @description 모듈이 초기화되었을 때 실행되는 함수를 정의합니다.
 */
export interface OnModuleInit {
    onModuleInit(): Promise<void> | void;
}
