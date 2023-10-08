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
import { DataSource, EntityManager, QueryRunner } from "typeorm";
import { ClazzType } from "../RouterMapper";
import { isArrayOk } from "@stingerloom/utils";
import { isPromise } from "util/types";
import { Exception } from "@stingerloom/error/Exception";

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
            let queryRunner: QueryRunner | undefined = undefined;
            let manager: EntityManager | undefined = undefined;

            // 논리 트랜잭션이 있는지 확인합니다.
            if (this.transactionScanner.isGlobalLock()) {
                // 새로운 논리 트랜잭션을 시작합니다.
                this.transactionScanner.addLogicalTransactionCount();

                queryRunner = this.transactionScanner.getTxQueryRunner();
                manager = this.transactionScanner.getTxEntityManager();
            } else {
                // 새로운 물리 트랜잭션을 생성합니다.
                queryRunner = dataSource.createQueryRunner();
                manager = queryRunner.manager;

                await queryRunner.connect();
                await queryRunner.startTransaction(transactionIsolationLevel);

                await this.transactionScanner.globalLock({
                    queryRunner,
                    transactionIsolationLevel,
                    entityManager: manager,
                });
            }

            if (!queryRunner) {
                throw new Exception(
                    "트랜잭션 QueryRunner를 찾을 수 없습니다",
                    500,
                );
            }

            try {
                // QueryRunner를 찾아서 대체한다.
                const params = Reflect.getMetadata(
                    TRANSACTIONAL_PARAMS,
                    targetInjectable,
                    method,
                ) as ClazzType<unknown>[];

                if (isArrayOk(params)) {
                    const paramIndex = Reflect.getMetadata(
                        INJECT_QUERYRUNNER_TOKEN,
                        targetInjectable,
                        method,
                    ) as number;

                    params.forEach(() => (args[paramIndex] = queryRunner));
                }

                /**
                 * 트랜잭션 매니저에서 위 코드를 실행하기 전에 QueryRunner에 대한 복원 지점을 만들어야 합니다.
                 * 쉽게 말하면 현재 진행되는 물리 트랜잭션을 롤백하고 쿼리가 실행되기 전의 상태까지 재실행해야 합니다.
                 *
                 * originalMethod가 실행되는 도중에 논리 트랜잭션이 롤백될 수도 있기 때문입니다.
                 * 따라서 논리 트랜잭션이 롤백되면 복원 지점으로 QueryRunner를 복구해야 합니다.
                 */
                const result = originalMethod.call(targetInjectable, ...args);

                let ret = null;

                if (isPromise(result)) {
                    ret = await result;
                } else {
                    ret = result;
                }

                /**
                 * 논리 트랜잭션이 모두 커밋되어야 물리 트랜잭션을 커밋할 수 있습니다.
                 * 따라서 커밋은 물리 트랜잭션이 커밋되어야 하는 상황에서만 커밋됩니다.
                 */
                if (
                    this.transactionScanner.isCommittedAllLogicalTransaction()
                ) {
                    await queryRunner.commitTransaction();
                }

                // 논리 트랜잭션이 커밋되어도, 커밋 이벤트가 발생합니다.
                if (store.isTransactionCommitToken()) {
                    await store.action(
                        targetInjectable,
                        store.getTransactionCommitMethodName()!,
                    );
                }

                return ret;
            } catch (e: any) {
                // ? 트랜잭션 롤백 전략
                // ? 현재의 롤백 전략은 단 하나의 물리 트랜잭션을 롤백합니다.
                // ? SAVEPOINT를 사용하여 트랜잭션을 롤백하는 방법도 있습니다.
                // ? 단, 이 방법은 DBMS에 따라 지원하지 않을 수도 있습니다.
                // ? 또는, 논리 트랜잭션 시작 전에 복원 지점을 설정하는 것입니다.
                // ? TypeORM에서는 transactionDepth가 0이 아닌 경우에만 SAVEPOINT를 설정합니다.
                await queryRunner.rollbackTransaction();
                this.transactionScanner.resetLogicalTransactionCount();

                // await queryRunner.query("SAVEPOINT ROLLBACK_POINT;")

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
                /**
                 * 논리 트랜잭션이 모두 커밋되어야 QueryRunner를 반환할 수 있습니다.
                 **/
                if (
                    this.transactionScanner.isCommittedAllLogicalTransaction()
                ) {
                    await queryRunner.release();
                    this.transactionScanner.globalUnlock();
                } else {
                    // 논리 트랜잭션이 모두 커밋되지 않았다면, 논리 트랜잭션을 하나 제거합니다.
                    this.transactionScanner.subtractLogicalTransactionCount();
                }

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
