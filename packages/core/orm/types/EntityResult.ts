import { ClazzType } from "common";

export type EntityResult<T> =
    | InstanceType<ClazzType<T>>
    | InstanceType<ClazzType<T>>[]
    | undefined;
