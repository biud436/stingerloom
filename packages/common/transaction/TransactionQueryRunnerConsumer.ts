/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    INJECT_QUERYRUNNER_TOKEN,
    TRANSACTIONAL_PARAMS,
    TRANSACTION_PROPAGATION,
    TransactionIsolationLevel,
    TransactionPropagation,
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
import { TransactionManager } from "./TransactionManager";

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

            // 트랜잭션 전파 속성
            const propagation = Reflect.getMetadata(
                TRANSACTION_PROPAGATION,
                targetInjectable,
                method,
            ) as TransactionPropagation;

            if (propagation === TransactionPropagation.REQUIRED) {
                // ? 트랜잭션 전파 속성이 TransactionPropagation.REQUIRED일 경우,
                // ? 기존 트랜잭션에 참여합니다.

                // 논리 트랜잭션이 있는지 확인합니다.
                if (this.transactionScanner.isGlobalLock()) {
                    // 새로운 논리 트랜잭션을 시작합니다.
                    this.transactionScanner.addLogicalTransactionCount();

                    queryRunner = this.transactionScanner.getTxQueryRunner();
                    manager = this.transactionScanner.getTxEntityManager();

                    this.LOGGER.info("기존 트랜잭션에 참여하였습니다");
                } else {
                    // 새로운 물리 트랜잭션을 생성합니다.
                    queryRunner = dataSource.createQueryRunner();
                    manager = queryRunner.manager;

                    await this.transactionScanner.newTransaction({
                        queryRunner,
                        transactionIsolationLevel,
                        entityManager: manager,
                        propagation,
                    });

                    // await queryRunner.connect();
                    // await queryRunner.startTransaction(
                    //     transactionIsolationLevel,
                    // );

                    await this.transactionScanner.globalLock({
                        queryRunner,
                        transactionIsolationLevel,
                        entityManager: manager,
                        propagation,
                    });

                    this.LOGGER.info("트랜잭션이 시작되었습니다");
                }
            } else if (propagation === TransactionPropagation.REQUIRES_NEW) {
                // ? 트랜잭션 전파 속성이 TransactionPropagation.REQUIRES_NEW일 경우,
                // ? 새로운 트랜잭션을 시작합니다.
                if (!this.transactionScanner.isGlobalLock()) {
                    throw new Exception(
                        "기존에 시작된 트랜잭션이 없는데 REQUIRES_NEW가 지정되었습니다",
                        500,
                    );
                }

                // TODO: 프록시 객체에서 다음 엔티티 매니저가 사용되어야 하므로, 트랜잭션 스캐너에 엔티티 매니저가 저장되어야 합니다.
                queryRunner = dataSource.createQueryRunner();
                manager = queryRunner.manager;

                await this.transactionScanner.newTransaction({
                    queryRunner,
                    transactionIsolationLevel,
                    propagation,
                    entityManager: manager,
                });

                this.LOGGER.info("트랜잭션이 새로 시작되었습니다");
            } else {
                throw new Exception(
                    "지원하지 않는 트랜잭션 전파 속성입니다",
                    500,
                );
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
                if (propagation === TransactionPropagation.REQUIRED) {
                    const isCommitted =
                        this.transactionScanner.isCommittedAllLogicalTransaction();

                    if (isCommitted) {
                        await queryRunner.commitTransaction();
                    }
                } else if (
                    propagation === TransactionPropagation.REQUIRES_NEW
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
                await queryRunner.rollbackTransaction();

                if (propagation === TransactionPropagation.REQUIRED) {
                    this.transactionScanner.resetLogicalTransactionCount();
                }

                if (store.isTransactionRollbackToken()) {
                    await store.action(
                        targetInjectable,
                        store.getTransactionRollbackMethodName()!,
                        e,
                    );
                }

                TransactionManager.checkRollbackException(
                    targetInjectable,
                    method,
                );

                this.LOGGER.error(
                    `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${e.message}`,
                );
                reject(e);
            } finally {
                if (propagation === TransactionPropagation.REQUIRED) {
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
                } else if (
                    propagation === TransactionPropagation.REQUIRES_NEW
                ) {
                    await queryRunner.release();
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
