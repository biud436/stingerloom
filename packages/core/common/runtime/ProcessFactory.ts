import { detectEnvironment, Environment } from "./environment";
import { NodeProcessAdapter } from "./NodeProcessAdapter";
import { ProcessAdapterInterface } from "./ProcessAdapterInterface";

export class ProcessFactory {
    static createProcessAdapter(): ProcessAdapterInterface {
        const env = detectEnvironment();
        switch (env) {
            case Environment.Node:
                return new NodeProcessAdapter(process);
            default:
                throw new Error(`Unsupported runtime environment: ${env}`);
        }
    }
}
