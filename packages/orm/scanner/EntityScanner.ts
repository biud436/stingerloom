/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { MetadataScanner } from "@stingerloom/IoC";
import { ClazzType } from "@stingerloom/common";
import { Service } from "typedi";

export type EntityMetadata = {
    target: ClazzType<any>;
    name?: string;
    columns: any[];
};

@Service()
export class EntityScanner extends MetadataScanner {
    public *makeEntities(): IterableIterator<EntityMetadata> {
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
