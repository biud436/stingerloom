import { Exception } from "./Exception";

export class NotFoundException extends Exception {
    name = "NotFoundException";
    constructor(message: string) {
        super(message, 404);
    }
}
