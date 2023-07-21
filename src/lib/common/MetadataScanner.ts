import { Service } from "typedi";

export type Metadata = {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    target: unknown;
    router: unknown;
};

export type ControllerMetadata = {
    path: string;
    target: unknown;
    routers: Metadata[];
};

@Service()
export class MetadataScanner {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected mapper: Map<string, any> = new Map();

    public set(key: string, value: unknown): void {
        this.mapper.set(key, value);
    }

    public get(key: string): unknown {
        return this.mapper.get(key);
    }

    public has(key: string): boolean {
        return this.mapper.has(key);
    }

    public allMetadata(): unknown[] {
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

@Service()
export class ControllerScanner extends MetadataScanner {
    public *makeControllers(): IterableIterator<ControllerMetadata> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
