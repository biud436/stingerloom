/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "@stingerloom/core/common";
import { FindOption } from "../dialects/FindOption";
import { BaseRepository } from "./BaseRepository";
import { EntityResult } from "../types/EntityResult";

export abstract class IEntityManager {
    abstract register(): Promise<void>;
    abstract connect(): Promise<void>;
    abstract propagateShutdown(): Promise<void>;
    abstract findOne<T>(
        entity: ClazzType<T>,
        findOption: FindOption<T>,
    ): Promise<EntityResult<T>>;
    abstract find<T>(
        entity: ClazzType<T>,
        findOption: FindOption<T>,
    ): Promise<EntityResult<T>>;

    /**
     * Update or Insert 쿼리
     * @param entity
     * @param item
     */
    abstract save<T>(
        entity: ClazzType<T>,
        item: Partial<T>,
    ): Promise<InstanceType<ClazzType<T>>>;

    /**
     * 전달된 Entity의 BaseRepository를 생성합니다.
     */
    abstract getRepository<T>(entity: ClazzType<T>): BaseRepository<T>;
}
