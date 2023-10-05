/* eslint-disable @typescript-eslint/no-explicit-any */
import { InstanceScanner } from "@stingerloom/IoC";
import { ClazzType } from "../RouterMapper";
import { ReflectManager } from "../ReflectManager";
import Database from "../Database";
import {
    AFTER_TRANSACTION_TOKEN,
    BEFORE_TRANSACTION_TOKEN,
    DEFAULT_ISOLATION_LEVEL,
    TRANSACTION_COMMIT_TOKEN,
    TRANSACTION_ENTITY_MANAGER,
    TRANSACTION_ISOLATE_LEVEL,
    TRANSACTION_ROLLBACK_TOKEN,
    TransactionIsolationLevel,
} from "../decorators";

import { InternalServerException } from "@stingerloom/error";
import { Logger } from "../Logger";
import { TransactionEntityManagerConsumer } from "./TransactionEntityManagerConsumer";
import { TransactionQueryRunnerConsumer } from "./TransactionQueryRunnerConsumer";
import { ITransactionStore } from "./ITransactionStore";
import { TransactionStore } from "./TransactionStore";
import { v4 as uuidv4 } from "uuid";

export const TRANSACTION_MANAGER_SYMBOL = Symbol("TRANSACTION_MANAGER");

/**
 * @class TransactionManager
 */
export class TransactionManager {
    private static LOGGER = new Logger(TransactionManager.name);
    private static txManagerConsumer = new TransactionEntityManagerConsumer();
    private static txQueryRunnerConsumer = new TransactionQueryRunnerConsumer();

    public static async checkTransactionalZone(
        TargetInjectable: ClazzType<any>,
        targetInjectable: InstanceType<any>,
        instanceScanner: InstanceScanner,
    ) {
        if (ReflectManager.isTransactionalZone(TargetInjectable)) {
            const store = this.createStore(targetInjectable);
            const methods = store.methods;

            // 모든 메소드를 순회합니다.
            for (const method of methods) {
                const database = instanceScanner.get(Database) as Database;

                // prettier-ignore
                if (ReflectManager.isTransactionalZoneMethod(targetInjectable, method)) {
                    const wrapTransaction = () => {

                        const originalMethod = targetInjectable[method as any];

                        // 트랜잭션 격리 레벨을 가져옵니다.
                        const transactionIsolationLevel =
                            TransactionManager.getTransactionIsolationLevel(
                                targetInjectable,
                                method,
                            );

                        // 트랜잭션을 시작합니다.
                        const dataSource = database.getDataSource();

                        // 트랜잭션 엔티티 매니저가 필요한가?
                        const transactionalEntityManager =
                            TransactionManager.getTxManager(
                                targetInjectable,
                                method,
                            );

                        const callback = async (...args: any[]) => {

                            if (store.isBeforeTransactionToken()) {
                                TransactionManager.LOGGER.info(
                                    `${TargetInjectable.name}에서 isBeforeTransactionToken이 있습니다`,
                                );   
                                await store.action(targetInjectable, store.getBeforeTransactionMethodName()!);
                            }    

                            return new Promise((resolve, reject) => {
                                if (transactionalEntityManager) {
                                    // 트랜잭션 엔티티 매니저를 실행합니다.
                                    this.txManagerConsumer.execute(
                                        dataSource,
                                        transactionIsolationLevel,
                                        targetInjectable,
                                        method,
                                        args,
                                        originalMethod,
                                        resolve,
                                        reject,
                                        store,
                                    );
                                } else {
                                    this.txQueryRunnerConsumer.execute(
                                        dataSource,
                                        transactionIsolationLevel,
                                        targetInjectable,
                                        method,
                                        originalMethod,
                                        reject,
                                        resolve,
                                        args,
                                        store,
                                    );
                                }                                
                            });
                        };

                        return callback;
                    };

                    try {
                        // 기존 메소드를 대체합니다.
                        targetInjectable[method] = wrapTransaction();
                    } catch (err: any) {
                        throw new InternalServerException(
                            `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${err.message}`,
                        );
                    }
                }
            }
        }
    }

    private static getPrototypeMethods() {
        return (obj: any): string[] => {
            const properties = new Set<string>();
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
    }

    private static createStore(
        targetInjectable: InstanceType<any>,
    ): TransactionStore {
        const store: ITransactionStore = {};
        const getPrototypeMethods = TransactionManager.getPrototypeMethods();

        // prettier-ignore
        for (const method of getPrototypeMethods(targetInjectable)) {
            if (ReflectManager.isBeforeTransactionMethod(targetInjectable, method)) {
                store[BEFORE_TRANSACTION_TOKEN] = method;
            } else if (ReflectManager.isAfterTransactionMethod(targetInjectable, method)) {
                store[AFTER_TRANSACTION_TOKEN] = method;
            } else if (ReflectManager.isCommitMethod(targetInjectable, method)) {
                store[TRANSACTION_COMMIT_TOKEN] = method;
            } else if (ReflectManager.isRollbackMethod(targetInjectable, method)) {
                store[TRANSACTION_ROLLBACK_TOKEN] = method;
            }
        }

        return new TransactionStore(
            store,
            getPrototypeMethods(targetInjectable),
            uuidv4(),
        );
    }

    /**
     * 트랜잭션 엔티티 매니저가 필요한 지 여부를 확인합니다.
     *
     * @param targetInjectable
     * @param method
     * @returns
     */
    private static getTxManager(
        targetInjectable: any,
        method: string,
    ): boolean {
        return Reflect.getMetadata(
            TRANSACTION_ENTITY_MANAGER,
            targetInjectable,
            method as any,
        ) as boolean;
    }

    /**
     * 트랜잭션 격리 수준을 가져옵니다.
     *
     * @param targetInjectable
     * @param method
     * @returns
     */
    private static getTransactionIsolationLevel(
        targetInjectable: any,
        method: string,
    ): TransactionIsolationLevel {
        return (Reflect.getMetadata(
            TRANSACTION_ISOLATE_LEVEL,
            targetInjectable,
            method as any,
        ) || DEFAULT_ISOLATION_LEVEL) as TransactionIsolationLevel;
    }
}
