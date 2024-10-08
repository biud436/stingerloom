import { MetadataScanner } from "@stingerloom/core/IoC";
import { ClazzType } from "@stingerloom/core/common";
export type EntityMetadata = {
    target: ClazzType<any>;
    name?: string;
    columns: any[];
    indexes?: any[];
};
export declare class EntityScanner extends MetadataScanner {
    makeEntities(): IterableIterator<EntityMetadata>;
    scan(target: ClazzType<unknown>): EntityMetadata | null;
}
