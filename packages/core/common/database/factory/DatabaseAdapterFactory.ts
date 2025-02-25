import { DatabaseOptions } from "../interfaces/DatabaseOptions";
import { DatabaseContext } from "../interfaces/DatabaseContext";
import { TypeOrmDatabaseAdapter } from "../adapters";

/**
 * 데이터베이스 어댑터 팩토리
 * 설정에 따라 적절한 데이터베이스 어댑터를 생성합니다.
 */
export class DatabaseAdapterFactory {
    /**
     * 설정에 따라 데이터베이스 어댑터를 생성합니다.
     * @param options 데이터베이스 설정
     */
    public static create(options: DatabaseOptions): DatabaseContext {
        const adapterType = options.provider || options.type;

        switch (adapterType) {
            case "typeorm":
                return new TypeOrmDatabaseAdapter(options);
            // case "mysql":
            // case "postgres":
            // case "sqlite":
            // case "mongodb":
            // 향후 다른 ORM 어댑터 추가 가능
            // case 'sequelize':
            //     return new SequelizeDatabaseAdapter(options);
            // case 'mongoose':
            //     return new MongooseDatabaseAdapter(options);
            default:
                throw new Error(
                    `Unsupported database adapter type: ${adapterType}`,
                );
        }
    }
}
