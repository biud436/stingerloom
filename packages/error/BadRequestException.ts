import { Exception } from "./Exception";

export class BadRequestException extends Exception {
    name = "BadRequestException";
    constructor(message: string) {
        super(message, 400);
    }
}
