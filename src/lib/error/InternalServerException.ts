import { Exception } from "./Exception";

export class InternalServerException extends Exception {
    constructor(message: string) {
        super(message, 500);
    }
}
