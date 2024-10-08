import { MetadataScanner, ExceptionMetadata } from "./MetadataScanner";
export declare class ExceptionScanner extends MetadataScanner {
    makeExceptions(): IterableIterator<ExceptionMetadata>;
}
