import { Service } from "typedi";

export type Metadata = {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    target: unknown;
    router: unknown;
};

@Service()
export class MetadataScanner {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapper: Map<string, any> = new Map();

    public set(key: string, value: unknown): void {
        this.mapper.set(key, value);
    }

    public get(key: string): unknown {
        return this.mapper.get(key);
    }

    public has(key: string): boolean {
        return this.mapper.has(key);
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
