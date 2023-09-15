/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ParameterListManager,
    transformBasicParameter,
} from "@stingerloom/common";

import { DynamicClassWrapper } from "../scanners";
import {
    AUTO_WIRED_TOKEN,
    AutoWiredMetadata,
} from "@stingerloom/common/decorators/Autowired";

/**
 * 프로퍼티를 자동으로 주입합니다.
 *
 * @param instance
 * @returns
 */
export function createAutoWiredFactory<T extends object>(instance: T) {
    const properties = Reflect.getMetadata(
        AUTO_WIRED_TOKEN,
        instance,
    ) as AutoWiredMetadata[];

    if (!properties) {
        return;
    }

    properties.forEach((property) => {
        const parameters: DynamicClassWrapper<any>[] = [];
        ParameterListManager.invoke(property.name)?.(property.type, parameters);

        parameters.forEach((param) => {
            const wrapper = transformBasicParameter(param);

            if (!wrapper) {
                return;
            }

            const key = property.name as keyof T;
            instance[key] = wrapper;
        });
    });
}
