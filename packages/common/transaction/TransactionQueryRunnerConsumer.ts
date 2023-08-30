/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    INJECT_QUERYRUNNER_TOKEN,
    TRANSACTIONAL_PARAMS,
    TransactionIsolationLevel,
} from "../decorators";
import { Logger } from "../Logger";
import { DataSource } from "typeorm";

export class TransactionQueryRunnerConsumer {
    private LOGGER = new Logger();

    public execute(
        dataSource: DataSource,
        transactionIsolationLevel: TransactionIsolationLevel,
        targetInjectable: InstanceType<any>,
        method: string,
        originalMethod: (...args: unknown[]) => unknown | Promise<unknown>,
        resolve: (value: unknown) => void,
        reject: (reason?: unknown) => void,
        args: unknown[],
    ) {
        const wrapper = async (...args: any[]) => {
            // 단일 트랜잭션을 실행합니다.
            const queryRunner = dataSource.createQueryRunner();

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

                return ret;
            } catch (e: any) {
                await queryRunner.rollbackTransaction();
                this.LOGGER.error(
                    `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${e.message}`,
                );
                reject(e);
            } finally {
                await queryRunner.release();
            }
        };

        resolve(wrapper(...args));
    }
}
