import { Logger } from "@stingerloom/common";
import { RawTransactionScanner } from "@stingerloom/common/transaction/RawTransactionScanner";
import Container from "typedi";
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
    private readonly transactionScanner = Container.get(RawTransactionScanner);

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

        return (...args: unknown[]) => {
            this.logger.debug("[createQueryRunner]에 접근했습니다.");

            /**
             * TODO: 다음 코드는 실행되지 않습니다.
             */
            if (this.transactionScanner.isGlobalLock()) {
                const txQueryRunner =
                    this.transactionScanner.getTxQueryRunner();

                if (!txQueryRunner) {
                    throw new Error("트랜잭션 QueryRunner를 찾을 수 없습니다");
                }

                console.log(
                    "txQueryRunner.isTransactionActive",
                    txQueryRunner.isTransactionActive,
                );

                return txQueryRunner;
            }

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

                if (this.transactionScanner.isGlobalLock()) {
                    const txEntityManager =
                        this.transactionScanner.getTxEntityManager();

                    if (!txEntityManager) {
                        throw new Error(
                            "트랜잭션 EntityManager를 찾을 수 없습니다",
                        );
                    }

                    return txEntityManager;
                }

                return Reflect.get(target, prop, receiver);
            },
        });
    }
}
