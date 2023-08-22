import { Service } from "typedi";
import { MetadataScanner, ErrorMetadata } from "./MetadataScanner";

@Service()
export class ErrorMetadataScanner extends MetadataScanner {
    public *makeExceptions(): IterableIterator<ErrorMetadata> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [_, value] of this.mapper) {
            yield value;
        }
    }
}
