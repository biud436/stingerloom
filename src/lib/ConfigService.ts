import Container, { Service } from "typedi";
import "dotenv/config";

@Service()
class ConfigService {
    get<T>(key: string): T {
        console.log(process.env[key]);
        return process.env[key] as unknown as T;
    }
}

export default Container.get(ConfigService);
