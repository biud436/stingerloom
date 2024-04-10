import { QueryError } from "mysql2";
import { Connection as MysqlConnection } from "mysql2";

export interface Connection extends MysqlConnection {
    beginTransaction(callback: (err: QueryError | null) => void): void;
    commit(callback: (err: QueryError | null) => void): void;
    rollback(callback: (err: QueryError | null) => void): void;
    release(): void;
}
