export interface ProcessAdapterInterface {
    platform(): string;
    exit(code?: number): void;
    cwd(): string;
    env: Record<string, string>;
    pid: number;
    runtime(): "node" | "deno" | "bun";
}
