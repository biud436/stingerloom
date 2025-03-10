import { ParameterAllocator } from "../ParameterListManager";
import { REPOSITORY_TOKEN } from "../decorators/InjectRepository";

/**
 * 이전 버전에서 사용하던 Repository 할당 함수입니다.
 * 가까운 미래에 삭제될 예정입니다.
 *
 * @deprecated
 * @param param
 * @param parameters
 */
export const getRepositoryAllocator: ParameterAllocator = (
  param,
  parameters,
) => {
  const repository = Reflect.getMetadata(REPOSITORY_TOKEN, param.prototype);
  parameters.push(repository);
};
