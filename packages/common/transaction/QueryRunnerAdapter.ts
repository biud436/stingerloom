import { DataSource, EntityManager, QueryRunner } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";

/**
 * @class QueryRunnerAdapter
 * @author biud436
 * @description
 * 추후 TypeOrmQueryRunnerAdapter로 이름을 변경할 수도 있다.
 */
export class QueryRunnerAdapter {
    private queryRunner?: QueryRunner;

    constructor(private readonly dataSource: DataSource) {
        this.queryRunner = this.dataSource.createQueryRunner();
    }

    public async connect() {
        await this.queryRunner?.connect();
    }

    public async startTransaction(isolationLevel?: IsolationLevel | undefined) {
        await this.queryRunner?.startTransaction(isolationLevel);
    }

    public async commitTransaction() {
        await this.queryRunner?.commitTransaction();
    }

    public async rollbackTransaction() {
        await this.queryRunner?.rollbackTransaction();
    }

    public async release() {
        await this.queryRunner?.release();
    }

    public getManager(): EntityManager | undefined {
        return this.queryRunner?.manager;
    }
}
