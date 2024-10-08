import { MetadataScanner, InjectableMetadata } from "./MetadataScanner";
export declare class InjectableScanner extends MetadataScanner {
    makeInjectables(): IterableIterator<InjectableMetadata>;
}
