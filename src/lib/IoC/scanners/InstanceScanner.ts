/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "typedi";
import { ClazzType } from "../../common/RouterMapper";

/**
 * 공유 인스턴스를 보관하기 위한 스캐너 클래스입니다.
 *
 * @class InstanceScanner
 */
@Service()
export class InstanceScanner {
    protected mapper: Map<ClazzType<any>, any> = new Map();

    public set<T>(key: ClazzType<any>, value: T): void {
        this.mapper.set(key, value);
    }

    public get<T>(key: ClazzType<any>): T {
        return this.mapper.get(key);
    }

    public has(key: ClazzType<any>): boolean {
        return this.mapper.has(key);
    }
}
