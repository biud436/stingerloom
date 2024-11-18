/* eslint-disable @typescript-eslint/no-explicit-any */
export type TableSchema = Record<string, Record<string, any>>;

// 컬럼 경로를 생성하는 타입을 별도로 정의
export type ColumnPaths<Schema extends TableSchema, T extends keyof Schema> = {
    [K in keyof Schema[T]]: `${T & string}.${K & string}`;
}[keyof Schema[T]];
