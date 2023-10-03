/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    INJECT_QUERYRUNNER_TOKEN,
    TRANSACTIONAL_PARAMS,
    TransactionIsolationLevel,
} from "../decorators";
import { Logger } from "../Logger";
import { TransactionStore } from "./TransactionStore";
import Container from "typedi";
import { RawTransactionScanner } from "./RawTransactionScanner";
import { DataSource } from "typeorm";

export class TransactionQueryRunnerConsumer {
    private LOGGER = new Logger();
    private transactionScanner = Container.get(RawTransactionScanner);

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
    public execute(
        dataSource: DataSource,
        // queryRunner: QueryRunner,
        transactionIsolationLevel: TransactionIsolationLevel,
        targetInjectable: InstanceType<any>,
        method: string,
        originalMethod: (...args: unknown[]) => unknown | Promise<unknown>,
        reject: (reason?: unknown) => void,
        resolve: (value: unknown) => void,
        args: unknown[],
        store: TransactionStore,
    ) {
        const wrapper = async (...args: any[]) => {
            if (this.transactionScanner.isGlobalLock()) {
                this.LOGGER.warn(
                    "트랜잭션이 중첩되었습니다. 자식 트랜잭션은 설정할 수 없습니다",
                );
                return;
            }

            const queryRunner = dataSource.createQueryRunner();
            const manager = queryRunner.manager;

            await queryRunner.connect();
            await queryRunner.startTransaction(transactionIsolationLevel);

            await this.transactionScanner.globalLock({
                queryRunner,
                transactionIsolationLevel,
                entityManager: manager,
            });

            try {
                // QueryRunner를 찾아서 대체한다.
                const params = Reflect.getMetadata(
                    TRANSACTIONAL_PARAMS,
                    targetInjectable,
                    method,
                );

                if (Array.isArray(params) && params.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const paramIndex = Reflect.getMetadata(
                        INJECT_QUERYRUNNER_TOKEN,
                        targetInjectable,
                        method,
                    ) as number;

                    params.forEach(
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        (param, _index) => {
                            args[paramIndex] = queryRunner;
                        },
                    );
                }

                const result = originalMethod.call(targetInjectable, ...args);

                let ret = null;
                // promise인가?
                if (result instanceof Promise) {
                    ret = await result;
                } else {
                    ret = result;
                }

                await queryRunner.commitTransaction();

                if (store.isTransactionCommitToken()) {
                    await store.action(
                        targetInjectable,
                        store.getTransactionCommitMethodName()!,
                    );
                }

                return ret;
            } catch (e: any) {
                await queryRunner.rollbackTransaction();

                if (store.isTransactionRollbackToken()) {
                    await store.action(
                        targetInjectable,
                        store.getTransactionRollbackMethodName()!,
                        e,
                    );
                }

                this.LOGGER.error(
                    `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${e.message}`,
                );
                reject(e);
            } finally {
                await queryRunner.release();

                if (store.isAfterTransactionToken()) {
                    await store.action(
                        targetInjectable,
                        store.getAfterTransactionMethodName()!,
                    );
                }

                this.transactionScanner.globalUnlock();
            }
        };

        resolve(wrapper(...args));
    }
}
