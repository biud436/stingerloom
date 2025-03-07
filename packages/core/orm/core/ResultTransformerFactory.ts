import { ResultTransformer } from "./ResultTransformer";

/**
 * ResultTransformer 인스턴스를 생성하는 기본 팩토리 클래스입니다.
 *
 * 특정 데이터베이스에서 사용할 ResultTransformer를 생성할 때 사용합니다.
 *
 * 예를 들면, SQLite에서 사용할 ResultTransformer를 생성하려면 다음과 같이 할 수도 있습니다.
 */
export class ResultTransformerFactory {
    static create() {
        return new ResultTransformer();
    }
}
