/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType, Logger, ReflectManager } from "@stingerloom/common";
import { EntityMetadata, EntityScanner } from "../scanner";
import Container from "typedi";

export class EntityManager {
    private _entities: ClazzType<any>[] = [];
    private readonly logger = new Logger(EntityManager.name);

    public async register() {
        await this.registerEntities();
    }

    public async propagateShutdown() {
        // TODO: 나중에 추가
    }

    private async registerEntities() {
        const entityScanner = Container.get(EntityScanner);
        const entities = entityScanner.makeEntities();

        let entity: IteratorResult<EntityMetadata>;

        while ((entity = entities.next())) {
            if (entity.done) break;

            const metadata = entity.value as EntityMetadata;

            const TargetEntity = metadata.target as ClazzType<any>;
            if (!ReflectManager.isEntity(TargetEntity)) {
                throw new Error(
                    `${TargetEntity.name}은 Entity가 아닌 듯 합니다..`,
                );
            }

            metadata.columns.forEach((column) => {
                this.logger.info(
                    `Entity: ${TargetEntity.name} - Column: ${column.name} - Nullable: ${column.options?.nullable} - Length: ${column.options?.length} - Type: ${column.options?.type}`,
                );
            });
        }
    }
}
