/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatabaseNotConnectedError } from "@stingerloom/core/error/DatabaseNotConnectedError";
import { MySqlConnector } from "./dialects";
import { DatabaseClientOptions } from "./core/DatabaseClientOptions";
import { IConnector } from "./core/IConnector";
import { NotSupportedDatabaseTypeError } from "@stingerloom/core/error/NotSupportedDatabaseTypeError";
import { Exception } from "@stingerloom/core/error";

export class DatabaseClient {
    private static instance: DatabaseClient;
    private connector?: IConnector;
    private options?: DatabaseClientOptions;
    public type?: string;

    private constructor() {}

    public static getInstance(): DatabaseClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new DatabaseClient();
        }

        return DatabaseClient.instance;
    }

    public getConnection(): IConnector {
        if (!this.connector) {
            throw new DatabaseNotConnectedError();
        }

        return this.connector;
    }

    public async connect(options: DatabaseClientOptions): Promise<IConnector> {
        const { type } = options;

        this.type = type;
        this.options = options;

        switch (type) {
            case "mysql":
                this.connector = new MySqlConnector();
                await this.connector.connect(options);
                break;
            default:
                throw new NotSupportedDatabaseTypeError();
        }

        return this.connector;
    }

    public async close(): Promise<void> {
        if (!this.connector) {
            return;
        }

        await this.connector.close();
    }

    public getOptions(): DatabaseClientOptions {
        if (!this.options) {
            throw new Exception("옵션이 존재하지 않습니다.", 500);
        }

        return this.options;
    }
}
