import { RawQueryBuilder } from "./RawQueryBuilder";

/**
 * RawQueryBuilder 인스턴스를 생성하는 팩토리 클래스입니다.
 *
 * MySQLRawQueryBuilderFactory,
 * PostgreSQLRawQueryBuilderFactory,
 * SQLiteRawQueryBuilderFactory,
 *
 * 등으로 구체적인 데이터베이스에 맞는 RawQueryBuilder를 생성할 수 있습니다.
 */
export class RawQueryBuilderFactory {
    static create() {
        return RawQueryBuilder.create();
    }

    static subquery() {
        return RawQueryBuilder.subquery();
    }
}
