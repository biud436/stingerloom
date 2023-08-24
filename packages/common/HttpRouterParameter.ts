/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "./RouterMapper";

export type HttpBodyParameter<T = any> = {
    index: number;
    type: ClazzType<T>;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type HttpRouterParameter = {
    index: number;
    value: any;
    isReq: boolean;
    body?: HttpBodyParameter;
};
