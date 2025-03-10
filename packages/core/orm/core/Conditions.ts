/* eslint-disable @typescript-eslint/no-explicit-any */
import sql, { Sql, join, raw } from "sql-template-tag";

export class Conditions {
  /**
   * 컬럼이 특정 값과 같은지 확인하는 조건을 생성합니다.
   */
  static equals(column: string, value: any): Sql {
    return sql`${raw(column)} = ${value}`;
  }

  /**
   * 컬럼이 특정 값과 같지 않은지 확인하는 조건을 생성합니다.
   */
  static notEquals(column: string, value: any): Sql {
    return sql`${raw(column)} != ${value}`;
  }

  /**
   * 컬럼이 특정 값들 중 하나에 해당하는지 확인하는 조건을 생성합니다.
   */
  static in(column: string, values: any[]): Sql {
    return sql`${raw(column)} IN (${join(
      values.map((v) => sql`${v}`),
      ", ",
    )})`;
  }

  /**
   * 컬럼이 특정 값들 중 하나에 해당하지 않는지 확인하는 조건을 생성합니다.
   */
  static notIn(column: string, values: any[]): Sql {
    return sql`${raw(column)} NOT IN (${join(
      values.map((v) => sql`${v}`),
      ", ",
    )})`;
  }

  /**
   * 컬럼이 특정 패턴과 일치하는지 확인하는 조건을 생성합니다.
   */
  static like(column: string, pattern: string): Sql {
    return sql`${raw(column)} LIKE ${pattern}`;
  }

  /**
   * 컬럼이 특정 패턴과 일치하지 않는지 확인하는 조건을 생성합니다.
   */
  static notLike(column: string, pattern: string): Sql {
    return sql`${raw(column)} NOT LIKE ${pattern}`;
  }

  /**
   * 컬럼이 NULL인지 확인하는 조건을 생성합니다.
   */
  static isNull(column: string): Sql {
    return sql`${raw(column)} IS NULL`;
  }

  /**
   * 컬럼이 NULL이 아닌지 확인하는 조건을 생성합니다.
   */
  static isNotNull(column: string): Sql {
    return sql`${raw(column)} IS NOT NULL`;
  }

  /**
   * 컬럼이 특정 범위 내에 있는지 확인하는 조건을 생성합니다.
   */
  static between(column: string, start: any, end: any): Sql {
    return sql`${raw(column)} BETWEEN ${start} AND ${end}`;
  }

  /**
   * 컬럼이 특정 범위 내에 있지 않은지 확인하는 조건을 생성합니다.
   */
  static notBetween(column: string, start: any, end: any): Sql {
    return sql`${raw(column)} NOT BETWEEN ${start} AND ${end}`;
  }

  /**
   * 컬럼이 특정 값보다 큰지 확인하는 조건을 생성합니다.
   */
  static gt(column: string | Sql, value: any): Sql {
    if (typeof column === "string") {
      return sql`${raw(column)} > ${value}`;
    }
    return sql`${column} > ${value}`;
  }

  /**
   * 컬럼이 특정 값보다 크거나 같은지 확인하는 조건을 생성합니다.
   */
  static gte(column: string, value: any): Sql {
    return sql`${raw(column)} >= ${value}`;
  }

  /**
   * 컬럼이 특정 값보다 작은지 확인하는 조건을 생성합니다.
   */
  static lt(column: string | Sql, value: any): Sql {
    if (typeof column === "string") {
      return sql`${raw(column)} < ${value}`;
    }
    return sql`${column} < ${value}`;
  }

  /**
   * 컬럼이 특정 값보다 작거나 같은지 확인하는 조건을 생성합니다.
   */
  static lte(column: string, value: any): Sql {
    return sql`${raw(column)} <= ${value}`;
  }

  /**
   * 여러 조건을 OR로 결합합니다.
   */
  static or(conditions: Sql[]): Sql {
    return sql`(${join(conditions, " OR ")})`;
  }

  /**
   * 여러 조건을 AND로 결합합니다.
   */
  static and(conditions: Sql[]): Sql {
    return sql`(${join(conditions, " AND ")})`;
  }

  /**
   * 임의의 조건식을 생성합니다.
   */
  static raw(condition: string): Sql {
    return sql`${raw(condition)}`;
  }

  /**
   * 집계 함수를 생성합니다.
   */
  static aggregate(fn: string, column: string): Sql {
    return sql`${raw(fn)}(${raw(column)})`;
  }

  /**
   * 컬럼의 개수를 세는 집계 함수를 생성합니다.
   */
  static count(column: string): Sql {
    return this.aggregate("COUNT", column);
  }

  /**
   * 컬럼의 합계를 구하는 집계 함수를 생성합니다.
   */
  static sum(column: string): Sql {
    return this.aggregate("SUM", column);
  }

  /**
   * 컬럼의 평균을 구하는 집계 함수를 생성합니다.
   */
  static avg(column: string): Sql {
    return this.aggregate("AVG", column);
  }

  /**
   * IN (서브쿼리) 조건을 생성합니다.
   */
  static inSubquery(column: string, subquery: Sql): Sql {
    return sql`${raw(column)} IN ${subquery}`;
  }

  /**
   * NOT IN (서브쿼리) 조건을 생성합니다.
   */
  static notInSubquery(column: string, subquery: Sql): Sql {
    return sql`${raw(column)} NOT IN ${subquery}`;
  }

  /**
   * EXISTS 조건을 생성합니다.
   */
  static exists(subquery: Sql): Sql {
    // EXISTS 키워드가 이미 포함되어 있는지 확인
    const subquerySql = subquery.sql;
    if (subquerySql.startsWith("EXISTS (")) {
      return subquery;
    }
    return sql`EXISTS ${subquery}`;
  }

  /**
   * NOT EXISTS 조건을 생성합니다.
   */
  static notExists(subquery: Sql): Sql {
    return sql`NOT EXISTS ${subquery}`;
  }

  /**
   * 비교 연산자와 서브쿼리를 조합합니다.
   */
  static compareSubquery(column: string, operator: string, subquery: Sql): Sql {
    return sql`${raw(column)} ${raw(operator)} ${subquery}`;
  }

  /**
   * 컬럼 비교 조건을 생성합니다.
   */
  static compareColumns(
    column1: string,
    operator: string,
    column2: string,
  ): Sql {
    return sql`${raw(column1)} ${raw(operator)} ${raw(column2)}`;
  }
}
