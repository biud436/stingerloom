export class MySqlConnectionError extends Error {
    constructor() {
        super("데이터베이스 연결이 되어있지 않습니다.");
    }
}
