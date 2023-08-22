import { ValidationError } from "class-validator";
import { FastifyReply } from "fastify";

const BAD_REQUEST_CODE = 400;

export class ValidationHandler {
    result!: ValidationError[][];

    constructor(
        private readonly res: FastifyReply,
        private readonly actions: Promise<ValidationError[]>[],
    ) {}

    async isError() {
        const { actions } = this;
        const bodyValidationResults = await Promise.all(actions);

        this.result = bodyValidationResults;

        return bodyValidationResults.some((result) => result.length > 0);
    }

    getResponse() {
        const { res, result: bodyValidationResults } = this;

        res.status(BAD_REQUEST_CODE);

        return {
            status: BAD_REQUEST_CODE,
            message: bodyValidationResults.map((result) =>
                result.map((err) => err.toString()),
            ),
        };
    }
}
