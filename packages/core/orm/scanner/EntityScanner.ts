/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MetadataScanner } from "@stingerloom/core/IoC/scanners/MetadataScanner";
import { ClazzType } from "@stingerloom/core/common";
import { Service } from "typedi";

export type EntityMetadata = {
    target: ClazzType<any>;
    name?: string;
    columns: any[];
    indexes?: any[];
};

@Service()
export class EntityScanner extends MetadataScanner {
    public *makeEntities(): IterableIterator<EntityMetadata> {
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }

    public scan(target: ClazzType<unknown>): EntityMetadata | null {
        for (const [_, value] of this.mapper) {
            if (value.target === target) {
                return value;
            }
        }

        return null;
    }
}
