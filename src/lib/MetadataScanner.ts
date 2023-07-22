import { Service } from "typedi";
import { ObjectLiteral, Repository } from "typeorm";

export type Metadata = {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    target: unknown;
    router: unknown;
};

export type ControllerMetadata = {
    path: string;
    target: unknown;
    routers: Metadata[];
    repositoies: Repository<ObjectLiteral>[];
};

export type RepositoryMetadata = {
    repository: Repository<ObjectLiteral>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any;
    propertyKey: string | symbol | undefined;
    index: number;
};

@Service()
export class MetadataScanner {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    public createUniqueKey() {
        return Math.random().toString(36).substring(2, 9);
    }

    public *makeRouters(): IterableIterator<Metadata> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
