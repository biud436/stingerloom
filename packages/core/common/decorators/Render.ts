/* eslint-disable @typescript-eslint/no-unused-vars */
export const RENDER_TOKEN = "RENDER_TOKEN";
export const RENDER_PATH_TOKEN = "RENDER_PATH_TOKEN";
export function Render(path: string): MethodDecorator {
  return (target, propertyKey, _descriptor) => {
    Reflect.defineMetadata(RENDER_TOKEN, true, target, propertyKey);
    Reflect.defineMetadata(RENDER_PATH_TOKEN, path, target, propertyKey);
  };
}
