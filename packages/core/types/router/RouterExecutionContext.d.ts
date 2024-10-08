import { FastifyInstance } from "fastify";
import { ContainerMetadata } from "../IoC/scanners/MetadataScanner";
import { ClazzType } from "../common";
/**
 * @class RouterExecutionContext
 * @author 어진석(biud436)
 * @description
 * 라우터를 실행하기 위한 컨텍스트 클래스입니다.
 */
export declare class RouterExecutionContext {
    private readonly app;
    private readonly logger;
    private readonly guardConsumer;
    constructor(app: FastifyInstance);
    create(metadata: ContainerMetadata, targetController: ClazzType<any>, controllerPath: string): Promise<void>;
}
