import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";
export interface IDataSource {
    createConnection(): Promise<void>;
    close(): Promise<void>;
    startTransaction(level?: TRANSACTION_ISOLATION_LEVEL): Promise<void>;
    rollback(): Promise<void>;
    commit(): Promise<void>;
    query(sql: string): Promise<any>;
    savepoint(name: string): Promise<void>;
    rollbackTo(name: string): Promise<void>;
}
