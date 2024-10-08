import { MetadataScanner, ContainerMetadata } from "./MetadataScanner";
export declare class ControllerScanner extends MetadataScanner {
    makeControllers(): IterableIterator<ContainerMetadata>;
}
