/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection } from "@stingerloom/orm/types/Connection";
import { IConnector } from "../../types/IConnector";
import { IDataSource } from "../IDataSource";
import { TRANSACTION_ISOLATION_LEVEL } from "../IsolationLevel";
import { MySqlConnectionError } from "./MySqlConnectionError";

export class MySqlDataSource implements IDataSource {
    private connection?: Connection;

    constructor(private readonly connector: IConnector) {}

    async createConnection() {
        this.connection = await this.connector.getConnection();

        if (!this.connection) {
            throw new MySqlConnectionError();
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
            throw new MySqlConnectionError();
        }

        await this.connector.startTransaction(this.connection, level);
    }

    async rollback() {
        if (!this.connection) {
            throw new MySqlConnectionError();
        }

        await this.connector.rollback(this.connection);
    }

    async commit() {
        if (!this.connection) {
            throw new MySqlConnectionError();
        }

        await this.connector.commit(this.connection);
    }

    async query(sql: string) {
        if (!this.connection) {
            throw new MySqlConnectionError();
        }

        return await this.connector.query(sql, this.connection);
    }

    async savepoint(name: string) {
        if (!this.connection) {
            throw new MySqlConnectionError();
        }

        await this.query(`SAVEPOINT ${name}`);
    }

    async rollbackTo(name: string) {
        if (!this.connection) {
            throw new MySqlConnectionError();
        }

        await this.query(`ROLLBACK TO ${name}`);
    }
}
