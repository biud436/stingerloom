export interface Filter<T = unknown> {
  catch: (error: unknown) => T;
}
