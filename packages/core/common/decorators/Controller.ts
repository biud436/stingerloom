/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import {
  DynamicClassWrapper,
  MetadataScanner,
} from "@stingerloom/core/IoC/scanners/MetadataScanner";
import { ControllerScanner } from "@stingerloom/core/IoC/scanners/ControllerScanner";
import { createUniqueControllerKey } from "@stingerloom/core/utils/scanner";
import { ParameterListManager } from "../ParameterListManager";
import { ReflectManager } from "../ReflectManager";
import { CONTROLLER_TOKEN } from "../RouterMapper";

export function Controller(path: string): ClassDecorator {
  return function (target: any) {
    const scanner = Container.get(ControllerScanner);
    const metadataScanner = Container.get(MetadataScanner);

    const params = ReflectManager.getParamTypes(target) || [];

    Reflect.defineMetadata(CONTROLLER_TOKEN, path, target);

    // 매개변수 주입을 위해 매개변수를 스캔합니다.
    const parameters: DynamicClassWrapper<any>[] = [];
    params.forEach((param: any, index: number) => {
      const targetName = param.name;

      ParameterListManager.invoke(targetName)?.(param, parameters);
    });

    /**
     * 컨트롤러 메타데이터를 등록합니다
     * 리플렉션의 경우, 컨트롤러 데코레이터에서 컨트롤러에 대한 메타데이터를 설정해야 합니다.
     * 이렇게 하면 컨트롤러 클래스만 전달하면 메타데이터를 리플렉션으로 가져올 수 있습니다.
     * 하지만 다음 코드는 스캐너를 통해 메타데이터를 수집하는 코드입니다.
     * 이 로직은 향후 동일 동작이 보장될 경우, 리플렉션 방식으로 변경될 수도 있습니다.
     */
    const name = createUniqueControllerKey(target.name, scanner);
    scanner.set(name, {
      path,
      target,
      routers: metadataScanner.allMetadata(),
      type: "controller",
      parameters: parameters,
    });

    metadataScanner.clear();

    return target;
  };
}
