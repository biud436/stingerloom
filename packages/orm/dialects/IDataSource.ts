import { TRANSACTION_ISOLATION_LEVEL } from "./TransactionHolder";

export interface IDataSource {
    createConnection(): Promise<void>;
    close(): Promise<void>;
    startTransaction(level?: TRANSACTION_ISOLATION_LEVEL): Promise<void>;
    rollback(): Promise<void>;
    commit(): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query(sql: string): Promise<any>;
    savepoint(name: string): Promise<void>;
    rollbackTo(name: string): Promise<void>;
}
