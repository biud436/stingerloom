/**
 * Enum representing the different runtime environments that StingerLoom can operate in.
 *
 * @enum {string}
 * @property {string} Node - Represents the Node.js runtime environment.
 * @property {string} Deno - Represents the Deno runtime environment.
 * @property {string} Bun - Represents the Bun runtime environment.
 */
export enum StingerLoomEnvironment {
    Node = "Node",
    Deno = "Deno",
    Bun = "Bun",
}

export type StingerLoomEnvironmentKeys = keyof typeof StingerLoomEnvironment;
