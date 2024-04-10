/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection } from "@stingerloom/orm/types/Connection";
import { IConnector } from "../../types/IConnector";
import { IDataSource } from "../IDataSource";
import { TRANSACTION_ISOLATION_LEVEL } from "../TransactionHolder";

export class MySqlDataSource implements IDataSource {
    private connection?: Connection;

    constructor(private readonly connector: IConnector) {}

    async createConnection() {
        this.connection = await this.connector.getConnection();

        if (!this.connection) {
            throw new Error("데이터베이스 연결이 되어있지 않습니다.");
        }
    }

    async close() {
        if (!this.connection) {
            return;
        }

        await this.connection.release();
    }

    async startTransaction(level?: TRANSACTION_ISOLATION_LEVEL) {
        if (!this.connection) {
            throw new Error("데이터베이스 연결이 되어있지 않습니다.");
        }

        await this.connector.startTransaction(this.connection, level);
    }

    async rollback() {
        if (!this.connection) {
            throw new Error("데이터베이스 연결이 되어있지 않습니다.");
        }

        await this.connector.rollback(this.connection);
    }

    async commit() {
        if (!this.connection) {
            throw new Error("데이터베이스 연결이 되어있지 않습니다.");
        }

        await this.connector.commit(this.connection);
    }

    async query(sql: string) {
        if (!this.connection) {
            throw new Error("데이터베이스 연결이 되어있지 않습니다.");
        }

        return this.connector.query(sql);
    }

    async savepoint(name: string) {
        if (!this.connection) {
            throw new Error("데이터베이스 연결이 되어있지 않습니다.");
        }

        await this.query(`SAVEPOINT ${name}`);
    }

    async rollbackTo(name: string) {
        if (!this.connection) {
            throw new Error("데이터베이스 연결이 되어있지 않습니다.");
        }

        await this.query(`ROLLBACK TO ${name}`);
    }
}
