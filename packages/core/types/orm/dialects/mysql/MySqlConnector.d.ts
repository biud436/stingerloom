import { Pool, PoolConnection } from "mysql2";
import { Sql } from "sql-template-tag";
import { Connection } from "../../core/Connection";
import { TRANSACTION_ISOLATION_LEVEL } from "../IsolationLevel";
import { DatabaseClientOptions } from "../../core/DatabaseClientOptions";
import { IConnector } from "../../core/IConnector";
export type Entity = any;
export type IDatabaseType = "mysql" | "mariadb" | "postgres" | "sqlite";
export declare class MySqlConnector implements IConnector {
    pool?: Pool;
    private isDebug;
    private readonly logger;
    connect(options: DatabaseClientOptions): Promise<void>;
    /**
     * 트랜잭션 처리를 위해 커넥션 풀에서 커넥션을 하나 가져옵니다.
     */
    getConnection(): Promise<PoolConnection>;
    runTestSql(): Promise<void>;
    query(sql: string, connection?: Connection): Promise<any>;
    query({ sql, values }: Sql, connection?: Connection): Promise<any>;
    close(): Promise<void>;
    setTransactionIsolationLevel(connection: Connection, level: TRANSACTION_ISOLATION_LEVEL): Promise<void>;
    startTransaction(connection: Connection, level?: TRANSACTION_ISOLATION_LEVEL): Promise<void>;
    rollback(connection: Connection): Promise<void>;
    commit(connection: Connection): Promise<void>;
}
