/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRANSACTIONAL_PARAMS, TransactionIsolationLevel } from "../decorators";
import { Logger } from "../Logger";
import { EntityManager } from "typeorm";
import { TransactionStore } from "./TransactionStore";

export class TransactionEntityManagerConsumer {
    public LOGGER: Logger = new Logger(TransactionEntityManagerConsumer.name);

    public execute(
        entityManager: EntityManager,
        transactionIsolationLevel: TransactionIsolationLevel,
        targetInjectable: InstanceType<any>,
        method: string,
        args: unknown[],
        originalMethod: (...args: unknown[]) => unknown | Promise<unknown>,
        resolve: (value: unknown) => void,
        reject: (reason?: unknown) => void,
        store: TransactionStore,
    ) {
        entityManager
            .transaction(transactionIsolationLevel, async (em) => {
                const params = Reflect.getMetadata(
                    TRANSACTIONAL_PARAMS,
                    targetInjectable,
                    method as any,
                );

                if (Array.isArray(params) && params.length > 0) {
                    if (Array.isArray(args) && args.length > 0) {
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

                    // promise인가?
                    if (result instanceof Promise) {
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
            });
        return args;
    }
}
