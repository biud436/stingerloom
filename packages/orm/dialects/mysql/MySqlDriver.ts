/* eslint-disable @typescript-eslint/no-explicit-any */
import sql, { join, raw } from "sql-template-tag";
import { IConnector } from "../../types/IConnector";
import { MysqlSchemaInterface } from "./BaseSchema";
import { ColumnOption, ColumnType } from "@stingerloom/orm/decorators";
import { ColumnMetadata } from "@stingerloom/orm/scanner/ColumnScanner";
import { ISqlDriver } from "../SqlDriver";
import { Exception } from "@stingerloom/error";

export class MySqlDriver implements ISqlDriver {
    constructor(
        private readonly connector: IConnector,
        private readonly clientType: string = "mysql",
    ) {}

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
            let type = this.castType(option.type);

            // DECIMAL 타입의 경우, precision과 scale을 설정합니다.
            if (type.startsWith("DECIMAL")) {
                if (option.precision !== undefined) {
                    // 65 이상의 값은 MySQL에서 지원하지 않습니다.
                    if (option.precision > 65) {
                        throw new Exception(
                            "MySQL에서 지원하는 DECIMAL 타입의 precision은 65 이하입니다.",
                            400,
                        );
                    }
                }

                type = type.replace(
                    "$precision",
                    option.precision?.toString() || "10",
                );
                type = type.replace("$scale", option.scale?.toString() || "2");
            }

            return raw(
                `\`${column.name}\` ${type}(${option.length}) ${option.nullable ? "NULL" : "NOT NULL"} ${option.primary ? "PRIMARY KEY" : ""} ${option.autoIncrement ? "AUTO_INCREMENT" : ""}`,
            );
        });

        const result = sql`CREATE TABLE IF NOT EXISTS ${raw(tableName)} (${join(
            columnsMap,
            ",",
        )})`;

        return this.connector.query(result.text);
    }

    /**
     * TS 타입으로부터 데이터베이스 컬럼 타입을 추론합니다.
     */
    getColumnType(type: any): string {
        switch (type) {
            case String:
                return "VARCHAR";
            case Number:
                return "INT";
            case Boolean:
                return "BOOLEAN";
            case Date:
                return "DATETIME";
            case Buffer:
                return "BLOB";
            default:
                return "TEXT";
        }
    }

    /**
     * ColumnType을 데이터베이스 컬럼 타입으로 변환합니다.
     */
    castType(type: ColumnType): string {
        switch (type) {
            case "boolean":
                return "TINYINT(4)";
            case "float":
                return "FLOAT";
            case "double":
                return "DECIMAL($precision, $scale)";
            default:
                return type;
        }
    }

    private isMySqlFamily() {
        return ["mysql", "mariadb"].includes(this.clientType);
    }

    /**
     * 비관적 잠금을 위한 SQL을 반환합니다.
     */
    getForUpdateNoWait(): string {
        if (!this.isMySqlFamily()) {
            return " FOR UPDATE";
        }

        return " FOR UPDATE NOWAIT";
    }
}
