import { Service } from "typedi";
import { MetadataScanner, InjectableMetadata } from "./MetadataScanner";

@Service()
export class InjectableScanner extends MetadataScanner {
  public *makeInjectables(): IterableIterator<InjectableMetadata> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, value] of this.mapper) {
      yield value;
    }
  }
}
