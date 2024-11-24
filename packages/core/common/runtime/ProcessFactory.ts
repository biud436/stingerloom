/* eslint-disable @typescript-eslint/no-explicit-any */
import { BunProcessAdapter } from "./BunProcessAdapter";
import { DenoProcessAdapter } from "./DenoProcessAdapter";
import { detectEnvironment, Environment } from "./environment";
import { NodeProcessAdapter } from "./NodeProcessAdapter";
import { ProcessAdapterInterface } from "./ProcessAdapterInterface";

/**
 * Factory class for creating process adapters based on the detected runtime environment.
 */
export class ProcessFactory {
    /**
     * Creates an instance of a process adapter based on the current runtime environment.
     *
     * @returns {ProcessAdapterInterface} An instance of a process adapter suitable for the detected environment.
     *
     * @throws {Error} Throws an error if the runtime environment is not supported.
     */
    static createProcessAdapter(): ProcessAdapterInterface {
        const env = detectEnvironment();
        const main = globalThis as any;

        switch (env) {
            case Environment.Node:
                return new NodeProcessAdapter(main.process);
            case Environment.Deno:
                return new DenoProcessAdapter(main.Deno);
            case Environment.Bun:
                return new BunProcessAdapter(main.process);
            default:
                throw new Error(`Unsupported runtime environment: ${env}`);
        }
    }
}
