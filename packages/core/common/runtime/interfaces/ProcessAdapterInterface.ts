import { StingerLoomEnvironment } from "../types";

/**
 * Interface representing a process adapter.
 * This interface abstracts the underlying runtime environment (Node.js, Deno, Bun)
 * and provides methods and properties to interact with the process.
 */
export interface ProcessAdapterInterface {
  /**
   * Gets the platform on which the process is running.
   * @returns {string} The platform name (e.g., 'darwin', 'win32', 'linux').
   */
  platform(): string;

  /**
   * Exits the process with the specified exit code.
   * @param {number} [code] - The exit code. If not provided, defaults to 0.
   */
  exit(code?: number): void;

  /**
   * Gets the current working directory of the process.
   * @returns {string} The current working directory.
   */
  cwd(): string;

  /**
   * An object containing the user environment variables.
   */
  env: Record<string, string>;

  /**
   * The process identifier (PID).
   */
  pid: number;

  /**
   * Gets the runtime environment in which the process is running.
   * @returns {"node" | "deno" | "bun"} The runtime environment.
   */
  runtime(): StingerLoomEnvironment;
}
