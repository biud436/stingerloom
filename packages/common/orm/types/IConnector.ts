import { Sql } from "sql-template-tag";
import { DatabaseClientOptions } from "./DatabaseClientOptions";

export abstract class IConnector {
    abstract connect(options: DatabaseClientOptions): Promise<void>;
    abstract close(): Promise<void>;

    /**
     * 테스트 SQL을 실행합니다.
     */
    abstract runTestSql(): void;

    abstract query(sql: Sql): void;
}
