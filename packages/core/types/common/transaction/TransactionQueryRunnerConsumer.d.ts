import { TransactionIsolationLevel } from "../decorators";
import { TransactionStore } from "./TransactionStore";
import { DataSource } from "typeorm";
export declare class TransactionQueryRunnerConsumer {
    private LOGGER;
    private transactionScanner;
    /**
     * 트랜잭션을 실행합니다.
     * 커밋, 롤백 등의 트랜잭션 관련 작업을 직접 수행합니다.
     * ORM에 위임하지 않고 직접 커밋과 롤백 등을 관리합니다.
     *
     * @param dataSource 새로운 연결을 만들고 트랜잭션을 실행할 데이터소스 객체를 지정합니다.
     * @param transactionIsolationLevel 트랜잭션 격리 수준을 지정합니다.
     * @param targetInjectable 트랜잭션 관련 데코레이터를 찾을 클래스를 지정합니다.
     * @param method 트랜잭션 데코레이터를 찾을 메소드 명을 지정합니다.
     * @param originalMethod 원본 메소드를 지정합니다.
     * @param reject 비동기 처리 실패시 호출될 함수를 지정합니다.
     * @param resolve 비동기 처리 성공시 호출될 함수를 지정합니다.
     * @param args 원본 메소드의 인자를 지정합니다.
     * @param store 트랜잭션 스토어를 지정합니다.
     */
    execute(dataSource: DataSource, transactionIsolationLevel: TransactionIsolationLevel, targetInjectable: InstanceType<any>, method: string, originalMethod: (...args: unknown[]) => unknown | Promise<unknown>, reject: (reason?: unknown) => void, resolve: (value: unknown) => void, args: unknown[], store: TransactionStore): void;
}
