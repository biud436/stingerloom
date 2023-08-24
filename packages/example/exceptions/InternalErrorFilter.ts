/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AfterCatch } from "@stingerloom/common/decorators/AfterCatch";
import { BeforeCatch } from "@stingerloom/common/decorators/BeforeCatch";
import { Catch } from "@stingerloom/common/decorators/Catch";
import { ExceptionFilter } from "@stingerloom/common/decorators/ExceptionFilter";
import { Filter } from "@stingerloom/common/Filter";
import { Logger } from "@stingerloom/common/Logger";
import { InternalServerException } from "@stingerloom/error/InternalServerException";

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
