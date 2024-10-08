import { Exception } from "./Exception";
export declare class UnauthorizedException extends Exception {
    name: string;
    constructor(message: string);
}
