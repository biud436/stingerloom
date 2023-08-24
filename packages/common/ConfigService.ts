import Container, { Service } from "typedi";
import "dotenv/config";

/**
 * @class ConfigService
 * @description 환경변수를 가져오는 서비스 클래스입니다.
 */
@Service()
class ConfigService {
    /**
     * 환경 변수 값을 가져옵니다.
     * 예외 처리를 하지 않으므로, 환경 변수가 존재하지 않을 경우, undefined가 반환됩니다.
     * @param key
     * @returns
     */
    get<T>(key: string): T {
        return process.env[key] as unknown as T;
    }
}

export default Container.get(ConfigService);
