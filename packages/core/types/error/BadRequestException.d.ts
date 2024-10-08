import { Exception } from "./Exception";
export declare class BadRequestException extends Exception {
    name: string;
    constructor(message: string);
}
