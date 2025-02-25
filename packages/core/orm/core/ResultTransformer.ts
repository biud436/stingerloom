/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { ClazzType } from "@stingerloom/core/common";

export type ForeignObject<T = any> = { [key: string]: T };

export class ResultTransformer implements BaseResultTransformer {
    private static PropertySeperator = "_";

    /**
     * 쿼리 결과가 없는 경우를 확인합니다.
     *
     * @param queryResult
     * @returns
     */
    private hasNoResults(queryResult: QueryResult<any> | undefined): boolean {
        return !queryResult?.results || queryResult.results.length === 0;
    }

    /**
     * 엔티티에서 외래키 필드가 아닌 속성을 모두 추출합니다.
     *
     * @param entityClass
     * @param row
     * @param baseEntity
     */
    private extractBaseEntity<T>(
        entityClass: ClassConstructor<T>,
        row: any,
        baseEntity: any,
    ) {
        const enties = Object.entries(row);

        for (const [key, value] of enties) {
            const isUnderScored = key.includes(
                ResultTransformer.PropertySeperator,
            );
            if (!isUnderScored) {
                baseEntity[key] = value;
            }
        }
    }

    /**
     * 빈 엔티티를 생성합니다.
     */
    private buildNullEntity() {
        return undefined;
    }

    /**
     * 빈 엔티티 컬렉션을 생성합니다.
     */
    private buildEmptyEntities<T>(): T[] {
        return [] as T[];
    }

    /**
     * 외래키 오브젝트를 생성합니다.
     */
    private buildForeignObject<T = any>(): ForeignObject<T> {
        return {};
    }

    /**
     * SQL 측 컬럼명을 만듭니다.
     */
    private makeColumnNameWithSeperator(columnName: string): string {
        return `${columnName}${ResultTransformer.PropertySeperator}`;
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
     * 외래키 오브젝트에 내용을 채워넣습니다.
     *
     * @param entityClass 엔티티 클래스
     * @param baseEntity 기본 엔티티
     * @param row SQL 결과
     */
    private fillPropertiesToForeignObject<T>(
        entityClass: ClassConstructor<T>,
        baseEntity: ForeignObject<any>,
        row: any,
    ) {
        // 외래키 메타데이터를 가져옵니다.
        const manyToOneMappingMetadata = Reflect.getMetadata(
            MANY_TO_ONE_TOKEN,
            entityClass,
        ) as ManyToOneMetadata<T>[];
        const foreignKeys = manyToOneMappingMetadata?.map((e) => e.columnName);

        if (foreignKeys) {
            for (const foreignKey of foreignKeys) {
                if (!baseEntity[foreignKey]) {
                    baseEntity[foreignKey] = this.buildForeignObject();
                }
            }

            for (const {
                getMappingEntity,
                columnName,
            } of manyToOneMappingMetadata) {
                const ForeignClass = getMappingEntity() as ClazzType<T>;

                const rows = Object.entries(row);

                const foreignObject = this.buildForeignObject();

                // ! 3. 외래키 오브젝트에 키/값을 채워넣는다.
                for (const [key, value] of rows) {
                    const prefix = this.makeColumnNameWithSeperator(columnName);

                    if (key.startsWith(prefix)) {
                        const keyWithoutPrefix = key.replace(prefix, "");

                        foreignObject[keyWithoutPrefix] = value;
                    }
                }

                // 재귀적으로 순회하여 다중 레벨의 중첩 관계도 변환합니다.
                const relatedManyToOneMappings = Reflect.getMetadata(
                    MANY_TO_ONE_TOKEN,
                    ForeignClass,
                ) as ManyToOneMetadata<any>[];

                if (relatedManyToOneMappings) {
                    this.fillPropertiesToForeignObject(
                        ForeignClass,
                        foreignObject,
                        row,
                    );
                }

                // ! 4. 코어 엔티티에 외래키 오브젝트를 추가한다.
                baseEntity[columnName] = deserializeEntity(
                    ForeignClass,
                    foreignObject,
                );
            }
        }

        const finalEntity = deserializeEntity(entityClass, {
            ...baseEntity,
        });

        return finalEntity;
    }

    /**
     * SQL 결과를 엔티티 또는 엔티티 배열로 변환합니다.
     */
    public transformNested<T>(
        entityClass: ClassConstructor<T>,
        queryResult: QueryResult<any> | undefined,
        relations?: { [key: string]: ClassConstructor<any> },
    ): T | T[] | undefined {
        if (this.hasNoResults(queryResult)) {
            return this.buildNullEntity();
        }

        const r = queryResult!;

        const transformedResults = r.results.map<any>((row) => {
            const baseEntity: { [key: string]: any } = {};

            // * ---------------------------------------------
            // * 기본 로직 구성 *
            // * ---------------------------------------------
            // 1. 코어 엔티티에서 기본적인 속성을 추출한다.
            // 2. 엔티티에 필요한 외래키 오브젝트를 만든다.
            // 3. 외래키 오브젝트에 키/값을 채워넣는다.
            // 4. 코어 엔티티에 외래키 오브젝트를 추가한다.
            //
            // (5. 외래키가 없을 때까지 2-4를 재귀적으로 반복한다)
            // * ---------------------------------------------

            // ! 1. 코어 엔티티에서 기본적인 속성을 추출한다.
            this.extractBaseEntity(entityClass, row, baseEntity);

            // ! 2. 엔티티에 필요한 외래키 오브젝트를 만든다.
            const finalEntity = this.fillPropertiesToForeignObject(
                entityClass,
                baseEntity,
                row,
            );

            return finalEntity;
        });

        const isSingleResult = transformedResults.length === 1;

        return isSingleResult ? transformedResults[0] : transformedResults;
    }
}
