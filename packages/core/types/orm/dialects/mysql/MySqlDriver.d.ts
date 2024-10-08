import { IConnector } from "../../core/IConnector";
import { MysqlSchemaInterface } from "./BaseSchema";
import { ColumnType } from "../../decorators";
import { ColumnMetadata } from "../../scanner/ColumnScanner";
import { ISqlDriver } from "../SqlDriver";
export declare class MySqlDriver implements ISqlDriver {
    private readonly connector;
    private readonly clientType;
    constructor(connector: IConnector, clientType?: string);
    /**
     * 테이블이 존재하는지 확인합니다.
     */
    hasTable(name: string): Promise<any>;
    /**
     * 테이블에 기본키를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addPrimaryKey(tableName: string, columnName: string): Promise<any>;
    /**
     * 테이블에 자동 증가를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addAutoIncrement(tableName: string, columnName: string): Promise<any>;
    /**
     * 테이블의 기본키를 제거합니다.
     *
     * @param tableName
     */
    dropPrimaryKey(tableName: string): Promise<any>;
    /**
     * 테이블에 유니크 키를 추가합니다.
     *
     * @param tableName
     * @param columnName
     */
    addUniqueKey(tableName: string, columnName: string): Promise<any>;
    /**
     * 테이블의 유니크 키를 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropUniqueKey(tableName: string, columnName: string): Promise<any>;
    /**
     * 테이블에 컬럼을 추가합니다.
     * @param tableName
     * @param columnName
     * @param columnType
     */
    addColumn(tableName: string, columnName: string, columnType: string): Promise<any>;
    /**
     * 테이블의 컬럼을 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropColumn(tableName: string, columnName: string): Promise<any>;
    /**
     * 외래키를 추가합니다.
     * TODO: 추후, 사용자 지정 외래키 이름을 지정할 수 있게 해야 합니다.
     *
     * @param tableName
     * @param columnName
     * @param foreignTableName
     * @param foreignColumnName
     */
    addForeignKey(tableName: string, columnName: string, foreignTableName: string, foreignColumnName: string): Promise<any>;
    /**
     * 외래키 이름을 생성합니다.
     *
     * @param sourceTable
     * @param targetTable
     * @param sourceColumn
     */
    generateForeignKeyName(sourceTable: string, targetTable: string, sourceColumn: string): string;
    /**
     * 외래키를 제거합니다.
     *
     * @param tableName
     * @param columnName
     */
    dropForeignKey(tableName: string, columnName: string): Promise<any>;
    /**
     * 인덱스를 추가합니다.
     *
     * @param tableName
     * @param columnName
     * @param indexName
     */
    addIndex(tableName: string, columnName: string, indexName: string): Promise<any>;
    hasIndex(tableName: string, indexName: string): Promise<any>;
    /**
     * 인덱스를 제거합니다.
     *
     * @param tableName
     * @param indexName
     */
    dropIndex(tableName: string, indexName: string): Promise<any>;
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
    createTable(tableName: string, columns: Omit<ColumnMetadata, "target" | "type">[]): Promise<any>;
    /**
     * 백틱으로 감싸지 않은 컬럼 이름을 백틱으로 감싸서 반환합니다.
     */
    wrap(columnName: string): string;
    /**
     * TS 타입으로부터 데이터베이스 컬럼 타입을 추론합니다.
     */
    getColumnType(type: any): string;
    /**
     * ColumnType을 데이터베이스 컬럼 타입으로 변환합니다.
     */
    castType(type: ColumnType): string;
    isMySqlFamily(): boolean;
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
    getForUpdateNoWait(): string;
}
