/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnType } from "../decorators/Column";
import { ColumnMetadata } from "../scanner/ColumnScanner";
import { MysqlSchemaInterface } from "./mysql/BaseSchema";

export interface ISqlDriver<T = any> {
    /**
     * Checks if the specified table exists in the database.
     *
     * @param name - The name of the table to check.
     * @returns A promise that resolves to a result indicating the existence of the table.
     */
    hasTable(name: string): Promise<T>;

    /**
     * Adds a primary key to the specified table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the column to set as the primary key.
     * @returns A promise that resolves when the operation is complete.
     */
    addPrimaryKey(tableName: string, columnName: string): Promise<T>;

    /**
     * Adds an auto increment constraint to the specified column in the table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the column to set as auto increment.
     * @returns A promise that resolves when the operation is complete.
     */
    addAutoIncrement(tableName: string, columnName: string): Promise<T>;

    /**
     * Removes the primary key from the specified table.
     *
     * @param tableName - The name of the table to modify.
     * @returns A promise that resolves when the operation is complete.
     */
    dropPrimaryKey(tableName: string): Promise<T>;

    /**
     * Adds a unique key to the specified column in the table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the column to set as unique.
     * @returns A promise that resolves when the operation is complete.
     */
    addUniqueKey(tableName: string, columnName: string): Promise<T>;

    /**
     * Removes the unique key from the specified column in the table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the column to remove the unique constraint from.
     * @returns A promise that resolves when the operation is complete.
     */
    dropUniqueKey(tableName: string, columnName: string): Promise<T>;

    /**
     * Adds a new column to the specified table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the new column.
     * @param columnType - The data type of the new column.
     * @returns A promise that resolves when the operation is complete.
     */
    addColumn(
        tableName: string,
        columnName: string,
        columnType: string,
    ): Promise<T>;

    /**
     * Removes a column from the specified table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the column to remove.
     * @returns A promise that resolves when the operation is complete.
     */
    dropColumn(tableName: string, columnName: string): Promise<T>;

    /**
     * Adds a foreign key constraint to the specified column in the table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the column to set as a foreign key.
     * @param foreignTableName - The name of the referenced table.
     * @param foreignColumnName - The name of the referenced column.
     * @returns A promise that resolves when the operation is complete.
     */
    addForeignKey(
        tableName: string,
        columnName: string,
        foreignTableName: string,
        foreignColumnName: string,
    ): Promise<T>;

    /**
     * Generates a name for a foreign key constraint based on the source and target tables and columns.
     *
     * @param sourceTable - The name of the source table.
     * @param targetTable - The name of the target table.
     * @param sourceColumn - The name of the source column.
     * @returns The generated foreign key name.
     */
    generateForeignKeyName(
        sourceTable: string,
        targetTable: string,
        sourceColumn: string,
    ): string;

    /**
     * Removes a foreign key constraint from the specified column in the table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the column to remove the foreign key constraint from.
     * @returns A promise that resolves when the operation is complete.
     */
    dropForeignKey(tableName: string, columnName: string): Promise<T>;

    /**
     * Adds an index to the specified column in the table.
     *
     * @param tableName - The name of the table to modify.
     * @param columnName - The name of the column to index.
     * @param indexName - The name of the index.
     * @returns A promise that resolves when the operation is complete.
     */
    addIndex(
        tableName: string,
        columnName: string,
        indexName: string,
    ): Promise<T>;

    /**
     * Checks if the specified index exists in the table.
     *
     * @param tableName - The name of the table to check.
     * @param indexName - The name of the index to check.
     * @returns A promise that resolves to a result indicating the existence of the index.
     */
    hasIndex(tableName: string, indexName: string): Promise<T>;

    /**
     * Removes an index from the specified table.
     *
     * @param tableName - The name of the table to modify.
     * @param indexName - The name of the index to remove.
     * @returns A promise that resolves when the operation is complete.
     */
    dropIndex(tableName: string, indexName: string): Promise<T>;

    /**
     * Retrieves the schema information for the specified table.
     *
     * @param tableName - The name of the table to retrieve the schema for.
     * @returns A promise that resolves to an array of schema information.
     */
    getSchemas(tableName: string): Promise<MysqlSchemaInterface[]>;

    /**
     * Retrieves the indexes for the specified table.
     *
     * @param tableName - The name of the table to retrieve the indexes for.
     * @returns A promise that resolves to an array of index information.
     */
    getIndexes(tableName: string): Promise<MysqlSchemaInterface[]>;

    /**
     * Retrieves the foreign keys for the specified table.
     *
     * @param tableName - The name of the table to retrieve the foreign keys for.
     * @returns A promise that resolves to an array of foreign key information.
     */
    getForeignKeys(tableName: string): Promise<MysqlSchemaInterface[]>;

    /**
     * Retrieves the primary keys for the specified table.
     *
     * @param tableName - The name of the table to retrieve the primary keys for.
     * @returns A promise that resolves to an array of primary key information.
     */
    getPrimaryKeys(tableName: string): Promise<MysqlSchemaInterface[]>;

    /**
     * Creates a new table with the specified columns.
     *
     * @param tableName - The name of the new table.
     * @param columns - An array of column metadata for the new table.
     * @returns A promise that resolves when the operation is complete.
     */
    createTable(
        tableName: string,
        columns: Omit<ColumnMetadata, "target" | "type">[],
    ): Promise<T>;

    /**
     * Infers the database column type from the TypeScript type.
     *
     * @param type - The TypeScript type to infer from.
     * @returns The inferred database column type.
     */
    getColumnType(type: any): string;

    /**
     * Converts a ColumnType to a database column type.
     *
     * @param type - The ColumnType to convert.
     * @returns The corresponding database column type.
     */
    castType(type: ColumnType): string;

    /**
     * Returns the SQL statement for pessimistic locking with no wait.
     *
     * @returns The SQL statement for pessimistic locking.
     */
    getForUpdateNoWait(): string;

    /**
     * Checks if the driver is for a MySQL family database.
     *
     * @returns True if the driver is for a MySQL family database, otherwise false.
     */
    isMySqlFamily(): boolean;
}
