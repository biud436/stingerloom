import { ClazzType } from "@stingerloom/core/common";
import { FindOption } from "../dialects/FindOption";
import { EntityManager, EntityResult } from "./EntityManager";
export declare class BaseRepository<T> {
    private readonly entity;
    private readonly em;
    constructor(entity: ClazzType<T>, em: EntityManager);
    /**
     * 엔티티를 저장합니다.
     * PK가 존재하지 않으면 새로운 엔티티를 생성합니다.
     */
    save(item: Partial<T>): Promise<EntityResult<T>>;
    /**
     * 엔티티를 조회합니다.
     */
    find(findOption: FindOption<T>): Promise<EntityResult<T>>;
    findOne(findOption: FindOption<T>): Promise<EntityResult<T>>;
    static of<T>(entity: ClazzType<T>, em: EntityManager): BaseRepository<T>;
    persist(item: T): Promise<EntityResult<T>>;
}
