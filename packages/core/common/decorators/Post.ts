/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import {
  Metadata,
  MetadataScanner,
} from "@stingerloom/core/IoC/scanners/MetadataScanner";
import { getMethodParameters } from "@stingerloom/core/utils/extractor";
import { HttpRouterParameter } from "../HttpRouterParameter";
import { PATH } from "./PathToken";

export function Post(path = ""): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const parameters: HttpRouterParameter[] = getMethodParameters(
      target,
      propertyKey as string,
    );

    Reflect.defineMetadata(PATH, path, descriptor.value);

    const scanner = Container.get(MetadataScanner);
    const uniqueKey = scanner.createUniqueKey();
    scanner.set<Metadata>(uniqueKey, {
      path,
      method: "POST",
      target,
      router: descriptor.value,
      parameters,
    });
  };
}
