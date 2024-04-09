/* eslint-disable @typescript-eslint/no-explicit-any */

import { Sql } from "sql-template-tag";

type ISelectEntity<T> = T extends { [key: string]: infer R } ? R : never;

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

export interface FindQueryOption<T extends keyof ISelectEntity<T>> {
    select: T[];
}

