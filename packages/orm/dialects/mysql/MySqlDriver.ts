import sql from "sql-template-tag";
import { IConnector } from "../../types/IConnector";
import { MysqlSchemaInterface } from "./BaseSchema";

export class MySqlDriver {
    constructor(private readonly connector: IConnector) {}

    hasCollection(name: string) {
        return this.connector.query(sql`SHOW TABLES LIKE ${name}`);
    }

    addPrimaryKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD PRIMARY KEY (${columnName})`,
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

    addIndex(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD INDEX (${columnName})`,
        );
    }

    dropIndex(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP INDEX ${columnName}`,
        );
    }

    getSchemas(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(`SHOW COLUMNS FROM ${tableName}`);
    }
}
