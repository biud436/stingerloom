/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnType } from "../decorators/Column";
import { ColumnMetadata } from "../scanner/ColumnScanner";
import { MysqlSchemaInterface } from "./mysql/BaseSchema";

export interface ISqlDriver<T = any> {
    /**
     * 테이블이 존재하는지 확인합니다.
     */
    hasTable(name: string): Promise<T>;

    /**
     * 테이블에 기본키를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addPrimaryKey(tableName: string, columnName: string): Promise<T>;

    /**
     * 테이블에 자동 증가를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addAutoIncrement(tableName: string, columnName: string): Promise<T>;

    /**
     * 테이블의 기본키를 제거합니다.
     *
     * @param tableName
     */
    dropPrimaryKey(tableName: string): Promise<T>;

    /**
     * 테이블에 유니크 키를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addUniqueKey(tableName: string, columnName: string): Promise<T>;

    /**
     * 테이블의 유니크 키를 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropUniqueKey(tableName: string, columnName: string): Promise<T>;

    /**
     * 테이블에 컬럼을 추가합니다.
     *
     * @param tableName
     * @param columnName
     * @param columnType
     */
    addColumn(
        tableName: string,
        columnName: string,
        columnType: string,
    ): Promise<T>;

    /**
     * 테이블의 컬럼을 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropColumn(tableName: string, columnName: string): Promise<T>;

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
    ): Promise<T>;

    generateForeignKeyName(
        sourceTable: string,
        targetTable: string,
        sourceColumn: string,
    ): string;

    /**
     * 외래키를 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropForeignKey(tableName: string, columnName: string): Promise<T>;

    /**
     * 인덱스를 추가합니다.
     *
     * @param tableName
     * @param columnName
     * @param indexName
     */
    addIndex(
        tableName: string,
        columnName: string,
        indexName: string,
    ): Promise<T>;

    hasIndex(tableName: string, indexName: string): Promise<T>;

    /**
     * 인덱스를 제거합니다.
     *
     * @param tableName
     * @param indexName
     */
    dropIndex(tableName: string, indexName: string): Promise<T>;

    /**
     * 스키마를 가져옵니다.
     *
     * @param tableName
     */
    getSchemas(tableName: string): Promise<MysqlSchemaInterface[]>;

    /**
     * 인덱스를 가져옵니다.
     *
     * @param tableName
     */
    getIndexes(tableName: string): Promise<MysqlSchemaInterface[]>;

    /**
     * 외래키를 가져옵니다.
     *
     * @param tableName
     */
    getForeignKeys(tableName: string): Promise<MysqlSchemaInterface[]>;

    /**
     * 기본키를 가져옵니다.
     *
     * @param tableName
     */
    getPrimaryKeys(tableName: string): Promise<MysqlSchemaInterface[]>;

    /**
     * 테이블을 생성합니다.
     *
     * @param tableName
     * @param columns
     */
    createTable(
        tableName: string,
        columns: Omit<ColumnMetadata, "target" | "type">[],
    ): Promise<T>;

    /**
     * TS 타입으로부터 데이터베이스 컬럼 타입을 추론합니다.
     */
    getColumnType(type: any): string;

    /**
     * ColumnType을 데이터베이스 컬럼 타입으로 변환합니다.
     */
    castType(type: ColumnType): string;

    /**
     * 비관적 잠금을 위한 SQL을 반환합니다.
     */
    getForUpdateNoWait(): string;
}
