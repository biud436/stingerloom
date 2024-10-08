import { HttpRouterParameter } from "../../common/HttpRouterParameter";
export type DynamicClassWrapper<T> = {
    new (...args: any[]): T;
};
export type Metadata = {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    target: unknown;
    router: unknown;
    parameters: HttpRouterParameter[];
    header?: Record<string, string>;
};
export type ContainerType = "controller" | "service";
export type ContainerMetadata<T = any> = {
    path: string;
    target: unknown;
    routers: Metadata[];
    type: ContainerType;
    parameters: DynamicClassWrapper<T>;
};
export type InjectableMetadata = {
    type: ContainerType;
    target: unknown;
    name: string;
    parameters: DynamicClassWrapper<any>[];
};
export type ExceptionMetadata<T extends Error = Error> = {
    target: unknown;
    exception: DynamicClassWrapper<T>;
    handlers: ErrorMetadata[];
};
export type ErrorAdvice = "before-throwing" | "after-throwing" | "throwing";
export type ErrorMetadata = {
    target: unknown;
    handler: unknown;
    advice: ErrorAdvice;
};
export declare class MetadataScanner {
    protected mapper: Map<string, any>;
    set<T>(key: string, value: T): void;
    get<T>(key: string): T;
    has(key: string): boolean;
    allMetadata<T>(): T[];
    clear(): void;
    /**
     * @deprecated
     */
    findKeyByTarget(target: unknown): string;
    createUniqueKey(): string;
    makeRouters(): IterableIterator<Metadata>;
}
