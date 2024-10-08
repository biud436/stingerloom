import { ValidationError } from "class-validator";
import { FastifyReply } from "fastify";
export declare class ValidationHandler {
    private readonly res;
    private readonly actions;
    result: ValidationError[][];
    constructor(res: FastifyReply, actions: Promise<ValidationError[]>[]);
    isError(): Promise<boolean>;
    getResponse(): {
        status: number;
        message: string[][];
    };
}
