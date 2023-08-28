import { ReflectManager } from "../ReflectManager";
import { ClazzType } from "../RouterMapper";

export class DataSourceMetadata {
    token!: string;
}

export const INJECT_DATA_SOURCE_TOKEN = "INJECT_DATA_SOURCE:metadata";
export function InjectDataSource<T>(): ParameterDecorator {
    return (
        target: object,
        _propertyKey: string | symbol | undefined,
        index: number,
    ) => {
        const params = ReflectManager.getParamTypes(target) || [];
        const injectParam = params[index] as ClazzType<T>;

        Reflect.defineMetadata(
            INJECT_DATA_SOURCE_TOKEN,
            true,
            injectParam.prototype,
        );
    };
}
