/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { MySqlConnector } from "./dialects";
import { DatabaseClientOptions } from "./types/DatabaseClientOptions";
import { IConnector } from "./types/IConnector";

export class DatabaseClient {
    private static instance: DatabaseClient;
    private connector?: IConnector;
    public type?: string;
    private constructor() {}

    public static getInstance(): DatabaseClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new DatabaseClient();
        }

        return DatabaseClient.instance;
    }

    public async connect(options: DatabaseClientOptions): Promise<IConnector> {
        const { type } = options;

        this.type = type;

        switch (type) {
            case "mysql":
                this.connector = new MySqlConnector();
                await this.connector.connect(options);
                break;
            default:
                throw new Error("지원하지 않는 데이터베이스 타입입니다.");
        }

        return this.connector;
    }

    public async close(): Promise<void> {
        if (!this.connector) {
            return;
        }

        await this.connector.close();
    }
}
