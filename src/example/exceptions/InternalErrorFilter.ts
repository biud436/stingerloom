/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Catch } from "../../lib/Catch";
import { ExceptionFilter } from "../../lib/ExceptionFilter";
import { Filter } from "../../lib/Filter";
import { Logger } from "../../lib/Logger";
import { InternalServerException } from "../../lib/error/InternalServerException";

@ExceptionFilter(InternalServerException)
export class InternalErrorFilter implements Filter {
    private readonly logger = new Logger();

    @Catch()
    public catch(error: any) {
        this.logger.info("[서버 내부 오류] " + error.message);

        return {
            message: error.message,
            status: error.status,
            result: "failure",
        };
    }
}
