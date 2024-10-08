import { Exception } from "./Exception";

export class InternalServerException extends Exception {
    name = "InternalServerException";
    constructor(message: string) {
        super(message, 500);
    }
}
