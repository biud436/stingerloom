/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "typedi";
import { ClazzType } from "@stingerloom/common/RouterMapper";
import { ReflectManager } from "@stingerloom/common";

/**
 * 공유 인스턴스를 보관하기 위한 스캐너 클래스입니다.
 *
 * @class InstanceScanner
 */
@Service()
export class InstanceScanner {
    protected mapper: WeakMap<ClazzType<any>, any> = new Map();

    /**
     * 인스턴스를 등록합니다.
     *
     * @param key
     * @param value
     */
    public set<T>(key: ClazzType<any>, value: T): void {
        this.mapper.set(key, value);
    }

    /**
     * 인스턴스를 가져옵니다.
     *
     *
     * @param key
     * @returns
     */
    public get<T>(key: ClazzType<any>): T {
        return this.mapper.get(key);
    }

    /**
     * 인스턴스가 존재하는지 확인합니다.
     *
     * @param key
     * @returns
     */
    public has(key: ClazzType<any>): boolean {
        return this.mapper.has(key);
    }

    /**
     * 인스턴스를 제거합니다.
     *
     * @param key
     * @returns
     */
    public delete(key: ClazzType<any>): boolean {
        return this.mapper.delete(key);
    }

    /**
     * 미리 생성된 인스턴스가 없을 경우, 인스턴스를 새로 생성하고 컨테이너에 등록합니다.
     *
     * @param key
     * @returns
     */
    public wrap<T>(key: ClazzType<any>): T {
        if (!this.has(key)) {
            if (!ReflectManager.isInjectable(key.prototype)) {
                const value = new key();
                this.set(key, value);
            }
        }

        return this.get(key);
    }
}
