/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "@stingerloom/common";
import { FindOption } from "../dialects/TransactionHolder";
import { EntityManager, EntityResult } from "./EntityManager";

export class BaseRepository<T> {
    constructor(
        private readonly entity: ClazzType<T>,
        private readonly em: EntityManager,
    ) {}

    async save(item: Partial<T>): Promise<EntityResult<T>> {
        return await this.em.save<T>(this.entity, item);
    }

    async find(findOption: FindOption<T>): Promise<EntityResult<T>> {
        return await this.em.find<T>(this.entity, findOption);
    }

    async findOne(findOption: FindOption<T>): Promise<EntityResult<T>> {
        return await this.em.findOne<T>(this.entity, findOption);
    }

    static of<T>(entity: ClazzType<T>, em: EntityManager): BaseRepository<T> {
        return new BaseRepository(entity, em);
    }

    async persist(item: T): Promise<EntityResult<T>> {
        return await this.em.save<T>(this.entity, item);
    }
}
