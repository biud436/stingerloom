import {
  DynamicModuleOption,
  MODULE_TOKEN,
  MODULE_OPTIONS_TOKEN,
} from "../Module";

export function EntryModule(options: DynamicModuleOption): ClassDecorator {
  /**
   * - 모듈 생성 여부
   * - 모듈에 제공되는 providers를 평가한다.
   * - 모듈에 제공되는 controllers를 평가한다.
   * - 모듈에 제공되는 imports를 평가한다.
   */
  return (target: object) => {
    Reflect.defineMetadata(MODULE_TOKEN, true, target);
    Reflect.defineMetadata(MODULE_OPTIONS_TOKEN, options, target);
    Reflect.defineMetadata("ENTRY_MODULE", true, target);
  };
}
