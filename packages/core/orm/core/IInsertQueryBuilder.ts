/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "@stingerloom/core";
import { Sql } from "sql-template-tag";

export interface IInsertQueryBuilder {
    into<T>(entity: ClazzType<T>): IInsertQueryBuilder;
    values<T>(data: Partial<T>): IInsertQueryBuilder;
    build(): Sql;
}
