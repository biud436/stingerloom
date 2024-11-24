import { ProcessAdapterInterface } from "../interfaces";
import { DenoRuntime } from "../types/DenoRuntime";

export class DenoProcessAdapter implements ProcessAdapterInterface {
    constructor(private denoProcess: DenoRuntime) {
        if (typeof globalThis !== "undefined" && !("Deno" in globalThis)) {
            throw new Error(
                "Deno global object not found. Are you running in a Deno environment?",
            );
        }
    }

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
