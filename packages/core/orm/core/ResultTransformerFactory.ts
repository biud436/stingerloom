import { ResultTransformer } from "./ResultTransformer";

/**
 * ResultTransformer 인스턴스를 생성하는 기본 팩토리 클래스입니다.
 *
 * 특정 데이터베이스에서 사용할 ResultTransformer를 생성할 때 사용합니다.
 *
 * 예를 들면, SQLite에서 사용할 ResultTransformer를 생성하려면 다음과 같이 할 수도 있습니다.
 *
 * ```ts
 * class SQLiteResultTransformer extends ResultTransformer {
 *   // SQLite 전용 ResultTransformer 구현
 * }
 *
 * class SQLiteResultTransformerFactory extends ResultTransformerFactory {
 *    static create() {
 *       return new SQLiteResultTransformer();
 *    }
 * }
 *
 * // SQLite 전용 ResultTransformer를 생성합니다.
 * SQLiteResultTransformerFactory.create();
 * ```
 */
export class ResultTransformerFactory {
    static create() {
        return new ResultTransformer();
    }
}
