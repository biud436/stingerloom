/* eslint-disable @typescript-eslint/no-explicit-any */
import { InstanceScanner } from "@stingerloom/IoC";
import { ClazzType } from "./RouterMapper";
import { ReflectManager } from "./ReflectManager";
import Database from "./Database";
import {
    DEFAULT_ISOLATION_LEVEL,
    TRANSACTION_ISOLATE_LEVEL,
} from "./decorators";
import { EntityManager } from "typeorm";
import { InternalServerException } from "@stingerloom/error";

export class TransactionManager {
    public static async checkTransactionalZone(
        TargetInjectable: ClazzType<any>,
        targetInjectable: any,
        instanceScanner: InstanceScanner,
    ) {
        if (ReflectManager.isTransactionalZone(TargetInjectable)) {
            // 모든 메소드를 순회합니다.
            for (const method of Object.getOwnPropertyNames(targetInjectable)) {
                // 데이터베이스 인스턴스를 가져옵니다.
                const database = instanceScanner.get(Database) as Database;

                // 메소드가 트랜잭셔널이라면
                if (
                    ReflectManager.isTransactionalZoneMethod(
                        targetInjectable,
                        method,
                    )
                ) {
                    const transactionRunner = () => {
                        const originalMethod = targetInjectable[method];

                        // 트랜잭션 격리 레벨을 가져옵니다.
                        const transactionIsolationLevel =
                            Reflect.getMetadata(
                                TRANSACTION_ISOLATE_LEVEL,
                                targetInjectable,
                                method,
                            ) || DEFAULT_ISOLATION_LEVEL;

                        return new Promise((resolve, reject) => {
                            database
                                .getDataSource()
                                .transaction(
                                    transactionIsolationLevel,
                                    async (manager) => {
                                        const transactionProxy = function (
                                            ...args: any[]
                                        ) {
                                            if (
                                                Array.isArray(args) &&
                                                args.length > 0
                                            ) {
                                                args.map((arg) => {
                                                    if (
                                                        arg instanceof
                                                        EntityManager
                                                    ) {
                                                        return manager;
                                                    }
                                                    return arg;
                                                });
                                            }

                                            originalMethod.apply(
                                                targetInjectable,
                                                args,
                                            );
                                        };

                                        resolve(transactionProxy);
                                    },
                                )
                                .catch(reject);
                        });
                    };

                    try {
                        // 기존 메소드를 대체합니다.
                        targetInjectable[method] = await transactionRunner();
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
