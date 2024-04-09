/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReflectManager } from "@stingerloom/common";
import { ColumnMetadata } from "../scanner/ColumnScanner";

export type ColumnType =
    /** Number */
    | "number"
    | "float"
    | "double"
    /** Date */
    | "timestamp"
    | "date"
    | "datetime"
    /** Buffer */
    | "blob"
    /** String */
    | "text"
    | "varchar"
    | "char"
    | "boolean"
    | "enum"
    | "json"
    | "jsonb"
    | "array"
    | "bigint"
    | "longtext";

export interface ColumnOption {
    name?: string;
    length: number;
    nullable: boolean;
    type: ColumnType;
}

export const COLUMN_TOKEN = "COLUMN";

export function Column(option?: ColumnOption): PropertyDecorator {
    return (target, propertyKey) => {
        const injectParam = ReflectManager.getType<any>(target, propertyKey);

        const name = option?.name || propertyKey.toString();
        const metadata = <ColumnMetadata>{
            target,
            name,
            options: option,
            type: injectParam,
        };

        const columns = Reflect.getMetadata(COLUMN_TOKEN, target);

        Reflect.defineMetadata(
            COLUMN_TOKEN,
            [...(columns || []), metadata],
            target,
        );
    };
}
