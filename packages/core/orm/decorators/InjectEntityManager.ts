export const ENTITY_METADATA_TOKEN = Symbol.for("STG_InjectEntityManager");

export function InjectEntityManager(): ParameterDecorator {
  return (target, _projectKey, index) => {
    const params = Reflect.getMetadata("design:paramtypes", target) || [];
    const injectParam = params[index];

    Reflect.defineMetadata(ENTITY_METADATA_TOKEN, injectParam, target);
  };
}
