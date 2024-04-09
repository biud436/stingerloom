/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MySqlConnector } from "./mysql";
import { DatabaseClientOptions } from "./types/DatabaseClientOptions";
import { IConnector } from "./types/IConnector";

export class DatabaseClient {
    private static instance: DatabaseClient;
    private connector?: IConnector;
    private constructor() {}

    public static getInstance(): DatabaseClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new DatabaseClient();
        }

        return DatabaseClient.instance;
    }

    public async connect(options: DatabaseClientOptions): Promise<void> {
        const { type } = options;

        switch (type) {
            case "mysql":
                this.connector = new MySqlConnector();
                await this.connector.connect(options);
                break;
            default:
                throw new Error("지원하지 않는 데이터베이스 타입입니다.");
        }
    }

    public async close(): Promise<void> {
        if (!this.connector) {
            return;
        }

        await this.connector.close();
    }
}
