export function isDeno() {
  return typeof globalThis !== "undefined" && "Deno" in globalThis;
}
