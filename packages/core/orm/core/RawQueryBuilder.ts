import sql, { Sql, raw, join } from "sql-template-tag";
import { BaseRawQueryBuilder } from "./BaseRawQueryBuilder";

export type DatabaseType = "mysql" | "postgresql";
export type SubqueryType = "SELECT" | "FROM" | "WHERE" | "HAVING";

/**
 * @class RawQueryBuilder
 *
 * RawQueryBuilder에는 별칭 지정 기능과 Type Safe하게 자동 완성을 지원하는 기능이 없습니다.
 * 따라서 직접적으로 사용하기보단 타입이 지원되는 래퍼 클래스를 통해 사용하는 것이 좋습니다.
 */
export class RawQueryBuilder implements BaseRawQueryBuilder {
  private sqlQuerySegments: Sql[] = [];
  private dbType: DatabaseType = "mysql"; // 기본값
  private isSubquery: boolean = false;

  /**
   * Create a new instance of the RawQueryBuilder.
   */
  static create(): RawQueryBuilder {
    return new RawQueryBuilder();
  }

  /**
   * Creates a subquery instance of the RawQueryBuilder.
   */
  static subquery(): RawQueryBuilder {
    const builder = new RawQueryBuilder();
    builder.isSubquery = true;
    return builder;
  }

  /**
   * Sets the database type for the query.
   * @param type - The type of the database.
   * @returns The current instance of the query builder.
   */
  setDatabaseType(type: DatabaseType): RawQueryBuilder {
    this.dbType = type;
    return this;
  }

  /**
   * Specifies the columns to select in the query.
   * @param columns - An array of column names or "*" to select all columns.
   * @returns The current instance of the query builder.
   */
  select(columns: string[] | "*"): RawQueryBuilder {
    if (columns === "*") {
      this.sqlQuerySegments.push(sql`SELECT *`);
    } else {
      const columnSqls = columns.map((col) => sql`${raw(col)}`);
      this.sqlQuerySegments.push(sql`SELECT ${join(columnSqls, ", ")}`);
    }
    return this;
  }

  /**
   * Specifies the table to select from.
   * @param table - The name of the table.
   * @param alias - An optional alias for the table.
   * @returns The current instance of the query builder.
   */
  from(table: string | Sql, alias?: string): RawQueryBuilder {
    if (alias) {
      if (typeof table === "string") {
        this.sqlQuerySegments.push(sql`FROM ${raw(table)} AS ${raw(alias)}`);
      } else {
        // 서브쿼리의 경우 이미 AS가 포함되어 있으므로 별칭만 추가
        this.sqlQuerySegments.push(sql`FROM ${table} ${raw(alias)}`);
      }
    } else {
      this.sqlQuerySegments.push(
        sql`FROM ${typeof table === "string" ? raw(table) : table}`,
      );
    }
    return this;
  }

  /**
   * Adds conditions to the WHERE clause of the query.
   * @param conditions - An array of SQL conditions.
   * @returns The current instance of the query builder.
   */
  where(conditions: Sql[]): RawQueryBuilder {
    if (conditions.length === 0) {
      this.sqlQuerySegments.push(sql`WHERE 1=1`);
    } else {
      this.sqlQuerySegments.push(sql`WHERE ${join(conditions, " AND ")}`);
    }
    return this;
  }

  /**
   * Specifies the ORDER BY clause for the query.
   * @param orders - An array of objects specifying the column and direction (ASC or DESC) for ordering.
   * @returns The current instance of the query builder.
   */
  orderBy(
    orders: Array<{ column: string; direction: "ASC" | "DESC" }>,
  ): RawQueryBuilder {
    if (orders.length === 0) return this;

    const orderSqls = orders.map(
      ({ column, direction }) => sql`${raw(column)} ${raw(direction)}`,
    );
    this.sqlQuerySegments.push(sql`ORDER BY ${join(orderSqls, ", ")}`);
    return this;
  }

  /**
   * Specifies the LIMIT clause for the query.
   * @param limit - A number specifying the limit or an array specifying the offset and limit.
   * @returns The current instance of the query builder.
   */
  limit(limit: number | [number, number]): RawQueryBuilder {
    if (Array.isArray(limit)) {
      const [offset, count] = limit;
      if (this.dbType === "mysql") {
        this.sqlQuerySegments.push(sql`LIMIT ${offset}, ${count}`);
      } else {
        this.sqlQuerySegments.push(sql`LIMIT ${count} OFFSET ${offset}`);
      }
    } else {
      this.sqlQuerySegments.push(sql`LIMIT ${limit}`);
    }
    return this;
  }

  /**
   * Adds a JOIN clause to the query.
   * @param type - The type of join (INNER, LEFT, or RIGHT).
   * @param table - The name of the table to join.
   * @param alias - The alias for the joined table.
   * @param condition - The condition for the join.
   * @returns The current instance of the query builder.
   */
  join(
    type: "INNER" | "LEFT" | "RIGHT",
    table: string | Sql,
    alias: string,
    condition: Sql,
  ): RawQueryBuilder {
    if (typeof table === "string") {
      if (table.includes(` AS ${alias}`)) {
        this.sqlQuerySegments.push(
          sql`${raw(type)} JOIN ${raw(table)} ON ${condition}`,
        );
      } else {
        this.sqlQuerySegments.push(
          sql`${raw(type)} JOIN ${raw(table)} AS ${raw(alias)} ON ${condition}`,
        );
      }
    } else {
      // 서브쿼리의 경우, AS가 이미 포함되어 있는지 확인
      const tableStr = table.sql;
      if (tableStr.includes(` AS ${alias}`)) {
        this.sqlQuerySegments.push(
          sql`${raw(type)} JOIN ${table} ON ${condition}`,
        );
      } else {
        this.sqlQuerySegments.push(
          sql`${raw(type)} JOIN ${table} AS ${raw(alias)} ON ${condition}`,
        );
      }
    }
    return this;
  }

  /**
   * Specifies the GROUP BY clause for the query.
   * @param columns - An array of column names to group by.
   * @returns The current instance of the query builder.
   */
  groupBy(columns: string[]): RawQueryBuilder {
    if (columns.length === 0) return this;
    const columnSqls = columns.map((col) => sql`${raw(col)}`);
    this.sqlQuerySegments.push(sql`GROUP BY ${join(columnSqls, ", ")}`);
    return this;
  }

  /**
   * Adds conditions to the HAVING clause of the query.
   * @param conditions - An array of SQL conditions.
   * @returns The current instance of the query builder.
   */
  having(conditions: Sql[]): RawQueryBuilder {
    if (conditions.length === 0) return this;
    this.sqlQuerySegments.push(sql`HAVING ${join(conditions, " AND ")}`);
    return this;
  }

  /**
   * Appends a raw SQL fragment to the query.
   * @param sqlFragment - The SQL fragment to append.
   * @returns The current instance of the query builder.
   */
  appendSql(sqlFragment: Sql): RawQueryBuilder {
    this.sqlQuerySegments.push(sqlFragment);
    return this;
  }

  /**
   * Converts the query to a SQL object with an alias.
   * @param alias - The alias for the query.
   * @returns The SQL object representing the query with the alias.
   */
  as(alias: string): Sql {
    const query = this.build();
    return sql`(${query}) AS ${raw(alias)}`;
  }

  /**
   * Converts the query to a SQL object for use in an IN clause.
   * @returns The SQL object representing the query.
   */
  asInQuery(): Sql {
    const query = this.build();
    return sql`(${query})`;
  }

  /**
   * Converts the query to a SQL object for use in an EXISTS clause.
   * @returns The SQL object representing the query.
   */
  asExists(): Sql {
    const query = this.build();
    return sql`EXISTS (${query})`;
  }

  /**
   * Builds the final SQL object representing the query.
   * @returns The SQL object representing the query.
   */
  build(): Sql {
    return join(this.sqlQuerySegments, " ");
  }
}
