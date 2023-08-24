import { ParameterAllocator } from "../ParameterListManager";
import { REPOSITORY_TOKEN } from "../decorators/InjectRepository";

export const getRepositoryAllocator: ParameterAllocator = (
    param,
    parameters,
) => {
    const repository = Reflect.getMetadata(REPOSITORY_TOKEN, param.prototype);
    parameters.push(repository);
};
