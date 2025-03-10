/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AFTER_TRANSACTION_TOKEN,
  BEFORE_TRANSACTION_TOKEN,
  TRANSACTION_COMMIT_TOKEN,
  TRANSACTION_ROLLBACK_TOKEN,
} from "../decorators";
import { ITransactionStore } from "./ITransactionStore";

export class TransactionStore {
  constructor(
    public store: ITransactionStore,
    public methods: string[],
    public virtualTransactionId: string,
  ) {}

  isBeforeTransactionToken(): boolean {
    return !!this.store[BEFORE_TRANSACTION_TOKEN];
  }

  isAfterTransactionToken(): boolean {
    return !!this.store[AFTER_TRANSACTION_TOKEN];
  }

  isTransactionCommitToken(): boolean {
    return !!this.store[TRANSACTION_COMMIT_TOKEN];
  }

  isTransactionRollbackToken(): boolean {
    return !!this.store[TRANSACTION_ROLLBACK_TOKEN];
  }

  getBeforeTransactionMethodName(): string | undefined {
    return this.store[BEFORE_TRANSACTION_TOKEN];
  }

  getAfterTransactionMethodName(): string | undefined {
    return this.store[AFTER_TRANSACTION_TOKEN];
  }

  getTransactionCommitMethodName(): string | undefined {
    return this.store[TRANSACTION_COMMIT_TOKEN];
  }

  getTransactionRollbackMethodName(): string | undefined {
    return this.store[TRANSACTION_ROLLBACK_TOKEN];
  }

  async action(
    targetInjectable: InstanceType<any>,
    method: string,
    ...args: unknown[]
  ) {
    const txId = this.virtualTransactionId;
    const result = targetInjectable[method].call(
      targetInjectable,
      txId,
      ...args,
    );

    if (result instanceof Promise) {
      return await result;
    }

    return result;
  }
}
