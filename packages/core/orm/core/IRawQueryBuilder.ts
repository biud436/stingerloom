import { Sql } from "sql-template-tag";
import { DatabaseType } from "./RawQueryBuilder";

export interface IRawQueryBuilder {
    setDatabaseType(type: DatabaseType): IRawQueryBuilder;
    select(columns: string[] | "*"): IRawQueryBuilder;
    from(table: string, alias?: string): IRawQueryBuilder;
    where(conditions: Sql[]): IRawQueryBuilder;
    orderBy(
        orders: Array<{ column: string; direction: "ASC" | "DESC" }>,
    ): IRawQueryBuilder;
    limit(limit: number | [number, number]): IRawQueryBuilder;
    join(
        type: "INNER" | "LEFT" | "RIGHT",
        table: string,
        alias: string,
        condition: Sql,
    ): IRawQueryBuilder;
    groupBy(columns: string[]): IRawQueryBuilder;
    having(conditions: Sql[]): IRawQueryBuilder;
    appendSql(sqlFragment: Sql): IRawQueryBuilder;

    as(alias: string): Sql;
    asInQuery(): Sql;
    asExists(): Sql;

    build(): Sql;
}
