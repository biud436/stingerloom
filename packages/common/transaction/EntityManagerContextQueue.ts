import { EntityManager, QueryRunner } from "typeorm";
import {
    TransactionIsolationLevel,
    TransactionPropagation,
} from "../decorators";

export interface TxContext {
    transactionIsolationLevel: TransactionIsolationLevel;
    isEntityManager?: boolean;
    queryRunner?: QueryRunner;
    entityManager?: EntityManager;
    propagation?: TransactionPropagation;
}

/**
 * @class EntityManagerContextQueue
 * @description
 * 트랜잭션 컨텍스트를 저장하는 큐입니다.
 *
 * 기존 프록시 객체가 새로운 연결을 가진 EntityManager를 반환해야 합니다.
 *
 * 이렇게 하지 않으면 Repository가 save()될 때, 트랜잭션이 이미 생성되었는지 감지하지 못하고,
 * save()를 호출할 때마다 하나의 트랜잭션으로 묶이게 됩니다.
 *
 * 이를 방지하려면 기존 EntityManager 프록시를 변경해야 합니다.
 *
 * 하나의 트랜잭션이 시작되고 끝날 때 엔티티 매니저 큐에서 이미 사용된 엔티티 매니저를 제거해야 합니다.
 *
 * 기존 엔티티 매니저 프록시에서는 가장 첫번째 원소만 가져와야 할 것입니다.
 *
 * 이렇게 하면 Propagation.REQUIRES_NEW가 반복되더라도 안전합니다.
 *
 * 다음 로직이 필요합니다.
 *
 * * 로직
 * - 새로운 트랜잭션이 시작될 때 큐에 컨텍스트를 넣는다.
 * - 트랜잭션이 끝날 때, 큐에 있는 컨텍스트를 하나 비운다.
 * - 가장 상위 트랜잭션이 끝날 때, 모든 컨텍스트를 비운다.
 * - 중요한 점은 루트 트랜잭션이 끝났을 땐 반드시 모든 컨텍스트를 비워야 한다는 점입니다.
 *
 * * 새로운 트랜잭션 시작 조건
 * - 트랜잭션 전파 속성이 REQUIRES_NEW일 때, 새로운 트랜잭션을 시작합니다.
 *
 * Queue 구조이므로 선입선출입니다.
 */
export class EntityManagerContextQueue {
    #data: TxContext[] = [];

    /**
     * 새로운 트랜잭션이 시작될 때 큐에 새로운 컨텍스트를 추가합니다.
     * @param data
     */
    enqueue(data: Partial<TxContext>) {
        this.#data.push(data as TxContext);
    }

    /**
     * 큐에 있는 컨텍스트를 하나 비웁니다.
     *
     * @returns
     */
    dequeue() {
        const result = this.#data.shift();

        if (this.depth === 0) {
            this.clear();
        }

        return result;
    }

    /**
     * 컨텍스트가 있는지 확인합니다.
     *
     * @returns
     */
    first() {
        return this.#data[0];
    }

    last() {
        const length = this.#data.length;
        const result = this.#data[length - 1];

        return result;
    }

    /**
     * 트랜잭션 컨텍스트의 깊이를 가져옵니다.
     */
    get depth() {
        return this.#data.length;
    }

    clear() {
        this.#data = [];
    }

    [Symbol.iterator]() {
        return this.#data[Symbol.iterator]();
    }
}
