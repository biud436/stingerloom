import { InstanceScanner } from "@stingerloom/IoC";
import { ClazzType, Injectable, ReflectManager } from "@stingerloom/common";
import Container from "typedi";

/**
 * @class DiscoveryService
 * @description
 * 컨테이너에 저장된 인스턴스를 취득하는 서비스입니다.
 */
@Injectable()
export class DiscoveryService {
    /**
     * 컨테이너에 싱글턴 인스턴스가 저장되어있으면 취득합니다.
     *
     * @param key
     * @returns
     */
    async getInstance<T = unknown>(key: ClazzType<T>) {
        const scanner = Container.get(InstanceScanner);

        return scanner.get(key);
    }

    /**
     * 객체가 컨트롤러인지 확인합니다.
     *
     * @param target
     * @returns
     */
    isController(target: object) {
        return ReflectManager.isController(target);
    }

    /**
     * 객체가 Injectable인지 확인합니다.
     *
     * @param target
     * @returns
     */
    isInjectable(target: object) {
        return ReflectManager.isInjectable(target);
    }

    /**
     * 객체가 Repository인지 확인합니다.
     * @param target
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isRepository(target: any) {
        return ReflectManager.isRepository(target);
    }
}
