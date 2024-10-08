import { ControllerScanner } from "@stingerloom/core/IoC/scanners/ControllerScanner";
import { ExceptionScanner } from "@stingerloom/core/IoC/scanners/ExceptionScanner";
import { InjectableScanner } from "@stingerloom/core/IoC/scanners/InjectableScanner";
import { EntityScanner } from "@stingerloom/core/orm/scanner";
export declare function createUniqueControllerKey(name: string, scanner: ControllerScanner): string;
export declare function createUniqueInjectableKey(name: string, scanner: InjectableScanner): string;
export declare function createUniqueExceptionKey(name: string, scanner: ExceptionScanner): string;
export declare function createEntityKey(name: string, scanner: EntityScanner): string;
