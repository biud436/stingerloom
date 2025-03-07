/* eslint-disable @typescript-eslint/no-unused-vars */
import { MetadataScanner } from "@stingerloom/core/IoC";
import { Service } from "typedi";
import { ManyToOneMetadata } from "../decorators";
import { ClazzType } from "@stingerloom/core/common";

@Service()
export class ManyToOneScanner extends MetadataScanner {
    public *makeManyTones(): IterableIterator<ManyToOneMetadata<unknown>> {
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }

    public scan(target: ClazzType<unknown>): ManyToOneMetadata<unknown> | null {
        for (const [_, value] of this.mapper) {
            if (value.target === target) {
                return value;
            }
        }

        return null;
    }
}
