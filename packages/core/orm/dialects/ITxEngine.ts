import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";

export interface ITxEngine {
  /**
   * Starts a transaction with an optional isolation level.
   * @param level The isolation level for the transaction. If not provided, the default isolation level will be used.
   */
  startTransaction(level?: TRANSACTION_ISOLATION_LEVEL): Promise<void>;

  /**
   * Rolls back the current transaction, undoing all changes made during the transaction.
   */
  rollback(): Promise<void>;

  /**
   * Commits the current transaction, making all changes made during the transaction permanent.
   */
  commit(): Promise<void>;

  /**
   * Creates a savepoint within the current transaction. Savepoints allow you to roll back part of a transaction without affecting the entire transaction.
   * @param name The name of the savepoint.
   */
  savepoint(name: string): Promise<void>;

  /**
   * Rolls back to a previously created savepoint, undoing all changes made after the savepoint was created.
   * @param name The name of the savepoint.
   */
  rollbackTo(name: string): Promise<void>;
}
