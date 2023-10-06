/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRANSACTIONAL_PARAMS, TransactionIsolationLevel } from "../decorators";
import { Logger } from "../Logger";
import { DataSource, EntityManager } from "typeorm";
import { TransactionStore } from "./TransactionStore";
import Container from "typedi";
import { RawTransactionScanner } from "./RawTransactionScanner";
import { isArrayOk } from "@stingerloom/utils/isArrayOk";
import { isPromise } from "util/types";

export class TransactionEntityManagerConsumer {
    public LOGGER: Logger = new Logger(TransactionEntityManagerConsumer.name);
    private readonly transactionScanner = Container.get(RawTransactionScanner);

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
    public execute(
        // entityManager: EntityManager,
        dataSource: DataSource,
        transactionIsolationLevel: TransactionIsolationLevel,
        targetInjectable: InstanceType<any>,
        method: string,
        args: unknown[],
        originalMethod: (...args: unknown[]) => unknown | Promise<unknown>,
        resolve: (value: unknown) => void,
        reject: (reason?: unknown) => void,
        store: TransactionStore,
    ) {
        if (this.transactionScanner.isGlobalLock()) {
            this.LOGGER.warn(
                "트랜잭션이 중첩되었습니다. 자식 트랜잭션은 설정할 수 없습니다",
            );
            return;
        }

        this.LOGGER.warn(
            "[DEPRECATED] EntityManager 주입 전략은 이제 사용되지 않습니다!",
        );

        const queryRunner = dataSource.createQueryRunner();
        const entityManager = queryRunner.manager;

        entityManager
            .transaction(transactionIsolationLevel, async (em) => {
                await this.transactionScanner.globalLock({
                    queryRunner,
                    entityManager,
                    transactionIsolationLevel,
                    isEntityManager: true,
                });

                const params = Reflect.getMetadata(
                    TRANSACTIONAL_PARAMS,
                    targetInjectable,
                    method as any,
                );

                if (isArrayOk(params)) {
                    if (isArrayOk(args)) {
                        args = args.map((arg, index) => {
                            const param = params[index];
                            if (param instanceof EntityManager) {
                                return em;
                            }
                            return arg;
                        });
                    } else {
                        args = [em];
                    }
                }

                // 트랜잭션을 실행합니다.
                try {
                    const result = originalMethod.call(
                        targetInjectable,
                        ...args,
                    );

                    if (store.isTransactionCommitToken()) {
                        await store.action(
                            targetInjectable,
                            store.getTransactionCommitMethodName()!,
                        );
                    }

                    if (isPromise(result)) {
                        return resolve(await result);
                    } else {
                        resolve(result);
                    }
                } catch (err: any) {
                    this.LOGGER.error(
                        `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${err.message}`,
                    );

                    const queryRunner = em.queryRunner;

                    if (queryRunner) {
                        await queryRunner.rollbackTransaction();
                    }

                    if (store.isTransactionRollbackToken()) {
                        await store.action(
                            targetInjectable,
                            store.getTransactionRollbackMethodName()!,
                        );
                    }

                    reject(err);
                }
            })
            .catch((err) => {
                this.LOGGER.error(
                    `트랜잭션을 실행하는 도중 오류가 발생했습니다1: ${err.message}`,
                );
                reject(err);
            })
            .finally(() => {
                // 트랜잭션 이후에 실행할 메소드가 있는가?
                if (store.isAfterTransactionToken()) {
                    setTimeout(() => {
                        store.action(
                            targetInjectable,
                            store.getAfterTransactionMethodName()!,
                        );
                    }, 0);
                }

                // this.transactionScanner.unlock(token);
                this.transactionScanner.globalUnlock();
            });
        return args;
    }
}
