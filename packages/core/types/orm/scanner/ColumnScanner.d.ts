import { MetadataScanner } from "@stingerloom/core/IoC";
import { ClazzType } from "@stingerloom/core/common/RouterMapper";
import { ColumnOption } from "../decorators/Column";
export type ColumnMetadata = {
    target: ClazzType<unknown>;
    name?: string;
    options?: ColumnOption;
    type: any;
    transform?: (raw: unknown) => any;
};
export declare class ColumnScanner extends MetadataScanner {
    makeColumns(): IterableIterator<ColumnMetadata>;
}
