import { ClazzType } from "./RouterMapper";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type HttpRouterParameter = {
    index: number;
    value: any;
    isReq: boolean;
    body?: {
        index: number;
        type: ClazzType<any>;
    };
};
