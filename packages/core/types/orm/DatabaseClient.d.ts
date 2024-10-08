import { DatabaseClientOptions } from "./core/DatabaseClientOptions";
import { IConnector } from "./core/IConnector";
export declare class DatabaseClient {
    private static instance;
    private connector?;
    private options?;
    type?: string;
    private constructor();
    static getInstance(): DatabaseClient;
    getConnection(): IConnector;
    connect(options: DatabaseClientOptions): Promise<IConnector>;
    close(): Promise<void>;
    getOptions(): DatabaseClientOptions;
}
