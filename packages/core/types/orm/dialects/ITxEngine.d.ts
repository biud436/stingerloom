import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";
export interface ITxEngine {
    /**
     * 트랜잭션을 시작합니다.
     */
    startTransaction(level?: TRANSACTION_ISOLATION_LEVEL): Promise<void>;
    /**
     * 트랜잭션을 롤백합니다.
     */
    rollback(): Promise<void>;
    /**
     * 트랜잭션을 커밋합니다.
     */
    commit(): Promise<void>;
    /**
     * savepoint를 생성합니다.
     * @param name 저장점 이름
     */
    savepoint(name: string): Promise<void>;
    /**
     * savepoint로 롤백합니다.
     * @param name 저장점 이름
     */
    rollbackTo(name: string): Promise<void>;
}
