/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "@stingerloom/core";
import { Sql } from "sql-template-tag";

export interface BaseInsertQueryBuilder {
    into<T>(entity: ClazzType<T>): BaseInsertQueryBuilder;
    values<T>(data: Partial<T>): BaseInsertQueryBuilder;
    build(): Sql;
}
