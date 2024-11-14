import { HttpContext } from "../interfaces";

export type HttpHandler = (context: HttpContext) => Promise<void>;
