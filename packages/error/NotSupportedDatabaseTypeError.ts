import { Exception } from "./Exception";

export class NotSupportedDatabaseTypeError extends Exception {
    constructor() {
        super("지원하지 않는 데이터베이스 타입입니다.", 500);
    }
}
