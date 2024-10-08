import { ClazzType } from "../../common/RouterMapper";
/**
 * 공유 인스턴스를 보관하기 위한 스캐너 클래스입니다.
 *
 * @class InstanceScanner
 */
export declare class InstanceScanner {
    protected mapper: WeakMap<ClazzType<any>, any>;
    /**
     * 인스턴스를 등록합니다.
     *
     * @param key
     * @param value
     */
    set<T>(key: ClazzType<any>, value: T): void;
    /**
     * 인스턴스를 가져옵니다.
     *
     *
     * @param key
     * @returns
     */
    get<T>(key: ClazzType<any>): T;
    /**
     * 인스턴스가 존재하는지 확인합니다.
     *
     * @param key
     * @returns
     */
    has(key: ClazzType<any>): boolean;
    /**
     * 인스턴스를 제거합니다.
     *
     * @param key
     * @returns
     */
    delete(key: ClazzType<any>): boolean;
    /**
     * 미리 생성된 인스턴스가 없을 경우, 인스턴스를 새로 생성하고 컨테이너에 등록합니다.
     *
     * @param key
     * @returns
     */
    wrap<T>(key: ClazzType<any>): T;
}
