import httpStatus from "http-status";
import { Exception } from "./Exception";

export class InternalServerException extends Exception {
    name = "InternalServerException";
    constructor(message: string) {
        super(message, httpStatus.INTERNAL_SERVER_ERROR);
    }
}
