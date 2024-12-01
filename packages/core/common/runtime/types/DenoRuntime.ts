/**
 * Interface representing the runtime environment for Deno.
 * This interface provides various properties and methods to interact with the Deno runtime.
 */
export interface DenoRuntime {
    /**
     * Object containing build information about the Deno runtime.
     */
    build: {
        /**
         * The operating system on which the Deno runtime is running.
         */
        os: string;
    };

    /**
     * Exits the Deno process with the specified exit code.
     *
     * @param code - The exit code to use when exiting the process. If not provided, defaults to 0.
     */
    exit(code?: number): void;

    /**
     * Returns the current working directory of the Deno process.
     *
     * @returns The current working directory as a string.
     */
    cwd(): string;

    /**
     * Object representing the environment variables of the Deno process.
     */
    env: {
        /**
         * Returns an iterator of key-value pairs representing the environment variables.
         *
         * @returns An iterable iterator of tuples, where each tuple contains a string key and a string value.
         */
        entries(): IterableIterator<[string, string]>;
    };

    /**
     * The process ID of the Deno process.
     */
    pid: number;
}
