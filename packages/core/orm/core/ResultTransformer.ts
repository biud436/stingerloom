/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassConstructor } from "class-transformer";
import type { QueryResult } from "../types/QueryResult";
import { BaseResultTransformer } from "./BaseResultTransformer";
import { deserializeEntity } from "./DeserializeEntity";
import {
    ENTITY_TOKEN,
    MANY_TO_ONE_TOKEN,
    ManyToOneMetadata,
} from "../decorators";

export class ResultTransformer implements BaseResultTransformer {
    private static SEPERATOR = "_";

    /**
     * 쿼리 결과가 없는 경우를 확인합니다.
     *
     * @param queryResult
     * @returns
     */
    protected hasNoResults(queryResult: QueryResult<any> | undefined): boolean {
        return !queryResult?.results || queryResult.results.length === 0;
    }

    /**
     * 엔티티에서 주종 관계가 아닌 필드를 추출합니다.
     *
     * @param entityClass
     * @param row
     * @param baseEntity
     */
    protected extractBaseEntity<T>(
        entityClass: ClassConstructor<T>,
        row: any,
        baseEntity: any,
    ) {
        const enties = Object.entries(row);

        for (const [key, value] of enties) {
            const isUnderScored = key.includes(ResultTransformer.SEPERATOR);
            if (!isUnderScored) {
                baseEntity[key] = value;
            }

            const baseCls = Reflect.getMetadata(ENTITY_TOKEN, entityClass);
            const propertyCls = Reflect.getMetadata(
                MANY_TO_ONE_TOKEN,
                entityClass,
            ) as ManyToOneMetadata<T>[];

            console.log("baseCls:", baseCls);
            console.log("entityCls:", entityClass);
            console.log("propertyCls:", propertyCls);
            console.log("key:", key.split(ResultTransformer.SEPERATOR)[1]);

            const isManyToOneColumn = propertyCls?.find(
                (e) =>
                    e.columnName === key.split(ResultTransformer.SEPERATOR)[1],
            );

            if (isManyToOneColumn) {
                console.log(
                    `${key.split(ResultTransformer.SEPERATOR)[1]}는 ManyToOne 컬럼입니다`,
                );
            }
        }
    }

    /**
     * 빈 엔티티를 생성합니다.
     */
    protected buildNullEntity() {
        return undefined;
    }

    /**
     * 빈 엔티티 컬렉션을 생성합니다.
     */
    protected buildEmptyEntities<T>(): T[] {
        return [] as T[];
    }

    /**
     * SQL 결과를 단일 엔티티로 변환합니다.
     */
    public toEntity<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T | undefined {
        if (this.hasNoResults(result)) {
            return this.buildNullEntity();
        }

        const r = result!;

        return deserializeEntity(entityClass, r.results[0]);
    }

    /**
     * SQL 결과를 엔티티 배열로 변환합니다.
     */
    public toEntities<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T[] {
        if (this.hasNoResults(result)) {
            return this.buildEmptyEntities<T>();
        }

        const r = result!;

        return r.results.map((item) => deserializeEntity(entityClass, item));
    }

    /**
     * Transform SQL result to entity or entity array.
     *
     * @param entityClass
     * @param result
     * @returns
     */
    public transform<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T | T[] | undefined {
        if (this.hasNoResults(result)) {
            return this.buildNullEntity();
        }

        const r = result!;

        const isSingleEntity = r.results.length === 1;
        if (isSingleEntity) {
            return deserializeEntity(entityClass, r.results[0]);
        }

        return r.results.map((item) => deserializeEntity(entityClass, item));
    }

    /**
     * SQL 결과를 엔티티 또는 엔티티 배열로 변환합니다.
     */
    public transformNested<T>(
        entityClass: ClassConstructor<T>,
        queryResult: QueryResult<any> | undefined,
        relations: { [key: string]: ClassConstructor<any> },
    ): T | T[] | undefined {
        if (this.hasNoResults(queryResult)) {
            return this.buildNullEntity();
        }

        const r = queryResult!;

        const transformedResults = r.results.map<any>((row) => {
            const baseEntity = {} as any;
            const nestedEntities: { [key: string]: any } = {};

            this.extractBaseEntity(entityClass, row, baseEntity);

            const relationPathItem = new Set<{
                path: string;
                entity: ClassConstructor<any>;
            }>();

            // 중첩된 관계 처리
            const relationEntries = Object.entries(relations);
            for (const [path, relationClass] of relationEntries) {
                // 중첩된 관계 정보 저장
                relationPathItem.add({ path, entity: relationClass });

                const pathSegments = path.split(".");
                const entityKey = pathSegments[0];

                // 현재 관계에 해당하는 데이터 추출
                const relationData = {} as any;
                const propertyName = `${entityKey}${ResultTransformer.SEPERATOR}`;
                Object.entries(row)
                    .filter(([key]) => key.startsWith(propertyName))
                    .forEach(([key, value]) => {
                        const formattedPropertyName = key.replace(
                            propertyName,
                            "",
                        );
                        relationData[formattedPropertyName] = value;
                    });

                const hasRelationData = Object.keys(relationData).length > 0;
                if (hasRelationData) {
                    if (!nestedEntities[entityKey]) {
                        nestedEntities[entityKey] = [];
                    }
                    nestedEntities[entityKey].push(
                        deserializeEntity(relationClass, relationData),
                    );
                }
            }

            // 최종 엔티티에 중첩 관계 추가
            const finalEntity = deserializeEntity(entityClass, {
                ...baseEntity,
                ...nestedEntities,
            });

            //

            return finalEntity;
        });

        const isSingleResult = transformedResults.length === 1;

        return isSingleResult ? transformedResults[0] : transformedResults;
    }
}
