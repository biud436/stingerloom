/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MetadataScanner } from "@stingerloom/core/IoC/scanners/MetadataScanner";
import { ClazzType } from "@stingerloom/core/common/RouterMapper";
import { Service } from "typedi";
import { ColumnOption } from "../decorators/Column";

export type ColumnMetadata = {
    /**
     * Specifies the target class of the column.
     */
    target: ClazzType<unknown>;
    /**
     * Specifies the name of the column.
     * if not specified, the name of the column is the same as the property name.
     * the table is created using the name of the column.
     */
    name?: string;
    options?: ColumnOption;
    type: any;
    transform?: (raw: unknown) => any;
};

@Service()
export class ColumnScanner extends MetadataScanner {
    public *makeColumns(): IterableIterator<ColumnMetadata> {
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
