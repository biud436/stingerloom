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

    /**
     * 저장된 토큰을 삭제합니다.
     */
    delete(token: string): void {
        this.mapper.delete(token);
    }

    /**
     * 해당 토큰이 존재하는지 확인합니다.
     * 이는 메소드가 잠겨있는지 확인하는데 사용됩니다.
     *
     * @param token
     * @returns
     */
    isLock(token: string): boolean {
        return this.mapper.has(token);
    }

    /**
     * 메소드를 토큰 단위의 락을 사용하여 잠금 처리합니다.
     * @param token
     * @param targetClass
     * @param currentMethod
     */
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

    /**
     * 잠금을 해제합니다.
     *
     * @param token
     */
    unlock(token: string): void {
        this.mapper.set(token, false);
        this.delete(token);
    }

    /**
     * 프로세스 단위에서 메소드를 잠금 처리합니다.
     * 잠금 처리된 메소드는 해제되기 전까지 다른 영역에서 접근할 수 없습니다.
     * 이 메소드는 트랜잭션 데코레이터가 적용된 메소드 안에서
     * 트랜잭션 데코레이터가 적용된 메소드를 다시 호출했는지 확인할 때 사용됩니다.
     *
     * 보통은 이때 외부/내부 트랜잭션으로 나뉘고 하나의 물리 트랜잭션으로 통합합니다.
     *
     * @parm options
     */
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
