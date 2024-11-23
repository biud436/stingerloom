import { ProcessAdapterInterface } from "./ProcessAdapterInterface";

export class NodeProcessAdapter implements ProcessAdapterInterface {
    private nodeProcess: typeof process = process;

    platform(): string {
        return this.nodeProcess.platform;
    }

    exit(code?: number): void {
        this.nodeProcess.exit(code);
    }

    cwd(): string {
        return this.nodeProcess.cwd();
    }

    get env(): Record<string, string> {
        return this.nodeProcess.env as Record<string, string>;
    }

    get pid(): number {
        return this.nodeProcess.pid;
    }

    runtime(): "node" {
        return "node";
    }
}
