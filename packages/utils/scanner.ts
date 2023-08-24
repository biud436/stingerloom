import { ControllerScanner } from "../IoC/scanners/ControllerScanner";
import { ExceptionScanner } from "../IoC/scanners/ExceptionScanner";
import { InjectableScanner } from "../IoC/scanners/InjectableScanner";

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
