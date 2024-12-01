import { Sql } from "sql-template-tag";
import { DatabaseType } from "./RawQueryBuilder";

/**
 * Interface representing a base raw query builder.
 * Provides methods to construct SQL queries dynamically.
 */
export interface BaseRawQueryBuilder {
    /**
     * Sets the database type for the query.
     * @param type - The type of the database.
     * @returns The current instance of the query builder.
     */
    setDatabaseType(type: DatabaseType): BaseRawQueryBuilder;

    /**
     * Specifies the columns to select in the query.
     * @param columns - An array of column names or "*" to select all columns.
     * @returns The current instance of the query builder.
     */
    select(columns: string[] | "*"): BaseRawQueryBuilder;

    /**
     * Specifies the table to select from.
     * @param table - The name of the table.
     * @param alias - An optional alias for the table.
     * @returns The current instance of the query builder.
     */
    from(table: string, alias?: string): BaseRawQueryBuilder;

    /**
     * Adds conditions to the WHERE clause of the query.
     * @param conditions - An array of SQL conditions.
     * @returns The current instance of the query builder.
     */
    where(conditions: Sql[]): BaseRawQueryBuilder;

    /**
     * Specifies the ORDER BY clause for the query.
     * @param orders - An array of objects specifying the column and direction (ASC or DESC) for ordering.
     * @returns The current instance of the query builder.
     */
    orderBy(
        orders: Array<{ column: string; direction: "ASC" | "DESC" }>,
    ): BaseRawQueryBuilder;

    /**
     * Specifies the LIMIT clause for the query.
     * @param limit - A number specifying the limit or an array specifying the offset and limit.
     * @returns The current instance of the query builder.
     */
    limit(limit: number | [number, number]): BaseRawQueryBuilder;

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
        table: string,
        alias: string,
        condition: Sql,
    ): BaseRawQueryBuilder;

    /**
     * Specifies the GROUP BY clause for the query.
     * @param columns - An array of column names to group by.
     * @returns The current instance of the query builder.
     */
    groupBy(columns: string[]): BaseRawQueryBuilder;

    /**
     * Adds conditions to the HAVING clause of the query.
     * @param conditions - An array of SQL conditions.
     * @returns The current instance of the query builder.
     */
    having(conditions: Sql[]): BaseRawQueryBuilder;

    /**
     * Appends a raw SQL fragment to the query.
     * @param sqlFragment - The SQL fragment to append.
     * @returns The current instance of the query builder.
     */
    appendSql(sqlFragment: Sql): BaseRawQueryBuilder;

    /**
     * Converts the query to a SQL object with an alias.
     * @param alias - The alias for the query.
     * @returns The SQL object representing the query with the alias.
     */
    as(alias: string): Sql;

    /**
     * Converts the query to a SQL object for use in an IN clause.
     * @returns The SQL object representing the query.
     */
    asInQuery(): Sql;

    /**
     * Converts the query to a SQL object for use in an EXISTS clause.
     * @returns The SQL object representing the query.
     */
    asExists(): Sql;

    /**
     * Builds the final SQL object representing the query.
     * @returns The SQL object representing the query.
     */
    build(): Sql;
}
