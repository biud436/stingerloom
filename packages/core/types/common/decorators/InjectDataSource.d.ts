import "reflect-metadata";
export declare class DataSourceMetadata {
    token: string;
}
export declare const INJECT_DATA_SOURCE_TOKEN = "INJECT_DATA_SOURCE:metadata";
export declare function InjectDataSource<T>(): ParameterDecorator;
