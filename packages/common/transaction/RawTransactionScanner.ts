/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataScanner } from "@stingerloom/IoC/scanners";
import { Service } from "typedi";
import { EntityManager, QueryRunner } from "typeorm";
import { TransactionIsolationLevel } from "../decorators/Transactional";

export interface RawTransactionMetadata {
    targetClass: InstanceType<any>;
    currentMethod: string;
}

export interface TxGlobalLockOption {
    transactionIsolationLevel: TransactionIsolationLevel;
    isEntityManager?: boolean;
    queryRunner?: QueryRunner;
    entityManager?: EntityManager;
}

@Service()
export class RawTransactionScanner extends MetadataScanner {
    static readonly GLOBAL_LOCK = "GLOBAL_LOCK";
    private txQueryRunner?: QueryRunner | undefined;
    private txEntityManager?: EntityManager | undefined;

    delete(token: string): void {
        this.mapper.delete(token);
    }

    isLock(token: string): boolean {
        return this.mapper.has(token);
    }

    lock(
        token: string,
        targetClass: InstanceType<any>,
        currentMethod: string,
    ): void {
        this.mapper.set(token, {
            targetClass,
            currentMethod,
        } as RawTransactionMetadata);
    }

    unlock(token: string): void {
        this.mapper.set(token, false);
        this.delete(token);
    }

    async globalLock({
        queryRunner,
        transactionIsolationLevel,
        entityManager,
        isEntityManager = false,
    }: TxGlobalLockOption): Promise<void> {
        this.mapper.set(RawTransactionScanner.GLOBAL_LOCK, true);

        this.txQueryRunner = queryRunner;
        this.txEntityManager = entityManager ?? undefined;
    }

    /**
     * Gets the transaction query runner.
     *
     */
    public getTxQueryRunner(): QueryRunner | undefined {
        if (!this.get(RawTransactionScanner.GLOBAL_LOCK)) {
            console.warn(
                "트랜잭션 범위가 아닌데 TxQueryRunner를 가져오려고 하였습니다",
            );
        }
        return this.txQueryRunner;
    }

    public getTxEntityManager(): EntityManager | undefined {
        if (!this.get(RawTransactionScanner.GLOBAL_LOCK)) {
            console.warn(
                "트랜잭션 범위가 아닌데 TxEntityManager를 가져오려고 하였습니다",
            );
        }
        return this.txEntityManager;
    }

    globalUnlock(): void {
        this.mapper.set(RawTransactionScanner.GLOBAL_LOCK, false);
        this.txQueryRunner = undefined;
        this.txEntityManager = undefined;
    }

    isGlobalLock(): boolean {
        return this.mapper.get(RawTransactionScanner.GLOBAL_LOCK) === true;
    }
}
