export class PoolNotFound extends Error {
  constructor() {
    super("Pool does not exist.");
  }
}
