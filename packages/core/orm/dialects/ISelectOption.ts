import { FindOption } from "./FindOption";

export type ISelectOption<T> =
    | (keyof T)[]
    | {
          [K in keyof T]?: boolean;
      }
    | {
          [K in keyof T]?: FindOption<T[K]>;
      };
