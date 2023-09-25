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
            get: (target: DataSource, prop: string | symbol, receiver) => {
                if (prop === "manager") {
                    const manager = Reflect.get(target, "manager", receiver);

                    if (manager instanceof EntityManager) {
                        return this.createEntityManagerProxy(manager);
                    }

                    this.logger.debug("[manager]에 접근했습니다.");

                    return manager;
                }

                if (
                    prop === "createQueryRunner" &&
                    typeof target[prop] === "function"
                ) {
                    return this.createQueryRunner(dataSource, target);
                }

                return Reflect.get(target, prop, receiver);
            },
        });
    }

    /**
     * QueryRunner를 생성합니다.
     *
     * @param dataSource
     * @param target
     * @returns
     */
    private createQueryRunner(dataSource: DataSource, target: DataSource) {
        const targetMethod = target.createQueryRunner;

        return (...args: unknown[]) => {
            this.logger.debug("[createQueryRunner]에 접근했습니다.");
            const originalQueryRunner = targetMethod.apply(
                dataSource,
                args as [],
            );

            return originalQueryRunner;
        };
    }

    /**
     * EntityManager에 접근합니다.
     *
     * @param manager
     * @returns
     */
    private createEntityManagerProxy(manager: EntityManager) {
        return new Proxy(manager, {
            get: (target, prop, receiver) => {
                this.logger.debug("[EntityManager]에 접근했습니다.");

                return Reflect.get(target, prop, receiver);
            },
        });
    }
}
