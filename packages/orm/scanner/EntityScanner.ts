/* eslint-disable @typescript-eslint/no-unused-vars */
import { MetadataScanner } from "@stingerloom/IoC";
import { Service } from "typedi";

export type EntityMetadata = {
    name?: string;
};

@Service()
export class EntityScanner extends MetadataScanner {
    public *makeEntities(): IterableIterator<EntityMetadata> {
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
