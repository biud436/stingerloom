import sql, { Sql, raw, join } from "sql-template-tag";
import { IRawQueryBuilder } from "./IRawQueryBuilder";

export type DatabaseType = "mysql" | "postgresql";
export type SubqueryType = "SELECT" | "FROM" | "WHERE" | "HAVING";

export class RawQueryBuilder implements IRawQueryBuilder {
    private fragments: Sql[] = [];
    private dbType: DatabaseType = "mysql"; // 기본값
    private isSubquery: boolean = false;

    /**
     * 빈 RawQueryBuilder 인스턴스를 생성합니다.
     */
    static create(): RawQueryBuilder {
        return new RawQueryBuilder();
    }

    /**
     * 서브쿼리를 생성합니다.
     */
    static subquery(): RawQueryBuilder {
        const builder = new RawQueryBuilder();
        builder.isSubquery = true;
        return builder;
    }

    /**
     * 데이터베이스 타입을 설정합니다.
     */
    setDatabaseType(type: DatabaseType): RawQueryBuilder {
        this.dbType = type;
        return this;
    }

    /**
     * SELECT 절을 생성합니다.
     */
    select(columns: string[] | "*"): RawQueryBuilder {
        if (columns === "*") {
            this.fragments.push(sql`SELECT *`);
        } else {
            const columnSqls = columns.map((col) => sql`${raw(col)}`);
            this.fragments.push(sql`SELECT ${join(columnSqls, ", ")}`);
        }
        return this;
    }

    /**
     * FROM 절을 생성합니다.
     */
    from(table: string | Sql, alias?: string): RawQueryBuilder {
        if (alias) {
            if (typeof table === "string") {
                this.fragments.push(sql`FROM ${raw(table)} AS ${raw(alias)}`);
            } else {
                // 서브쿼리의 경우 이미 AS가 포함되어 있으므로 별칭만 추가
                this.fragments.push(sql`FROM ${table} ${raw(alias)}`);
            }
        } else {
            this.fragments.push(
                sql`FROM ${typeof table === "string" ? raw(table) : table}`,
            );
        }
        return this;
    }

    /**
     * WHERE 조건을 추가합니다.
     */
    where(conditions: Sql[]): RawQueryBuilder {
        if (conditions.length === 0) {
            this.fragments.push(sql`WHERE 1=1`);
        } else {
            this.fragments.push(sql`WHERE ${join(conditions, " AND ")}`);
        }
        return this;
    }

    /**
     * ORDER BY 절을 생성합니다.
     */
    orderBy(
        orders: Array<{ column: string; direction: "ASC" | "DESC" }>,
    ): RawQueryBuilder {
        if (orders.length === 0) return this;

        const orderSqls = orders.map(
            ({ column, direction }) => sql`${raw(column)} ${raw(direction)}`,
        );
        this.fragments.push(sql`ORDER BY ${join(orderSqls, ", ")}`);
        return this;
    }

    /**
     * LIMIT 절을 추가합니다.
     */
    limit(limit: number | [number, number]): RawQueryBuilder {
        if (Array.isArray(limit)) {
            const [offset, count] = limit;
            if (this.dbType === "mysql") {
                this.fragments.push(sql`LIMIT ${offset}, ${count}`);
            } else {
                this.fragments.push(sql`LIMIT ${count} OFFSET ${offset}`);
            }
        } else {
            this.fragments.push(sql`LIMIT ${limit}`);
        }
        return this;
    }

    /**
     * JOIN 절을 추가합니다.
     */
    join(
        type: "INNER" | "LEFT" | "RIGHT",
        table: string | Sql,
        alias: string,
        condition: Sql,
    ): RawQueryBuilder {
        if (typeof table === "string") {
            if (table.includes(` AS ${alias}`)) {
                this.fragments.push(
                    sql`${raw(type)} JOIN ${raw(table)} ON ${condition}`,
                );
            } else {
                this.fragments.push(
                    sql`${raw(type)} JOIN ${raw(table)} AS ${raw(alias)} ON ${condition}`,
                );
            }
        } else {
            // 서브쿼리의 경우, AS가 이미 포함되어 있는지 확인
            const tableStr = table.sql;
            if (tableStr.includes(` AS ${alias}`)) {
                this.fragments.push(
                    sql`${raw(type)} JOIN ${table} ON ${condition}`,
                );
            } else {
                this.fragments.push(
                    sql`${raw(type)} JOIN ${table} AS ${raw(alias)} ON ${condition}`,
                );
            }
        }
        return this;
    }

    /**
     * GROUP BY 절을 추가합니다.
     */
    groupBy(columns: string[]): RawQueryBuilder {
        if (columns.length === 0) return this;
        const columnSqls = columns.map((col) => sql`${raw(col)}`);
        this.fragments.push(sql`GROUP BY ${join(columnSqls, ", ")}`);
        return this;
    }

    /**
     * HAVING 절을 추가합니다.
     */
    having(conditions: Sql[]): RawQueryBuilder {
        if (conditions.length === 0) return this;
        this.fragments.push(sql`HAVING ${join(conditions, " AND ")}`);
        return this;
    }

    /**
     * 임의의 SQL 조각을 추가합니다.
     */
    appendSql(sqlFragment: Sql): RawQueryBuilder {
        this.fragments.push(sqlFragment);
        return this;
    }

    /**
     * 서브쿼리를 괄호로 감싸서 반환합니다.
     */
    as(alias: string): Sql {
        const query = this.build();
        return sql`(${query}) AS ${raw(alias)}`;
    }

    /**
     * WHERE IN 절에서 사용할 수 있는 서브쿼리를 생성합니다.
     */
    asInQuery(): Sql {
        const query = this.build();
        return sql`(${query})`;
    }

    /**
     * EXISTS 절에서 사용할 수 있는 서브쿼리를 생성합니다.
     */
    asExists(): Sql {
        const query = this.build();
        return sql`EXISTS (${query})`;
    }

    /**
     * 최종 SQL을 생성합니다.
     */
    build(): Sql {
        return join(this.fragments, " ");
    }
}
