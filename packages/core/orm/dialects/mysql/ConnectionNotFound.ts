export class ConnectionNotFound extends Error {
  constructor() {
    super("connection이 존재하지 않습니다.");
  }
}
