import { ClazzType } from "@stingerloom/core/common";
import { DatabaseClient } from "../DatabaseClient";
import { FindOption } from "../dialects/FindOption";
import { BaseRepository } from "./BaseRepository";
import { IEntityManager } from "./IEntityManager";
export type EntityResult<T> = InstanceType<ClazzType<T>> | InstanceType<ClazzType<T>>[] | undefined;
export type QueryResult<T = any> = {
    results: T[];
};
export declare class EntityManager implements IEntityManager {
    private _entities;
    private readonly logger;
    private driver?;
    private dataSource?;
    register(): Promise<void>;
    get client(): DatabaseClient;
    get connection(): import("./IConnector").IConnector;
    connect(): Promise<void>;
    propagateShutdown(): Promise<void>;
    getNameStrategy<T>(clazz: ClazzType<T>): string;
    private registerEntities;
    private registerForeignKeys;
    /**
     * 인덱스를 생성합니다.
     *
     * @param TargetEntity
     * @param tableName
     */
    private registerIndex;
    /**
     * findOne 메서드는 하나의 엔티티를 조회합니다.
     *
     * @param entity
     * @param findOption
     * @returns
     */
    findOne<T>(entity: ClazzType<T>, findOption: FindOption<T>): Promise<EntityResult<T>>;
    find<T>(entity: ClazzType<T>, findOption: FindOption<T>): Promise<EntityResult<T>>;
    /**
     * 백틱으로 감싸지 않은 컬럼 이름을 백틱으로 감싸서 반환합니다.
     */
    wrap(columnName: string): string;
    private isMySqlFamily;
    /**
     * 업데이트 쿼리
     */
    save<T>(entity: ClazzType<T>, item: Partial<T>): Promise<InstanceType<ClazzType<T>>>;
    getRepository<T>(entity: ClazzType<T>): BaseRepository<T>;
}
