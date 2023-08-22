import { ControllerScanner } from "../lib/scanner/ControllerScanner";
import { ExceptionScanner } from "../lib/scanner/ExceptionScanner";

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
