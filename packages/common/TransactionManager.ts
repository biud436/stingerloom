/* eslint-disable @typescript-eslint/no-explicit-any */
import { InstanceScanner } from "@stingerloom/IoC";
import { ClazzType } from "./RouterMapper";
import { ReflectManager } from "./ReflectManager";
import Database from "./Database";
import {
    DEFAULT_ISOLATION_LEVEL,
    TRANSACTIONAL_PARAMS,
    TRANSACTION_ISOLATE_LEVEL,
} from "./decorators";

import { InternalServerException } from "@stingerloom/error";
import { Logger } from "./Logger";

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

                        const callback = async (...args: any[]) => {
                            return new Promise((resolve, reject) => {
                                // 트랜잭션을 시작합니다.
                                entityManager
                                    .transaction(
                                        transactionIsolationLevel,
                                        async (em) => {
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
                                                            if (
                                                                param instanceof
                                                                param[0]
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
                                            const result = originalMethod.call(
                                                targetInjectable,
                                                ...args,
                                            );

                                            resolve(result);
                                        },
                                    )
                                    .catch((err) => {
                                        TransactionManager.LOGGER.error(
                                            `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${err.message}`,
                                        );
                                        reject(err);
                                    });
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
