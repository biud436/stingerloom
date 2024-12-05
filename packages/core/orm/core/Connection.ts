import { QueryError } from "mysql2";
import { Connection as MysqlConnection } from "mysql2";

/**
 * Represents a database connection that extends the functionality of a MySQL connection.
 * Provides methods to manage transactions and release the connection.
 */
export interface Connection extends MysqlConnection {
    /**
     * Begins a new transaction.
     *
     * @param callback - A callback function that is called when the transaction begins.
     *                   The callback receives an error object if an error occurs, or null if successful.
     */
    beginTransaction(callback: (err: QueryError | null) => void): void;

    /**
     * Commits the current transaction.
     *
     * @param callback - A callback function that is called when the transaction is committed.
     *                   The callback receives an error object if an error occurs, or null if successful.
     */
    commit(callback: (err: QueryError | null) => void): void;

    /**
     * Rolls back the current transaction.
     *
     * @param callback - A callback function that is called when the transaction is rolled back.
     *                   The callback receives an error object if an error occurs, or null if successful.
     */
    rollback(callback: (err: QueryError | null) => void): void;

    /**
     * Releases the connection back to the pool.
     * This should be called when the connection is no longer needed.
     */
    release(): void;
}
