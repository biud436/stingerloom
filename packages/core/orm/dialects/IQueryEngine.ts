/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sql } from "sql-template-tag";
import { ITxEngine } from "./ITxEngine";
import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";

export abstract class IQueryEngine implements ITxEngine {
    /**
     * Establishes a connection to the database.
     */
    abstract connect(): Promise<void>;

    /**
     * Executes a SQL query on the connected database.
     *
     * @param sql
     */
    abstract query(sql: string): Promise<any>;
    abstract query<T = any>(sql: Sql): Promise<T>;

    /**
     * Starts a transaction with an optional isolation level.
     * @param level The isolation level for the transaction. If not provided, the default isolation level will be used.
     */
    abstract startTransaction(
        level?: TRANSACTION_ISOLATION_LEVEL,
    ): Promise<void>;

    /**
     * Rolls back the current transaction, undoing all changes made during the transaction.
     */
    abstract rollback(): Promise<void>;

    /**
     * Commits the current transaction, making all changes made during the transaction permanent.
     */
    abstract commit(): Promise<void>;

    /**
     * Creates a savepoint within the current transaction. Savepoints allow you to roll back part of a transaction without affecting the entire transaction.
     * @param name The name of the savepoint.
     */
    abstract savepoint(name: string): Promise<void>;

    /**
     * Rolls back to a previously created savepoint, undoing all changes made after the savepoint was created.
     * @param name The name of the savepoint.
     */
    abstract rollbackTo(name: string): Promise<void>;

    /**
     * Closes the connection to the database.
     */
    abstract close(): Promise<void>;
}
