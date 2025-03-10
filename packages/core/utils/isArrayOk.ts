export function isArrayOk(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}
