import Container, { Service } from "typedi";
import "dotenv/config";

export type ConfigKey = NodeJS.ProcessEnv;

/**
 * @class ConfigService
 * @description 환경변수를 가져오는 서비스 클래스입니다.
 */
@Service()
class ConfigService<K extends Record<string, unknown> = ConfigKey> {
    /**
     * 환경 변수 값을 가져옵니다.
     * 예외 처리를 하지 않으므로, 환경 변수가 존재하지 않을 경우, undefined가 반환됩니다.
     * @param key
     * @returns
     */
    get<T extends string>(key: keyof K): T {
        return process.env[key] as unknown as T;
    }

    /**
     * key로 시작하는 환경 변수를 전부 가져옵니다.
     */
    glob(key: keyof K): string[] {
        const items = process.env;

        if (!items) {
            return [];
        }

        const envFiles = Object.keys(items).filter((item) => {
            return item.startsWith(key as string);
        });

        return envFiles;
    }
}

export default Container.get(ConfigService);
