import { ClazzType } from "../RouterMapper";
export type BodyParameter = {
    index: number;
    type: ClazzType<any>;
};
export declare const BODY_TOKEN = "body";
export declare function Body(): ParameterDecorator;
