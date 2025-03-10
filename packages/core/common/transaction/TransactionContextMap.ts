/* eslint-disable @typescript-eslint/no-explicit-any */

import { ClazzType } from "../RouterMapper";

export interface TransactionContextValue<T> {
  type: ClazzType<T>;
  value: T;
}

/**
 * @class TransactionContextHelper
 * @author biud436
 */
export class TransactionContextMap {
  public context: Map<string, TransactionContextValue<unknown>> = new Map();

  public reserve<T>(key: string, value: TransactionContextValue<T>): this {
    return this.set(key, value);
  }

  public set<T>(key: string, value: TransactionContextValue<T>): this {
    this.context.set(key, value);

    return this;
  }

  public get<T>(key: string): TransactionContextValue<T> {
    return this.context.get(key) as TransactionContextValue<T>;
  }

  public clear(): this {
    this.context.clear();

    return this;
  }

  public toArray() {
    return Array.from(this.context.values());
  }

  public forEach(
    callback: (value: TransactionContextValue<unknown>, key: string) => void,
  ) {
    this.context.forEach(callback);
  }
}
