import { ProcessAdapterInterface } from "./ProcessAdapterInterface";

interface DenoRuntime {
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

export class DenoProcessAdapter implements ProcessAdapterInterface {
    constructor(private denoProcess: DenoRuntime) {}

    platform(): string {
        return this.denoProcess.build.os;
    }

    exit(code?: number): void {
        this.denoProcess.exit(code);
    }

    cwd(): string {
        return this.denoProcess.cwd();
    }

    get env(): Record<string, string> {
        const env: Record<string, string> = {};
        for (const [key, value] of this.denoProcess.env.entries()) {
            env[key] = value;
        }
        return env;
    }

    get pid(): number {
        return this.denoProcess.pid;
    }

    runtime(): "node" | "deno" | "bun" {
        return "deno";
    }
}
