/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sql } from "sql-template-tag";
import { DatabaseClient } from "../DatabaseClient";
import { IConnector } from "../types/IConnector";
import { MySqlDataSource } from "./mysql/MySqlDataSource";
import { IDataSource } from "./IDataSource";
import { Logger } from "@stingerloom/core/common";
import { DatabaseConnectionFailedError } from "@stingerloom/core/error/DatabaseConnectionFailedError";
import { DatabaseNotConnectedError } from "@stingerloom/core/error/DatabaseNotConnectedError";
import { IQueryEngine } from "./IQueryEngine";
import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";

export class TransactionHolder extends IQueryEngine {
    private connection?: IConnector;
    private dataSource?: IDataSource;
    private readonly logger: Logger = new Logger(TransactionHolder.name);

    constructor() {
        super();
    }

    public async connect() {
        try {
            // @Transactional을 사용한다면 TransactionManager를 통해,
            // 데이터 소스(DataSource)를 같은 컨텍스트 내에서 공유할 수 있도록 해야 합니다.
            this.connection =
                await DatabaseClient.getInstance().getConnection();
            this.dataSource = new MySqlDataSource(this.connection);
            await this.dataSource.createConnection();
        } catch (error: unknown) {
            throw new DatabaseConnectionFailedError();
        }
    }

    public async query(sql: string): Promise<any>;
    public async query<T = any>(sql: Sql): Promise<T>;
    public async query<T = any>(sql: string | Sql): Promise<T> {
        if (!this.connection) {
            throw new DatabaseNotConnectedError();
        }
        const queryResult = await this.dataSource?.query(sql as string);

        return queryResult;
    }

    public async startTransaction(
        level: TRANSACTION_ISOLATION_LEVEL = "READ COMMITTED",
    ) {
        if (!this.connection) {
            throw new DatabaseNotConnectedError();
        }

        return this.dataSource?.startTransaction(level);
    }

    public async rollback() {
        return this.dataSource?.rollback();
    }

    public async commit() {
        return this.dataSource?.commit();
    }

    public async savepoint(name: string) {
        return this.dataSource?.savepoint(name);
    }

    public async rollbackTo(name: string) {
        return this.dataSource?.rollbackTo(name);
    }

    public async close() {
        if (!this.connection) {
            throw new DatabaseNotConnectedError();
        }

        await this.dataSource?.close();
    }
}
