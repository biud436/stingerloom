import { Sql } from "sql-template-tag";
import { IQueryEngine } from "./IQueryEngine";
import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";
export declare class TransactionHolder extends IQueryEngine {
    private connection?;
    private dataSource?;
    private readonly logger;
    constructor();
    connect(): Promise<void>;
    query(sql: string): Promise<any>;
    query<T = any>(sql: Sql): Promise<T>;
    startTransaction(level?: TRANSACTION_ISOLATION_LEVEL): Promise<void | undefined>;
    rollback(): Promise<void | undefined>;
    commit(): Promise<void | undefined>;
    savepoint(name: string): Promise<void | undefined>;
    rollbackTo(name: string): Promise<void | undefined>;
    close(): Promise<void>;
}
