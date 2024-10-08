import { IConnector } from "../../core/IConnector";
import { IDataSource } from "../IDataSource";
import { TRANSACTION_ISOLATION_LEVEL } from "../IsolationLevel";
export declare class MySqlDataSource implements IDataSource {
    private readonly connector;
    private connection?;
    constructor(connector: IConnector);
    createConnection(): Promise<void>;
    close(): Promise<void>;
    startTransaction(level?: TRANSACTION_ISOLATION_LEVEL): Promise<void>;
    rollback(): Promise<void>;
    commit(): Promise<void>;
    query(sql: string): Promise<any>;
    savepoint(name: string): Promise<void>;
    rollbackTo(name: string): Promise<void>;
}
