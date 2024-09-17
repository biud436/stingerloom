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
     * TODO: 추후, 사용자 지정 외래키 이름을 지정할 수 있게 해야 합니다.
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
        // 외래키 이름을 프레임워크 규칙에 맞게 생성합니다.
        // 별도의 키 이름이 지정될 수도 있습니다. 이 경우, 사용자가 지정한 이름을 사용해야 합니다.
        const foreignKeyName = this.generateForeignKeyName(
            tableName,
            foreignTableName,
            columnName,
        );

        // 추후 ON DELETE 와 ON UPDATE 옵션을 지정할 수 있게 해야 합니다.
        // 현재는 NO ACTION으로 설정되어 있습니다.
        return this.connector.query(
            `ALTER TABLE ${tableName} ADD CONSTRAINT ${foreignKeyName} FOREIGN KEY (${columnName}) REFERENCES ${foreignTableName}(${foreignColumnName}) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    /**
     * 외래키 이름을 생성합니다.
     *
     * @param sourceTable
     * @param targetTable
     * @param sourceColumn
     */
    generateForeignKeyName(
        sourceTable: string,
        targetTable: string,
        sourceColumn: string,
    ): string {
        return `fk_${sourceTable}_${targetTable}_${sourceColumn}`;
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

            // BOOLEAN 타입의 길이를 설정합니다.
            // 길이가 설정되어 있지 않다면 기본값은 1입니다.
            if (option.type === "boolean") {
                type = type.replace("$n", option.length?.toString() ?? "1");
            }

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
                return "TINYINT($n)";
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
     *
     * Locking Reads - https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html
     *
     * ## InnoDB 잠금 읽기
     *
     * InnoDB에서는 SELECT 문을 사용해 읽을 때, 여러 종류의 잠금을 설정할 수 있습니다. 기본적으로 SELECT 문은 공유 잠금을 얻지 않고 데이터에 접근하지만, 특정 상황에서는 잠금을 명시적으로 설정하는 것이 필요합니다. 이를 통해 트랜잭션이 안전하게 데이터를 읽고 수정할 수 있습니다. InnoDB의 잠금 읽기에는 다음과 같은 주요 유형이 있습니다.
     *
     * 1. SELECT ... FOR UPDATE
     * 이 구문은 데이터를 읽으면서 해당 행에 대해 배타적 잠금을 설정합니다. 다른 트랜잭션이 이 행을 수정하거나 삭제하는 것을 방지하기 위해 사용됩니다. FOR UPDATE는 일반적으로 UPDATE, DELETE 문과 함께 사용되며, 해당 트랜잭션이 완료될 때까지 다른 트랜잭션은 해당 행을 변경할 수 없습니다.
     *
     * 예시:
     *
     * ```sql
     * SELECT * FROM employees WHERE employee_id = 1 FOR UPDATE;
     * ```
     *
     * 이 구문은 트랜잭션이 종료될 때까지 다른 트랜잭션이 해당 행을 수정하거나 삭제하지 못하게 보장합니다.
     *
     * 2. SELECT ... LOCK IN SHARE MODE
     * 이 구문은 행에 대해 공유 잠금을 설정하여 다른 트랜잭션이 해당 행을 수정하거나 삭제하는 것을 방지합니다. 다만 다른 트랜잭션이 동일한 행에 대해 공유 잠금을 획득하고 읽는 것은 가능합니다. 공유 잠금은 주로 참조 무결성을 보장할 때 사용됩니다.
     *
     * 예시:
     *
     * ```sql
     * SELECT * FROM employees WHERE employee_id = 1 LOCK IN SHARE MODE;
     * ```
     *
     * 이 구문은 다른 트랜잭션이 공유 잠금을 통해 데이터를 읽을 수 있게 하되, 해당 행에 대한 수정이나 삭제는 불가능하게 만듭니다.
     * 차이점 정리
     * FOR UPDATE: 선택한 행에 대해 배타적 잠금을 설정하여 다른 트랜잭션이 행을 수정하거나 삭제하는 것을 막음.
     * LOCK IN SHARE MODE: 선택한 행에 대해 공유 잠금을 설정하여 다른 트랜잭션이 수정하거나 삭제하는 것을 막지만, 읽기는 허용함.
     *
     * 이러한 잠금 읽기는 트랜잭션의 일관성과 무결성을 보장하기 위한 중요한 도구로 사용됩니다.
     * InnoDB는 잠금을 효율적으로 처리하여 데이터의 안전한 동시 접근을 지원합니다.
     *
     * ## NOWAIT
     * `NOWAIT`를 사용하는 잠금 읽기는 절대 행 잠금을 획득하기 위해 기다리지 않습니다. 쿼리는 즉시 실행되며, 요청된 행이 잠긴 경우 오류와 함께 실패합니다.
     *
     * ## SKIP LOCKED
     * `SKIP LOCKED`를 사용하는 잠금 읽기는 행 잠금을 획득하기 위해 절대 기다리지 않습니다. 쿼리는 즉시 실행되며, 잠긴 행을 결과 집합에서 제외합니다.
     *
     * 트랜잭션 레벨을 SERIALIZABLE로 설정하면,
     * InnoDB는 autocommit이 비활성화된 경우
     * 모든 일반 SELECT 문을 암시적으로 `SELECT ... FOR SHARE`로 변환합니다 (공유 잠금, 읽기 전용에서는 유용)
     * SELECT ... FOR SHARE는 주로 트랜잭션 처리 시 데이터 무결성을 보장하기 위해 사용됩니다.
     * 트랜잭션이 완료되기 전까지 다른 트랜잭션이 동일한 행을 변경하지 못하게 보장하는 역할을 합니다.
     *
     * 만약 autocommit이 활성화되어 있으면, SELECT는 자체 트랜잭션으로 간주됩니다.
     *
     */
    getForUpdateNoWait(): string {
        /**
        FOR SHARE:
        주로 데이터를 참조하거나 조회하는 작업에서 사용됩니다.
        데이터를 읽는 동안 그 행이 다른 트랜잭션에 의해 수정되거나 삭제되지 않도록 보호합니다.
        데이터 수정이 필요하지 않은 상황에서 데이터를 안전하게 읽기 위해 사용됩니다.

        FOR UPDATE:
        데이터를 수정하려고 할 때 사용됩니다.
        FOR UPDATE는 데이터를 읽은 후, 그 데이터를 다른 트랜잭션에서 수정하거나 삭제하지 못하게 막아줍니다. 
        이후, UPDATE나 DELETE 작업을 안전하게 수행할 수 있도록 해줍니다.
        다른 트랜잭션이 데이터를 수정하려 할 때 충돌을 방지하기 위한 방법입니다.

        FOR SHARE: 행을 읽으면서 수정 또는 삭제가 불가능하게 막지만, 다른 트랜잭션에서 해당 행을 읽는 것은 허용.
        FOR UPDATE: 행을 읽은 후 해당 행에 대해 수정할 의도가 있을 때 사용하며, 다른 트랜잭션에서 읽기 및 수정 모두 차단.
        * */

        if (!this.isMySqlFamily()) {
            return " FOR UPDATE";
        }

        return " FOR UPDATE NOWAIT";
    }
}
