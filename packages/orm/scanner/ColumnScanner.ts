/* eslint-disable @typescript-eslint/no-unused-vars */
import { MetadataScanner } from "@stingerloom/IoC";
import { Service } from "typedi";

export type ColumnMetadata = {
    name?: string;
};

@Service()
export class ColumnScanner extends MetadataScanner {
    public *makeEntities(): IterableIterator<ColumnMetadata> {
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
