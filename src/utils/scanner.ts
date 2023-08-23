import { ControllerScanner } from "../lib/IoC/scanners/ControllerScanner";
import { ExceptionScanner } from "../lib/IoC/scanners/ExceptionScanner";
import { InjectableScanner } from "../lib/IoC/scanners/InjectableScanner";

export function createUniqueControllerKey(
    name: string,
    scanner: ControllerScanner,
) {
    return `${name}_${scanner.createUniqueKey()}`;
}

export function createUniqueInjectableKey(
    name: string,
    scanner: InjectableScanner,
) {
    return `${name}_${scanner.createUniqueKey()}`;
}

export function createUniqueExceptionKey(
    name: string,
    scanner: ExceptionScanner,
) {
    return `${name}_${scanner.createUniqueKey()}`;
}
