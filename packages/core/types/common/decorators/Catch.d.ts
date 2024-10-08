import { ErrorAdvice } from "@stingerloom/core/IoC/scanners/MetadataScanner";
export declare const CATCH_METADATA = "CATCH_METADATA";
export declare function Catch(advice?: ErrorAdvice): MethodDecorator;
