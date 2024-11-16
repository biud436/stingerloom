/* eslint-disable @typescript-eslint/no-explicit-any */
import { plainToClass, ClassConstructor } from "class-transformer";
import type { QueryResult } from "./EntityManager";

export class ResultTransformer {
    /**
     * SQL 결과를 단일 엔티티로 변환합니다.
     */
    static toEntity<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T | undefined {
        if (!result?.results || result.results.length === 0) {
            return undefined;
        }

        return plainToClass(entityClass, result.results[0]);
    }

    /**
     * SQL 결과를 엔티티 배열로 변환합니다.
     */
    static toEntities<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T[] {
        if (!result?.results || result.results.length === 0) {
            return [];
        }

        return result.results.map((item) => plainToClass(entityClass, item));
    }

    /**
     * SQL 결과를 엔티티 또는 엔티티 배열로 변환합니다.
     * 결과가 없으면 undefined를 반환하고,
     * 결과가 하나면 단일 엔티티를,
     * 결과가 여러 개면 엔티티 배열을 반환합니다.
     */
    static transform<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
    ): T | T[] | undefined {
        if (!result?.results || result.results.length === 0) {
            return undefined;
        }

        if (result.results.length === 1) {
            return plainToClass(entityClass, result.results[0]);
        }

        return result.results.map((item) => plainToClass(entityClass, item));
    }

    static transformNested<T>(
        entityClass: ClassConstructor<T>,
        result: QueryResult<any> | undefined,
        relations: { [key: string]: ClassConstructor<any> },
    ): T | T[] | undefined {
        if (!result?.results || result.results.length === 0) {
            return undefined;
        }

        const transformedResults = result.results.map((row) => {
            const baseEntity = {} as any;
            const nestedEntities: { [key: string]: any } = {};

            // 기본 엔티티 속성 추출
            Object.entries(row).forEach(([key, value]) => {
                if (!key.includes("_")) {
                    baseEntity[key] = value;
                }
            });

            // 중첩된 관계 처리
            Object.entries(relations).forEach(([path, relationClass]) => {
                const pathSegments = path.split(".");
                const prefix = pathSegments[0];

                // 현재 관계에 해당하는 데이터 추출
                const relationData = {} as any;
                Object.entries(row)
                    .filter(([key]) => key.startsWith(`${prefix}_`))
                    .forEach(([key, value]) => {
                        const propertyName = key.replace(`${prefix}_`, "");
                        relationData[propertyName] = value;
                    });

                if (Object.keys(relationData).length > 0) {
                    if (!nestedEntities[prefix]) {
                        nestedEntities[prefix] = [];
                    }
                    nestedEntities[prefix].push(
                        plainToClass(relationClass, relationData),
                    );
                }
            });

            // 최종 엔티티에 중첩 관계 추가
            const finalEntity = plainToClass(entityClass, {
                ...baseEntity,
                ...nestedEntities,
            });

            return finalEntity;
        });

        return transformedResults.length === 1
            ? transformedResults[0]
            : transformedResults;
    }
}
