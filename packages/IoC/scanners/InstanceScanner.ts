/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "typedi";
import { ClazzType } from "@stingerloom/common/RouterMapper";
import { INJECTABLE_TOKEN } from "@stingerloom/common/decorators/Injectable";

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

    public wrap<T>(key: ClazzType<any>): T {
        if (!this.has(key)) {
            const service = Reflect.getMetadata(
                INJECTABLE_TOKEN,
                key.prototype,
            );

            if (!service) {
                const value = new key();
                this.set(key, value);
            } else {
                // 서비스 메타데이터가 존재하면, 해당 메타데이터를 이용하여 인스턴스를 생성합니다.
            }
        }

        return this.get(key);
    }
}
