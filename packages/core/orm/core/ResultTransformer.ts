/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassConstructor } from "class-transformer";
import type { QueryResult } from "../types/QueryResult";
import { BaseResultTransformer } from "./BaseResultTransformer";
import { deserializeEntity } from "./DeserializeEntity";
import { MANY_TO_ONE_TOKEN } from "../decorators";
// import { ENTITY_TOKEN } from "../decorators";

export class ResultTransformer implements BaseResultTransformer {
    /**
     * SQL 결과를 단일 엔티티로 변환합니다.
     */
    toEntity<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T | undefined {
        if (!result?.results || result.results.length === 0) {
            return undefined;
        }

        return deserializeEntity(entityClass, result.results[0]);
    }

    /**
     * SQL 결과를 엔티티 배열로 변환합니다.
     */
    toEntities<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T[] {
        if (!result?.results || result.results.length === 0) {
            return [];
        }

        return result.results.map((item) =>
            deserializeEntity(entityClass, item),
        );
    }

    /**
     * SQL 결과를 엔티티 또는 엔티티 배열로 변환합니다.
     * 결과가 없으면 undefined를 반환하고,
     * 결과가 하나면 단일 엔티티를,
     * 결과가 여러 개면 엔티티 배열을 반환합니다.
     */
    transform<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T | T[] | undefined {
        if (!result?.results || result.results.length === 0) {
            return undefined;
        }

        if (result.results.length === 1) {
            return deserializeEntity(entityClass, result.results[0]);
        }

        return result.results.map((item) =>
            deserializeEntity(entityClass, item),
        );
    }

    /**
     * SQL 결과를 엔티티 또는 엔티티 배열로 변환합니다.
     */
    transformNested<T>(
        entityClass: ClassConstructor<T>,
        queryResult: QueryResult<any> | undefined,
        relations: { [key: string]: ClassConstructor<any> },
    ): T | T[] | undefined {
        if (!queryResult?.results || queryResult.results.length === 0) {
            return undefined;
        }

        const transformedResults = queryResult.results.map<any>((row) => {
            const baseEntity = {} as any;
            const nestedEntities: { [key: string]: any } = {};

            // const entityMetadata = Reflect.getMetadata(
            //     ENTITY_TOKEN,
            //     entityClass,
            // );

            // 기본 엔티티 속성 추출
            Object.entries(row).forEach(([key, value]) => {
                const isUnderScored = key.includes("_");
                if (!isUnderScored) {
                    baseEntity[key] = value;
                }
                console.log("test metadata:", Reflect.get(entityClass, key));

                console.log(
                    "test metadata2:",
                    Reflect.getMetadata(MANY_TO_ONE_TOKEN, entityClass),
                );

                // console.log("entityMetadata", entityMetadata);
            });

            const relationPathItem = new Set<{
                path: string;
                entity: ClassConstructor<any>;
            }>();

            // 중첩된 관계 처리
            Object.entries(relations).forEach(([path, relationClass]) => {
                // 중첩된 관계 정보 저장
                relationPathItem.add({ path, entity: relationClass });

                const pathSegments = path.split(".");
                const entityKey = pathSegments[0];

                // 현재 관계에 해당하는 데이터 추출
                const relationData = {} as any;
                const propertyName = `${entityKey}_`;
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
            });

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
