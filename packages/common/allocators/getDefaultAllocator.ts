import Container from "typedi";
import { ParameterAllocator } from "../ParameterListManager";
import { InstanceScanner } from "../../IoC/scanners/InstanceScanner";

export const getDefaultAllocator: ParameterAllocator = (param, parameters) => {
    const TargetService = param;

    const instanceScanner = Container.get(InstanceScanner);

    if (TargetService) {
        parameters.push(instanceScanner.wrap(TargetService));
    }
};
