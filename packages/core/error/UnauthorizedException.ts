import { Exception } from "./Exception";

export class UnauthorizedException extends Exception {
    name = "UnauthorizedException";
    constructor(message: string) {
        super(message, 401);
    }
}
