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

    /**
     * 요청 파라미터인지 여부
     */
    isReq: boolean;

    /**
     * 세션 파라미터인지 여부
     */
    isSession: boolean;

    /**
     * 커스텀 파라미터인지 여부
     */
    isCustom: boolean;

    /**
     * 바디 파라미터인지 여부
     */
    body?: HttpBodyParameter;

    type?: () => ClazzType<any>;
};
