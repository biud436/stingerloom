import { TransactionIsolationLevel } from "../decorators";
import { Logger } from "../Logger";
import { DataSource } from "typeorm";
import { TransactionStore } from "./TransactionStore";
/**
 * @class TransactionManagerConsumer
 * @author 어진석(biud436)
 * @description This class is a consumer that executes the transaction.
 * @deprecated
 */
export declare class TransactionEntityManagerConsumer {
    LOGGER: Logger;
    private readonly transactionScanner;
    /**
     * 트랜잭션을 실행합니다.
     * 커밋, 롤백 등의 트랜잭션 관련 작업을 ORM에 전적으로 위임합니다.
     *
     * @param entityManager 트랜잭션을 관리하는 EntityManager 객체를 지정합니다.
     * @param transactionIsolationLevel 트랜잭션 격리 수준을 지정합니다.
     * @param targetInjectable 트랜잭션 관련 데코레이터를 찾을 클래스를 지정합니다.
     * @param method 트랜잭션 데코레이터를 찾을 메소드 명을 지정합니다.
     * @param args 원본 메소드의 인자를 지정합니다.
     * @param originalMethod 원본 메소드를 지정합니다.
     * @param resolve 비동기 처리 성공 시 호출될 함수를 지정합니다.
     * @param reject 비동기 처리 실패 시 호출될 함수를 지정합니다.
     * @param store 트랜잭션 스토어를 지정합니다.
     * @returns
     */
    execute(dataSource: DataSource, transactionIsolationLevel: TransactionIsolationLevel, targetInjectable: InstanceType<any>, method: string, args: unknown[], originalMethod: (...args: unknown[]) => unknown | Promise<unknown>, resolve: (value: unknown) => void, reject: (reason?: unknown) => void, store: TransactionStore): unknown[] | undefined;
}
