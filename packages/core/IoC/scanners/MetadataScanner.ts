/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
import { Service } from "typedi";
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

@Service()
export class MetadataScanner {
    protected mapper: Map<string, any> = new Map();

    public set<T>(key: string, value: T): void {
        this.mapper.set(key, value);
    }

    public get<T>(key: string): T {
        return this.mapper.get(key);
    }

    public has(key: string): boolean {
        return this.mapper.has(key);
    }

    public allMetadata<T>(): T[] {
        return Array.from(this.mapper.values());
    }

    public clear(): void {
        this.mapper.clear();
    }

    /**
     * @deprecated
     */
    public findKeyByTarget(target: unknown): string {
        const result: Metadata[] = [];
        let key = "";

        for (const [_, value] of this.mapper) {
            if (value.target === target) {
                result.push(value);
                key = _;
            }
        }

        return key;
    }

    public createUniqueKey() {
        return Math.random().toString(36).substring(2, 9);
    }

    public *makeRouters(): IterableIterator<Metadata> {
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
