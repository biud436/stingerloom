import Container from "typedi";
import { ParameterAllocator } from "../ParameterListManager";
import { InstanceScanner } from "@stingerloom/IoC/scanners/InstanceScanner";
import { ReflectManager } from "../ReflectManager";

import { DataSource } from "typeorm";

/**
 * 요청하는 클래스가 이미 컨테이너에 존재할 경우 해당 인스턴스를 반환하고 존재하지 않을 경우, 새로 생성하여 반환하는 함수입니다.
 * 이를 싱글턴 패턴이라고 하는데, 이는 클래스의 인스턴스가 오직 하나만 존재하도록 하는 디자인 패턴입니다.
 * `Stingerloom`에서는 이를 클래스 단위로 관리하고 있습니다.
 *
 * @param param
 * @param parameters
 */
export const getDefaultAllocator: ParameterAllocator = (param, parameters) => {
    const TargetService = param;

    const instanceScanner = Container.get(InstanceScanner);

    if (ReflectManager.isInjectable(TargetService)) {
        parameters.push(TargetService);
    } else if (ReflectManager.isDataSource(TargetService.prototype)) {
        parameters.push(DataSource);
    } else if (TargetService) {
        parameters.push(instanceScanner.wrap(TargetService));
    }
};
