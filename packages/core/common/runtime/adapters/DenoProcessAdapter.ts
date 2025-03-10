import { ProcessAdapterInterface } from "../interfaces";
import { StingerLoomEnvironment } from "../types";
import { DenoRuntime } from "../types/DenoRuntime";
import { isDeno } from "../utils";

export class DenoProcessAdapter implements ProcessAdapterInterface {
  constructor(private denoProcess: DenoRuntime) {
    if (isDeno()) {
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

  runtime(): StingerLoomEnvironment {
    return StingerLoomEnvironment.Deno;
  }
}
