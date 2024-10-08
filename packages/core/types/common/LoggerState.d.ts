/**
 * @class LoggerState
 * @description
 * 로거의 상태를 관리하기 위해 정의된 클래스입니다.
 */
export declare class LoggerState {
    private state;
    info(): void;
    warn(): void;
    error(): void;
    debug(): void;
    fatal(): void;
    trace(): void;
    slient(): void;
    child(): void;
    get(): string;
    toString(): string;
}
