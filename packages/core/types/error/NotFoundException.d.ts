import { Exception } from "./Exception";
export declare class NotFoundException extends Exception {
    name: string;
    constructor(message: string);
}
