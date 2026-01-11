export class MySqlConnectionError extends Error {
  constructor() {
    super("Database connection is not established.");
  }
}
