import { ControllerScanner } from "@stingerloom/core/IoC/scanners/ControllerScanner";
import { ExceptionScanner } from "@stingerloom/core/IoC/scanners/ExceptionScanner";
import { InjectableScanner } from "@stingerloom/core/IoC/scanners/InjectableScanner";
import { EntityScanner } from "@stingerloom/core/orm/scanner";

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

export function createEntityKey(name: string, scanner: EntityScanner) {
  return `${name}_${scanner.createUniqueKey()}`;
}
