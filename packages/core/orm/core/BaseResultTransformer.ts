/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassConstructor } from "class-transformer";
import type { QueryResult } from "orm/types";

export interface BaseResultTransformer {
  /**
   * SQL 결과를 단일 엔티티로 변환합니다.
   */
  toEntity<T>(
    entityClass: ClassConstructor<T>,
    result: QueryResult<any> | undefined,
  ): T | undefined;
  /**
   * SQL 결과를 엔티티 배열로 변환합니다.
   */
  toEntities<T>(
    entityClass: ClassConstructor<T>,
    result: QueryResult<any> | undefined,
  ): T[];
  /**
   * SQL 결과를 엔티티 또는 엔티티 배열로 변환합니다.
   * 결과가 없으면 undefined를 반환하고,
   * 결과가 하나면 단일 엔티티를,
   * 결과가 여러 개면 엔티티 배열을 반환합니다.
   */
  transform<T>(
    entityClass: ClassConstructor<T>,
    result: QueryResult<any> | undefined,
  ): T | T[] | undefined;
  /**
   * SQL 결과를 엔티티 또는 엔티티 배열로 변환합니다.
   */
  transformNested<T>(
    entityClass: ClassConstructor<T>,
    result: QueryResult<any> | undefined,
    relations: { [key: string]: ClassConstructor<any> },
  ): T | T[] | undefined;
}
