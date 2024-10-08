import { MetadataScanner, ErrorMetadata } from "./MetadataScanner";
export declare class ErrorMetadataScanner extends MetadataScanner {
    makeExceptions(): IterableIterator<ErrorMetadata>;
}
