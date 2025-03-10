import { Exception } from "./Exception";

export class DatabaseConnectionFailedError extends Exception {
  constructor() {
    super("데이터베이스 연결에 실패했습니다.", 500);
  }
}
