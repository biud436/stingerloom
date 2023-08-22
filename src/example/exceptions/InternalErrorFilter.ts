/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Catch } from "../../lib/Catch";
import { ExceptionFilter } from "../../lib/ExceptionFilter";
import { InternalServerException } from "../../lib/error/InternalServerException";

@ExceptionFilter(InternalServerException)
export class InternalErrorFilter {
    @Catch()
    public catch(error: any) {
        return {
            message: error.message,
            status: error.status,
        };
    }
}
