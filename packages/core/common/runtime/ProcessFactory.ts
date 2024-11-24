/* eslint-disable @typescript-eslint/no-explicit-any */
import { DenoProcessAdapter } from "./DenoProcessAdapter";
import { detectEnvironment, Environment } from "./environment";
import { NodeProcessAdapter } from "./NodeProcessAdapter";
import { ProcessAdapterInterface } from "./ProcessAdapterInterface";

export class ProcessFactory {
    static createProcessAdapter(): ProcessAdapterInterface {
        const env = detectEnvironment();
        switch (env) {
            case Environment.Node:
                return new NodeProcessAdapter();
            case Environment.Deno:
                return new DenoProcessAdapter((globalThis as any).Deno);
            default:
                throw new Error(`Unsupported runtime environment: ${env}`);
        }
    }
}
