import { Logger } from "@stingerloom/common";
import {
    DataSource,
    DataSourceOptions,
    EntityManager,
    EntityTarget,
    ObjectLiteral,
} from "typeorm";

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

                // getRepository
                if (
                    prop === "getRepository" ||
                    prop === "getCustomRepository" ||
                    prop === "getTreeRepository" ||
                    prop === "getMongoRepository"
                ) {
                    return <Entity extends ObjectLiteral>(
                        entity: EntityTarget<Entity>,
                    ) => {
                        const repository = Reflect.apply(target[prop], target, [
                            entity,
                        ]);

                        return repository;
                    };
                }

                return Reflect.get(target, prop, receiver);
            },
        });
    }

    /**
     * QueryRunner를 생성합니다.
     *
     *
     * @param dataSource
     * @param target
     * @returns
     */
    private createQueryRunner(dataSource: DataSource, target: DataSource) {
        const targetMethod = target.createQueryRunner;

        if (!targetMethod) {
            throw new Error(
                "cannot find createQueryRunner method in DataSource",
            );
        }

        // 호출된 클래스와 메소드를 알 수 있어야 합니다.
        // 즉, @Transactional 데코레이터가 마킹된 메소드가 호출되기 전에 클래스와 메소드에 대한 로그를 남겨야 합니다.
        // 여러 사용자가 요청할 경우, 동시성 문제가 발생할 수 있습니다.
        // 따라서, 락이 필요합니다. 락이 되어있는지 확인하고, 락이 되어있지 않다면 락을 걸고, 락이 되어있다면 락이 풀릴 때까지 대기해야 합니다.

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
