/// <reference types="node" />
import "dotenv/config";
export type ConfigKey = NodeJS.ProcessEnv;
/**
 * @class ConfigService
 * @description 환경변수를 가져오는 서비스 클래스입니다.
 */
declare class ConfigService<K extends Record<string, unknown> = ConfigKey> {
    /**
     * 환경 변수 값을 가져옵니다.
     * 예외 처리를 하지 않으므로, 환경 변수가 존재하지 않을 경우, undefined가 반환됩니다.
     * @param key
     * @returns
     */
    get<T extends unknown = any>(key: keyof K): T;
    /**
     * key로 시작하는 환경 변수를 전부 가져옵니다.
     */
    glob(key: keyof K): string[];
}
declare const _default: ConfigService<NodeJS.ProcessEnv>;
export default _default;
