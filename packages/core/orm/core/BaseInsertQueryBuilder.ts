/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "@stingerloom/core";
import { Sql } from "sql-template-tag";

/**
 * Interface representing a builder for constructing SQL insert queries.
 */
export interface BaseInsertQueryBuilder {
  /**
   * Specifies the entity (table) into which data will be inserted.
   *
   * @param entity - The class type of the entity.
   * @returns The current instance of the query builder.
   */
  into<T>(entity: ClazzType<T>): BaseInsertQueryBuilder;

  /**
   * Specifies the data to be inserted.
   *
   * @param data - An object containing the data to be inserted, with keys matching the entity's properties.
   * @returns The current instance of the query builder.
   */
  values<T>(data: Partial<T>): BaseInsertQueryBuilder;

  /**
   * Builds the SQL insert query.
   *
   * @returns An object representing the SQL query.
   */
  build(): Sql;
}
