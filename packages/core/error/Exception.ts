export class Exception extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
