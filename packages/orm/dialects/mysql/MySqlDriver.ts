import sql, { join, raw } from "sql-template-tag";
import { IConnector } from "../../types/IConnector";
import { MysqlSchemaInterface } from "./BaseSchema";
import { ColumnOption } from "@stingerloom/orm/decorators";
import { ColumnMetadata } from "@stingerloom/orm/scanner/ColumnScanner";
import { ISqlDriver } from "../SqlDriver";

export class MySqlDriver implements ISqlDriver {
    constructor(private readonly connector: IConnector) {}

    /**
     * 테이블이 존재하는지 확인합니다.
     */
    hasTable(name: string) {
        return this.connector.query(sql`SHOW TABLES LIKE ${name}`);
    }

    /**
     * 테이블에 기본키를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addPrimaryKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD PRIMARY KEY (${columnName})`,
        );
    }

    /**
     * 테이블에 자동 증가를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addAutoIncrement(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} MODIFY ${columnName} INT AUTO_INCREMENT`,
        );
    }

    /**
     * 테이블의 기본키를 제거합니다.
     *
     * @param tableName
     */
    dropPrimaryKey(tableName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP PRIMARY KEY`,
        );
    }

    /**
     * 테이블에 유니크 키를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addUniqueKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD UNIQUE (${columnName})`,
        );
    }

    /**
     * 테이블의 유니크 키를 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropUniqueKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP INDEX ${columnName}`,
        );
    }

    /**
     * 테이블에 컬럼을 추가합니다.
     * @param tableName
     * @param columnName
     * @param columnType
     */
    addColumn(tableName: string, columnName: string, columnType: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD ${columnName} ${columnType}`,
        );
    }

    /**
     * 테이블의 컬럼을 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropColumn(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`,
        );
    }

    /**
     * 외래키를 추가합니다.
     *
     * @param tableName
     * @param columnName
     * @param foreignTableName
     * @param foreignColumnName
     */
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

    /**
     * 외래키를 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropForeignKey(tableName: string, columnName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP FOREIGN KEY ${columnName}`,
        );
    }

    /**
     * 인덱스를 추가합니다.
     *
     * @param tableName
     * @param columnName
     * @param indexName
     */
    addIndex(tableName: string, columnName: string, indexName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD INDEX ${indexName} (${columnName})`,
        );
    }

    hasIndex(tableName: string, indexName: string) {
        return this.connector.query(
            `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_NAME = ${tableName} AND INDEX_NAME = ${indexName}`,
        );
    }

    /**
     * 인덱스를 제거합니다.
     *
     * @param tableName
     * @param indexName
     */
    dropIndex(tableName: string, indexName: string) {
        return this.connector.query(
            `ALTER TABLE ${tableName} DROP INDEX ${indexName}`,
        );
    }

    /**
     * 스키마를 가져옵니다.
     *
     * @param tableName
     */
    getSchemas(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(`SHOW COLUMNS FROM ${tableName}`);
    }

    /**
     * 인덱스를 가져옵니다.
     *
     * @param tableName
     */
    getIndexes(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(`SHOW INDEXES FROM ${tableName}`);
    }

    /**
     * 외래키를 가져옵니다.
     *
     * @param tableName
     */
    getForeignKeys(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(
            `SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = ${tableName}`,
        );
    }

    /**
     * 기본키를 가져옵니다.
     *
     * @param tableName
     */
    getPrimaryKeys(tableName: string): Promise<MysqlSchemaInterface[]> {
        return this.connector.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = ${tableName} AND CONSTRAINT_NAME = 'PRIMARY'`,
        );
    }

    /**
     * 테이블을 생성합니다.
     *
     * @param tableName
     * @param columns
     */
    createTable(
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
