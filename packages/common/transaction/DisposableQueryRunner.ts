import { DataSource, QueryRunner } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";

export class DisposableQueryRunner implements AsyncDisposable {
    private queryRunner: QueryRunner | null = null;

    constructor(private readonly dataSource: DataSource) {
        this.queryRunner = this.dataSource.createQueryRunner();
    }

    getQueryRunner(): QueryRunner {
        return this.queryRunner!;
    }

    connect() {
        return this.queryRunner!.connect();
    }

    startTransaction(isolationLevel?: IsolationLevel | undefined) {
        return this.queryRunner!.startTransaction(isolationLevel);
    }

    commitTransaction() {
        return this.queryRunner!.commitTransaction();
    }

    rollbackTransaction() {
        return this.queryRunner!.rollbackTransaction();
    }

    /**
     * https://github.com/microsoft/TypeScript/pull/54505
     */
    async [Symbol.asyncDispose]() {
        await this.queryRunner?.release();
    }
}
