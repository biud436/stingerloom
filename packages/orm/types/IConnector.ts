/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sql } from "sql-template-tag";
import { DatabaseClientOptions } from "./DatabaseClientOptions";
import { Connection } from "./Connection";
import { TRANSACTION_ISOLATION_LEVEL } from "../dialects/TransactionHolder";

export abstract class IConnector {
    abstract connect(options: DatabaseClientOptions): Promise<void>;
    abstract close(): Promise<void>;

    /**
     * 테스트 SQL을 실행합니다.
     */
    abstract runTestSql(): void;

    abstract query(sql: string): Promise<any>;
    abstract query<T = any>(sql: Sql): Promise<T>;

    abstract getConnection(): Promise<Connection>;

    abstract setTransactionIsolationLevel(
        connection: Connection,
        level: TRANSACTION_ISOLATION_LEVEL,
    ): Promise<void>;

    abstract startTransaction(
        connection: Connection,
        level?: TRANSACTION_ISOLATION_LEVEL,
    ): Promise<void>;

    abstract rollback(connection: Connection): Promise<void>;

    abstract commit(connection: Connection): Promise<void>;
}
