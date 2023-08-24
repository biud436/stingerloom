/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "typedi";
import { MetadataScanner, ContainerMetadata } from "./MetadataScanner";

@Service()
export class ControllerScanner extends MetadataScanner {
    public *makeControllers(): IterableIterator<ContainerMetadata> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
