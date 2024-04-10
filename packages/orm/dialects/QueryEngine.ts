/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sql } from "sql-template-tag";

type ISelectEntity<T> = T extends { [key: string]: infer R } ? R : never;
type IOrderBy<T> = {
    [K in keyof T]: "ASC" | "DESC";
};
type ISelectOption<T> =
    | (keyof T)[]
    | {
          [K in keyof T]?: boolean;
      }
    | {
          [K in keyof T]?: FindOption<T[K]>;
      };

export abstract class ISelectEngine<T> {
    abstract select<R>(
        entityColumns: (keyof ISelectEntity<R>)[],
    ): ISelectEngine<T>;
}

export interface ITxEngine {
    startTransaction(): Promise<void>;
    rollback(): Promise<void>;
    commit(): Promise<void>;

    savepoint(name: string): Promise<void>;
    rollbackTo(name: string): Promise<void>;
}

export abstract class IQueryEngine<T>
    extends ISelectEngine<T>
    implements ITxEngine
{
    abstract connect(): Promise<void>;

    abstract query(sql: string): Promise<any>;
    abstract query<T = any>(sql: Sql): Promise<T>;

    abstract startTransaction(): Promise<void>;
    abstract rollback(): Promise<void>;
    abstract commit(): Promise<void>;

    abstract savepoint(name: string): Promise<void>;
    abstract rollbackTo(name: string): Promise<void>;

    abstract close(): Promise<void>;
}

export type FindOption<T> = {
    select: ISelectOption<T>;
    where: {
        [K in keyof T]?: T[K];
    };
    limit: number;
    take: number;
    orderBy: IOrderBy<Partial<T>>;
    groupBy: (keyof T)[];
};
