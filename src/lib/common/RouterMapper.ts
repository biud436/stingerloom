/* eslint-disable @typescript-eslint/no-explicit-any */

export const CONTROLLER_TOKEN = "CONTROLLER";
export const metadataStorage = {};

export type ClazzType<T> = new (...args: any[]) => T;
