import { ProcessAdapterInterface } from "../interfaces/ProcessAdapterInterface";
import { StingerLoomEnvironment } from "../types";

export class NodeProcessAdapter implements ProcessAdapterInterface {
    constructor(private nodeProcess: NodeJS.Process) {}

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

    runtime(): StingerLoomEnvironment {
        return StingerLoomEnvironment.Node;
    }
}
