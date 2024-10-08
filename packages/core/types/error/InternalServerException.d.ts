import { Exception } from "./Exception";
export declare class InternalServerException extends Exception {
    name: string;
    constructor(message: string);
}
