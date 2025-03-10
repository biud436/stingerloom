import { Service } from "typedi";
import { MetadataScanner, ExceptionMetadata } from "./MetadataScanner";

@Service()
export class ExceptionScanner extends MetadataScanner {
  public *makeExceptions(): IterableIterator<ExceptionMetadata> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, value] of this.mapper) {
      yield value;
    }
  }
}
