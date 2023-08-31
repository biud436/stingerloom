/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRANSACTIONAL_PARAMS, TransactionIsolationLevel } from "../decorators";
import { Logger } from "../Logger";
import { EntityManager } from "typeorm";

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

                    // 비동기 함수인지 동기 함수인지 확인합니다.
                    if (result instanceof Promise) {
                        return resolve(await result);
                    } else {
                        resolve(result);
                    }
                } catch (err: any) {
                    this.printError(err);

                    const queryRunner = em.queryRunner;

                    if (queryRunner) {
                        queryRunner.rollbackTransaction();
                    }

                    reject(err);
                }
            })
            .catch((err) => {
                this.printError(err);
                reject(err);
            });
        return args;
    }

    private printError(err: any) {
        this.LOGGER.error(
            `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${err.message}`,
        );
    }
}
