/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";

/**
 * Interface representing a data source for database operations.
 */
export interface IDataSource {
    /**
     * Establishes a connection to the database.
     * @returns A promise that resolves when the connection is successfully established.
     */
    createConnection(): Promise<void>;

    /**
     * Closes the connection to the database.
     * @returns A promise that resolves when the connection is successfully closed.
     */
    close(): Promise<void>;

    /**
     * Starts a new transaction.
     * @param level - Optional transaction isolation level.
     * @returns A promise that resolves when the transaction is successfully started.
     */
    startTransaction(level?: TRANSACTION_ISOLATION_LEVEL): Promise<void>;

    /**
     * Rolls back the current transaction.
     * @returns A promise that resolves when the transaction is successfully rolled back.
     */
    rollback(): Promise<void>;

    /**
     * Commits the current transaction.
     * @returns A promise that resolves when the transaction is successfully committed.
     */
    commit(): Promise<void>;

    /**
     * Executes a raw SQL query.
     * @param sql - The SQL query string to be executed.
     * @returns A promise that resolves with the result of the query.
     */
    query(sql: string): Promise<any>;

    /**
     * Creates a savepoint with the given name within the current transaction.
     * @param name - The name of the savepoint.
     * @returns A promise that resolves when the savepoint is successfully created.
     */
    savepoint(name: string): Promise<void>;

    /**
     * Rolls back the transaction to the specified savepoint.
     * @param name - The name of the savepoint to roll back to.
     * @returns A promise that resolves when the transaction is successfully rolled back to the savepoint.
     */
    rollbackTo(name: string): Promise<void>;
}
