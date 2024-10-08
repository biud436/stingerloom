import { DynamicClassWrapper } from "@stingerloom/core/IoC/scanners/MetadataScanner";
export declare const EXCEPTION_FILTER_METADATA = "EXCEPTION_FILTER_METADATA";
export declare function ExceptionFilter<T extends Error = Error>(errorClazz: DynamicClassWrapper<T>): ClassDecorator;
