import { ControllerScanner } from "../lib/IoC/scanners/ControllerScanner";
import { ExceptionScanner } from "../lib/IoC/scanners/ExceptionScanner";

export function createUniqueControllerKey(
    name: string,
    scanner: ControllerScanner,
) {
    return `${name}_${scanner.createUniqueKey()}`;
}

export function createUniqueExceptionKey(
    name: string,
    scanner: ExceptionScanner,
) {
    return `${name}_${scanner.createUniqueKey()}`;
}
