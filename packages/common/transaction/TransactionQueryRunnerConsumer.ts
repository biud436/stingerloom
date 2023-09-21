/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    INJECT_QUERYRUNNER_TOKEN,
    TRANSACTIONAL_PARAMS,
    TransactionIsolationLevel,
} from "../decorators";
import { Logger } from "../Logger";
import { DataSource } from "typeorm";
import { TransactionStore } from "./TransactionStore";

export class TransactionQueryRunnerConsumer {
    private LOGGER = new Logger();

    public execute(
        dataSource: DataSource,
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
            // 단일 트랜잭션을 실행합니다.
            const queryRunner = dataSource.createQueryRunner();

            // 에디터가 await using을 지원하지 않아서 주석처리합니다.
            // await using myQueryRunner = new DisposableQueryRunner(dataSource);

            await queryRunner.connect();
            await queryRunner.startTransaction(transactionIsolationLevel);

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
            }
        };

        resolve(wrapper(...args));
    }
}
