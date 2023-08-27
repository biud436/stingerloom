/* eslint-disable @typescript-eslint/no-explicit-any */
import { InstanceScanner } from "@stingerloom/IoC";
import { ClazzType } from "./RouterMapper";
import { ReflectManager } from "./ReflectManager";
import Database from "./Database";
import {
    DEFAULT_ISOLATION_LEVEL,
    TRANSACTIONAL_PARAMS,
    TRANSACTION_ENTITY_MANAGER,
    TRANSACTION_ISOLATE_LEVEL,
} from "./decorators";

import { InternalServerException } from "@stingerloom/error";
import { Logger } from "./Logger";
import { EntityManager } from "typeorm";

export class TransactionManager {
    private static LOGGER = new Logger();

    public static async checkTransactionalZone(
        TargetInjectable: ClazzType<any>,
        targetInjectable: any,
        instanceScanner: InstanceScanner,
    ) {
        if (ReflectManager.isTransactionalZone(TargetInjectable)) {
            TransactionManager.LOGGER.info("트랜잭션 존이 발견되었습니다.");

            const getPrototypeMethods = (obj: any) => {
                const properties = new Set();
                let currentObj = obj;
                do {
                    Object.getOwnPropertyNames(currentObj).map((item) =>
                        properties.add(item),
                    );

                    currentObj = Object.getPrototypeOf(currentObj);
                } while (
                    Object.getPrototypeOf(currentObj) &&
                    Object.getPrototypeOf(currentObj) !== null
                );

                return [...properties.keys()].filter(
                    (item) => typeof obj[item as any] === "function",
                );
            };

            // 모든 메소드를 순회합니다.
            for (const method of getPrototypeMethods(targetInjectable)) {
                // 데이터베이스 인스턴스를 가져옵니다.
                const database = instanceScanner.get(Database) as Database;

                // 메소드가 트랜잭셔널이라면
                if (
                    ReflectManager.isTransactionalZoneMethod(
                        targetInjectable,
                        method as any,
                    )
                ) {
                    const transactionRunner = () => {
                        const originalMethod = targetInjectable[method as any];

                        // 트랜잭션 격리 레벨을 가져옵니다.
                        const transactionIsolationLevel =
                            Reflect.getMetadata(
                                TRANSACTION_ISOLATE_LEVEL,
                                targetInjectable,
                                method as any,
                            ) || DEFAULT_ISOLATION_LEVEL;

                        // 트랜잭션을 시작합니다.
                        const dataSource = database.getDataSource();
                        const entityManager = dataSource.manager;

                        // 트랜잭션 엔티티 매니저가 필요한가?
                        const transactionalEntityManager = Reflect.getMetadata(
                            TRANSACTION_ENTITY_MANAGER,
                            targetInjectable,
                            method as any,
                        );

                        console.log(
                            "transactionalEntityManager",
                            transactionalEntityManager,
                        );

                        const callback = async (...args: any[]) => {
                            return new Promise((resolve, reject) => {
                                if (transactionalEntityManager) {
                                    // 트랜잭션 엔티티 매니저를 실행합니다.
                                    entityManager
                                        .transaction(
                                            transactionIsolationLevel,
                                            async (em) => {
                                                const params =
                                                    Reflect.getMetadata(
                                                        TRANSACTIONAL_PARAMS,
                                                        targetInjectable,
                                                        method as any,
                                                    );

                                                if (
                                                    Array.isArray(params) &&
                                                    params.length > 0
                                                ) {
                                                    if (
                                                        Array.isArray(args) &&
                                                        args.length > 0
                                                    ) {
                                                        args = args.map(
                                                            (arg, index) => {
                                                                const param =
                                                                    params[
                                                                        index
                                                                    ];
                                                                if (
                                                                    param instanceof
                                                                    EntityManager
                                                                ) {
                                                                    return em;
                                                                }
                                                                return arg;
                                                            },
                                                        );
                                                    } else {
                                                        args = [em];
                                                    }
                                                }

                                                // 트랜잭션을 실행합니다.
                                                try {
                                                    const result =
                                                        originalMethod.call(
                                                            targetInjectable,
                                                            ...args,
                                                        );

                                                    // promise인가?
                                                    if (
                                                        result instanceof
                                                        Promise
                                                    ) {
                                                        return resolve(
                                                            await result,
                                                        );
                                                    } else {
                                                        resolve(result);
                                                    }
                                                } catch (err: any) {
                                                    TransactionManager.LOGGER.error(
                                                        `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${err.message}`,
                                                    );

                                                    const queryRunner =
                                                        em.queryRunner;

                                                    if (queryRunner) {
                                                        queryRunner.rollbackTransaction();
                                                    }

                                                    reject(err);
                                                }
                                            },
                                        )
                                        .catch((err) => {
                                            TransactionManager.LOGGER.error(
                                                `트랜잭션을 실행하는 도중 오류가 발생했습니다1: ${err.message}`,
                                            );
                                            reject(err);
                                        });
                                } else {
                                    const wrapper = async (...args: any[]) => {
                                        // 단일 트랜잭션을 실행합니다.
                                        const queryRunner =
                                            dataSource.createQueryRunner();

                                        await queryRunner.connect();
                                        await queryRunner.startTransaction(
                                            transactionIsolationLevel,
                                        );

                                        try {
                                            // QueryRunner를 찾아서 대체한다.
                                            const params = Reflect.getMetadata(
                                                TRANSACTIONAL_PARAMS,
                                                targetInjectable,
                                                method as any,
                                            );

                                            if (
                                                Array.isArray(params) &&
                                                params.length > 0
                                            ) {
                                                if (
                                                    Array.isArray(args) &&
                                                    args.length > 0
                                                ) {
                                                    args = args.map(
                                                        (arg, index) => {
                                                            const param =
                                                                params[index];

                                                            // QueryRunner는 인터페이스로 구현되어 있기 때문에 instanceof로 체크할 수 없다.
                                                            if (
                                                                param.name ===
                                                                "QueryRunner"
                                                            ) {
                                                                return queryRunner;
                                                            }
                                                            return arg;
                                                        },
                                                    );
                                                } else {
                                                    args = [queryRunner];
                                                }
                                            }

                                            const result = originalMethod.call(
                                                targetInjectable,
                                                ...args,
                                            );

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
                                            TransactionManager.LOGGER.error(
                                                `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${e.message}`,
                                            );
                                            reject(e);
                                        } finally {
                                            await queryRunner.release();
                                        }
                                    };

                                    resolve(wrapper(...args));
                                }
                            });
                        };

                        return callback;
                    };

                    try {
                        // 기존 메소드를 대체합니다.
                        targetInjectable[method as any] = transactionRunner();
                    } catch (err: any) {
                        throw new InternalServerException(
                            `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${err.message}`,
                        );
                    }
                }
            }
        }
    }
}
