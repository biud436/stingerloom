/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReflectManager } from "@stingerloom/common";
import { ColumnMetadata } from "../scanner/ColumnScanner";
import { CustomColumn } from "./CustomColumn";

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

    /**
     * 데이터베이스에서 컬럼의 값을 가져올 때, 오브젝트에 매핑되는 컬럼의 타입을 변환할 수 있는 함수입니다.
     */
    transform?: <T = any>(raw: unknown) => CustomColumn<T>;
}

export const COLUMN_TOKEN = "COLUMN";

/**
 * 컬럼 데코레이터에서는 컬럼에 대한 메타데이터를 설정합니다.
 * 메타데이터는 컬럼의 이름, 옵션, 타입을 설정합니다.
 * 자바스크립트에서 제공되는 원시 타입은 기본적으로 설정됩니다.
 *
 * 하지만 커스텀 타입을 사용할 경우, 추후 오브젝트가 매핑될 때 ColumnTypeFactory를 참고하여 타입을 가져와야 합니다.
 *
 * @param option
 * @returns
 */
export function Column(option?: ColumnOption): PropertyDecorator {
    return (target, propertyKey) => {
        const injectParam = ReflectManager.getType<any>(target, propertyKey);

        const name = option?.name || propertyKey.toString();
        const metadata = <ColumnMetadata>{
            target,
            name,
            options: option,
            type: injectParam,
            transform: option?.transform,
        };

        /**
         * primitive type이 아닌 경우, ColumnTypeFactory를 통해 타입을 가져와야 합니다.
         */

        const columns = Reflect.getMetadata(COLUMN_TOKEN, target);

        Reflect.defineMetadata(
            COLUMN_TOKEN,
            [...(columns || []), metadata],
            target,
        );
    };
}
