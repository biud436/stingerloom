/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sql } from "sql-template-tag";
import { DatabaseClientOptions } from "./DatabaseClientOptions";
import { Connection } from "./Connection";
import { TRANSACTION_ISOLATION_LEVEL } from "../dialects/IsolationLevel";

/**
 * Interface representing a database connector.
 */
export abstract class IConnector {
    /**
     * Connects to the database with the given options.
     * @param options - The options to use for the database connection.
     * @returns A promise that resolves when the connection is established.
     */
    abstract connect(options: DatabaseClientOptions): Promise<void>;

    /**
     * Closes the database connection.
     * @returns A promise that resolves when the connection is closed.
     */
    abstract close(): Promise<void>;

    /**
     * Executes a test SQL statement.
     */
    abstract runTestSql(): void;

    /**
     * Executes a SQL query.
     * @param sql - The SQL query string to execute.
     * @param connection - Optional connection to use for the query.
     * @returns A promise that resolves with the query result.
     */
    abstract query(sql: string, connection?: Connection): Promise<any>;

    /**
     * Executes a SQL query with a specified return type.
     * @param sql - The SQL query object to execute.
     * @param connection - Optional connection to use for the query.
     * @returns A promise that resolves with the query result of type T.
     */
    abstract query<T = any>(sql: Sql, connection?: Connection): Promise<T>;

    /**
     * Gets a database connection.
     * @returns A promise that resolves with the database connection.
     */
    abstract getConnection(): Promise<Connection>;

    /**
     * Sets the transaction isolation level for a connection.
     * @param connection - The connection to set the isolation level for.
     * @param level - The isolation level to set.
     * @returns A promise that resolves when the isolation level is set.
     */
    abstract setTransactionIsolationLevel(
        connection: Connection,
        level: TRANSACTION_ISOLATION_LEVEL,
    ): Promise<void>;

    /**
     * Starts a transaction on the given connection.
     * @param connection - The connection to start the transaction on.
     * @param level - Optional isolation level for the transaction.
     * @returns A promise that resolves when the transaction is started.
     */
    abstract startTransaction(
        connection: Connection,
        level?: TRANSACTION_ISOLATION_LEVEL,
    ): Promise<void>;

    /**
     * Rolls back a transaction on the given connection.
     * @param connection - The connection to roll back the transaction on.
     * @returns A promise that resolves when the transaction is rolled back.
     */
    abstract rollback(connection: Connection): Promise<void>;

    /**
     * Commits a transaction on the given connection.
     * @param connection - The connection to commit the transaction on.
     * @returns A promise that resolves when the transaction is committed.
     */
    abstract commit(connection: Connection): Promise<void>;
}
