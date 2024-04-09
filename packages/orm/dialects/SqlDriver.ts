/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnMetadata } from "../scanner/ColumnScanner";
import { MysqlSchemaInterface } from "./mysql/BaseSchema";

export interface ISqlDriver<T = any> {
    hasCollection(name: string): Promise<T>;
    addPrimaryKey(tableName: string, columnName: string): Promise<T>;
    addAutoIncrement(tableName: string, columnName: string): Promise<T>;
    dropPrimaryKey(tableName: string): Promise<T>;
    addUniqueKey(tableName: string, columnName: string): Promise<T>;
    dropUniqueKey(tableName: string, columnName: string): Promise<T>;
    addColumn(
        tableName: string,
        columnName: string,
        columnType: string,
    ): Promise<T>;
    dropColumn(tableName: string, columnName: string): Promise<T>;
    addForeignKey(
        tableName: string,
        columnName: string,
        foreignTableName: string,
        foreignColumnName: string,
    ): Promise<T>;
    dropForeignKey(tableName: string, columnName: string): Promise<T>;
    addIndex(tableName: string, columnName: string): Promise<T>;
    dropIndex(tableName: string, columnName: string): Promise<T>;
    getSchemas(tableName: string): Promise<MysqlSchemaInterface[]>;
    getIndexes(tableName: string): Promise<MysqlSchemaInterface[]>;
    getForeignKeys(tableName: string): Promise<MysqlSchemaInterface[]>;
    getPrimaryKeys(tableName: string): Promise<MysqlSchemaInterface[]>;
    createCollection(
        tableName: string,
        columns: Omit<ColumnMetadata, "target" | "type">[],
    ): Promise<T>;
}
