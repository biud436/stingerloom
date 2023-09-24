import { Logger } from "@stingerloom/common";
import { DataSource, DataSourceOptions, EntityManager } from "typeorm";

/**
 * @class DataSourceFactory
 */
export class DataSourceProxy {
    private readonly logger: Logger = new Logger(DataSourceProxy.name);

    constructor(private readonly options: DataSourceOptions) {}

    /**
     * 데이터베이스 연결을 생성합니다.
     */
    public create() {
        const dataSource = new DataSource(this.options);

        return new Proxy(dataSource, {
            get: (target, prop, receiver) => {
                if (prop === "manager") {
                    const manager = Reflect.get(target, "manager", receiver);

                    if (manager instanceof EntityManager) {
                        return this.createEntityManagerProxy(manager);
                    }

                    this.logger.debug("[manager]에 접근했습니다.");

                    return manager;
                }

                return Reflect.get(target, prop, receiver);
            },
        });
    }

    private createEntityManagerProxy(manager: EntityManager) {
        return new Proxy(manager, {
            get: (target, prop, receiver) => {
                this.logger.debug("[EntityManager]에 접근했습니다.");

                return Reflect.get(target, prop, receiver);
            },
        });
    }
}
