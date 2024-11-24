import { ProcessAdapterInterface } from "./ProcessAdapterInterface";

export class BunProcessAdapter implements ProcessAdapterInterface {
    constructor(private bunProcess: NodeJS.Process) {}

    platform(): string {
        return this.bunProcess.platform;
    }

    exit(code?: number): void {
        this.bunProcess.exit(code);
    }

    cwd(): string {
        return this.bunProcess.cwd();
    }

    get env(): Record<string, string> {
        return this.bunProcess.env as Record<string, string>;
    }

    get pid(): number {
        return this.bunProcess.pid;
    }

    runtime(): "node" | "deno" | "bun" {
        return "bun";
    }
}
