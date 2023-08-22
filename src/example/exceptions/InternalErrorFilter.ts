/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AfterCatch } from "../../lib/common/decorators/AfterCatch";
import { BeforeCatch } from "../../lib/common/decorators/BeforeCatch";
import { Catch } from "../../lib/common/decorators/Catch";
import { ExceptionFilter } from "../../lib/common/decorators/ExceptionFilter";
import { Filter } from "../../lib/common/Filter";
import { Logger } from "../../lib/common/Logger";
import { InternalServerException } from "../../lib/error/InternalServerException";

@ExceptionFilter(InternalServerException)
export class InternalErrorFilter implements Filter {
    private readonly logger = new Logger();

    @BeforeCatch()
    public beforeCatch() {
        this.logger.info("before catch");
    }

    @Catch()
    public catch(error: any) {
        this.logger.info("[서버 내부 오류] " + error.message);

        return {
            message: error.message,
            status: error.status,
            result: "failure",
        };
    }

    @AfterCatch()
    public afterCatch() {
        this.logger.info("after catch");
    }
}
