import sql, { join, raw } from "sql-template-tag";
import { IConnector } from "../../types/IConnector";
import { MysqlSchemaInterface } from "./BaseSchema";
import { ColumnOption } from "@stingerloom/orm/decorators";
import { ColumnMetadata } from "@stingerloom/orm/scanner/ColumnScanner";
import { ISqlDriver } from "../SqlDriver";

export class MySqlDriver implements ISqlDriver {
    constructor(private readonly connector: IConnector) {}

    hasCollection(name: string) {
        return this.connector.query(sql`SHOW TABLES LIKE ${name}`);
    }

    addPrimaryKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD PRIMARY KEY (${columnName})`,
        );
    }

    addAutoIncrement(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} MODIFY ${columnName} INT AUTO_INCREMENT`,
        );
    }

    dropPrimaryKey(tableName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP PRIMARY KEY`,
        );
    }

    addUniqueKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD UNIQUE (${columnName})`,
        );
    }

    dropUniqueKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP INDEX ${columnName}`,
        );
    }

    addColumn(tableName: string, columnName: string, columnType: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD ${columnName} ${columnType}`,
        );
    }

    dropColumn(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`,
        );
    }

    addForeignKey(
        tableName: string,
        columnName: string,
        foreignTableName: string,
        foreignColumnName: string,
    ) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD FOREIGN KEY (${columnName}) REFERENCES ${foreignTableName}(${foreignColumnName})`,
        );
    }

    dropForeignKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP FOREIGN KEY ${columnName}`,
        );
    }

    addIndex(tableName: string, columnName: string, indexName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD INDEX ${indexName} (${columnName})`,
        );
    }

    dropIndex(tableName: string, indexName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP INDEX ${indexName}`,
        );
    }

    getSchemas(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(`SHOW COLUMNS FROM ${tableName}`);
    }

    getIndexes(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(`SHOW INDEXES FROM ${tableName}`);
    }

    getForeignKeys(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(
            `SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = ${tableName}`,
        );
    }

    getPrimaryKeys(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = ${tableName} AND CONSTRAINT_NAME = 'PRIMARY'`,
        );
    }

    createCollection(
        tableName: string,
        columns: Omit<ColumnMetadata, "target" | "type">[],
    ) {
        const columnsMap = columns.map((column) => {
            const option = column.options as ColumnOption;
            return raw(
                `\`${column.name}\` ${option.type}(${option.length}) ${option.nullable ? "NULL" : "NOT NULL"} ${option.primary ? "PRIMARY KEY" : ""} ${option.autoIncrement ? "AUTO_INCREMENT" : ""}`,
            );
        });

        const result = sql`CREATE TABLE IF NOT EXISTS ${raw(tableName)} (${join(
            columnsMap,
            ",",
        )})`;

        return this.connector.query(result.text);
    }
}
