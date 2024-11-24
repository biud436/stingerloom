export interface DenoRuntime {
    build: {
        os: string;
    };
    exit(code?: number): void;
    cwd(): string;
    env: {
        entries(): IterableIterator<[string, string]>;
    };
    pid: number;
}
