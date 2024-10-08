import { ISelectOption } from "./ISelectOption";
import { IOrderBy } from "./IOrderBy";
export type FindOption<T> = {
    select?: ISelectOption<T>;
    where?: {
        [K in keyof T]?: T[K];
    };
    limit?: [number, number] | number;
    take?: number;
    orderBy?: IOrderBy<Partial<T>>;
    groupBy?: (keyof T)[];
    relations?: (keyof T)[];
};
