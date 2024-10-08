import { ClazzType, HttpRouterParameter } from "../common";
import { ValidationError } from "class-validator/types/validation/ValidationError";
import { FastifyReply, FastifyRequest } from "fastify";
export declare class RouteParameterTransformer {
    private readonly targetController;
    constructor(targetController: ClazzType<any>);
    transform(routerName: string, req: FastifyRequest, res: FastifyReply, parameters: HttpRouterParameter[], bodyValidationActions: Promise<ValidationError[]>[]): Promise<any[]>;
    handle(routerName: string, req: FastifyRequest, res: FastifyReply, parameters: HttpRouterParameter[], bodyValidationActions: Promise<ValidationError[]>[], param: HttpRouterParameter): Promise<any>;
}
