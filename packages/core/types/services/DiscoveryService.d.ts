import { ClazzType } from "../common";
/**
 * @class DiscoveryService
 * @description
 * 컨테이너에 저장된 인스턴스를 취득하는 서비스입니다.
 */
export declare class DiscoveryService {
    /**
     * 컨테이너에 싱글턴 인스턴스가 저장되어있으면 취득합니다.
     *
     * @param key
     * @returns
     */
    getInstance<T = unknown>(key: ClazzType<T>): Promise<unknown>;
    /**
     * 객체가 컨트롤러인지 확인합니다.
     *
     * @param target
     * @returns
     */
    isController(target: object): boolean;
    /**
     * 객체가 Injectable인지 확인합니다.
     *
     * @param target
     * @returns
     */
    isInjectable(target: object): boolean;
    /**
     * 객체가 Repository인지 확인합니다.
     * @param target
     * @returns
     */
    isRepository(target: any): boolean;
    /**
     * 모든 메소드를 취득합니다.
     *
     * @param target
     * @returns
     */
    getPrototypeMethods(target: any): unknown[];
}
