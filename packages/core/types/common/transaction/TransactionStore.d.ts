import { ITransactionStore } from "./ITransactionStore";
export declare class TransactionStore {
    store: ITransactionStore;
    methods: string[];
    virtualTransactionId: string;
    constructor(store: ITransactionStore, methods: string[], virtualTransactionId: string);
    isBeforeTransactionToken(): boolean;
    isAfterTransactionToken(): boolean;
    isTransactionCommitToken(): boolean;
    isTransactionRollbackToken(): boolean;
    getBeforeTransactionMethodName(): string | undefined;
    getAfterTransactionMethodName(): string | undefined;
    getTransactionCommitMethodName(): string | undefined;
    getTransactionRollbackMethodName(): string | undefined;
    action(targetInjectable: InstanceType<any>, method: string, ...args: unknown[]): Promise<any>;
}
