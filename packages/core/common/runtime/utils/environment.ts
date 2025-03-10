export enum Environment {
  Node,
  Deno,
  Bun,
  Unknown,
}

/**
 * Detects the current runtime environment.
 *
 * This function checks for the presence of specific global objects to determine
 * the runtime environment. It supports detection for Deno, Bun, and Node.js environments.
 * If none of these environments are detected, it returns `Environment.Unknown`.
 *
 * @returns {Environment} The detected runtime environment.
 *
 * @remarks
 * - For Deno, it checks if the global `Deno` object and `Deno.env` are defined.
 * - For Bun, it checks if the global `Bun` object and `Bun.process` are defined.
 * - For Node.js, it checks if the global `process` object and `process.env` are defined.
 * - If none of the above conditions are met, it returns `Environment.Unknown`.
 *
 * @example
 * ```typescript
 * const env = detectEnvironment();
 * console.log(env); // Outputs the detected environment (Deno, Bun, Node, or Unknown)
 * ```
 *
 * @throws {Error} If the environment cannot be detected.
 */
export function detectEnvironment(): Environment {
  /** @ts-expect-error TS2304: Cannot find name 'Deno'. */
  if (typeof Deno !== "undefined" && typeof Deno.env !== "undefined") {
    return Environment.Deno;
  } else if (
    /** @ts-expect-error TS2304: Cannot find name 'Bun'. */
    typeof Bun !== "undefined" &&
    /** @ts-expect-error TS2304: Cannot find name 'Bun'. */
    typeof Bun.process !== "undefined"
  ) {
    return Environment.Bun;
  } else if (
    typeof process !== "undefined" &&
    typeof process.env !== "undefined"
  ) {
    return Environment.Node;
  } else {
    return Environment.Unknown;
  }
}
