import { ClazzType } from "../RouterMapper";
export interface TransactionContextValue<T> {
    type: ClazzType<T>;
    value: T;
}
/**
 * @class TransactionContextHelper
 * @author biud436
 */
export declare class TransactionContextMap {
    context: Map<string, TransactionContextValue<unknown>>;
    reserve<T>(key: string, value: TransactionContextValue<T>): this;
    set<T>(key: string, value: TransactionContextValue<T>): this;
    get<T>(key: string): TransactionContextValue<T>;
    clear(): this;
    toArray(): TransactionContextValue<unknown>[];
    forEach(callback: (value: TransactionContextValue<unknown>, key: string) => void): void;
}
