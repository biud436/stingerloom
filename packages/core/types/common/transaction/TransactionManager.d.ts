import { InstanceScanner } from "@stingerloom/core/IoC";
import { ClazzType } from "../RouterMapper";
export declare const TRANSACTION_MANAGER_SYMBOL: unique symbol;
/**
 * @class TransactionManager
 */
export declare class TransactionManager {
    private static LOGGER;
    private static txManagerConsumer;
    private static txQueryRunnerConsumer;
    static checkTransactionalZone(TargetInjectable: ClazzType<any>, targetInjectable: InstanceType<any>, instanceScanner: InstanceScanner): Promise<void>;
    private static getPrototypeMethods;
    private static createStore;
    /**
     * 트랜잭션 엔티티 매니저가 필요한 지 여부를 확인합니다.
     *
     * @param targetInjectable
     * @param method
     * @returns
     */
    private static getTxManager;
    /**
     * 트랜잭션 격리 수준을 가져옵니다.
     *
     * @param targetInjectable
     * @param method
     * @returns
     */
    private static getTransactionIsolationLevel;
}
