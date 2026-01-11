export class ConnectionNotFound extends Error {
  constructor() {
    super("Connection does not exist.");
  }
}
