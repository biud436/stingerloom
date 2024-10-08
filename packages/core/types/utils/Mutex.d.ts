export declare class Mutex<T> {
    private mutex;
    lock(): PromiseLike<() => void>;
    dispatch(fn: (() => T) | (() => PromiseLike<T>)): Promise<T>;
}
