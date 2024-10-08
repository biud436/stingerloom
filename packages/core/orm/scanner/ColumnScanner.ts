/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MetadataScanner } from "@stingerloom/core/IoC";
import { ClazzType } from "@stingerloom/core/common/RouterMapper";
import { Service } from "typedi";
import { ColumnOption } from "../decorators/Column";

export type ColumnMetadata = {
    target: ClazzType<unknown>;
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
