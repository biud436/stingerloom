import { Sql } from "sql-template-tag";
import { ITxEngine } from "./ITxEngine";
import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";
export declare abstract class IQueryEngine implements ITxEngine {
    abstract connect(): Promise<void>;
    /**
     * SQL을 실행합니다 (트랜잭션 내부에서 실행됩니다)
     *
     * @param sql
     */
    abstract query(sql: string): Promise<any>;
    abstract query<T = any>(sql: Sql): Promise<T>;
    abstract startTransaction(level?: TRANSACTION_ISOLATION_LEVEL): Promise<void>;
    abstract rollback(): Promise<void>;
    abstract commit(): Promise<void>;
    abstract savepoint(name: string): Promise<void>;
    abstract rollbackTo(name: string): Promise<void>;
    abstract close(): Promise<void>;
}
