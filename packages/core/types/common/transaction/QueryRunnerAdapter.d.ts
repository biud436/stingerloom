import { DataSource, EntityManager, QueryResult } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
/**
 * This adapter is used to get some features for the transaction in the TypeORM.
 *
 * @class QueryRunnerAdapter
 * @author biud436
 */
export declare class QueryRunnerAdapter {
    private readonly dataSource;
    private queryRunner?;
    constructor(dataSource: DataSource);
    /**
     * Creates/uses database connection from the connection pool to perform further operations.
     * Returns obtained database connection.
     */
    connect(): Promise<any>;
    /**
     * Starts transaction.
     *
     * @param isolationLevel Specify what isolation level you want to use for this transaction.
     */
    startTransaction(isolationLevel?: IsolationLevel | undefined): Promise<void>;
    /**
     * Commits transaction.
     */
    commitTransaction(): Promise<void>;
    /**
     * Rollbacks transaction.
     */
    rollbackTransaction(): Promise<void>;
    /**
     * Releases used database connection.
     * You cannot use query runner methods after connection is released.
     */
    release(): Promise<void>;
    /**
     * Gets the manager from existing queryRunner.
     * it retrieved via QueryRunner will be used in the transaction.
     */
    getManager(): EntityManager | undefined;
    /**
     * Executes a given SQL query and returns raw database results.
     */
    query(query: string, parameters?: any[]): Promise<any>;
    query(query: string, parameters: any[] | undefined, useStructuredResult: true): Promise<QueryResult>;
}
