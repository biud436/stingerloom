import { ISelectOption } from "../dialects/ISelectOption";
import { FindOption } from "../dialects/FindOption";

type SelectableFields<T> = { [K in keyof T]?: boolean };

class SelectUtils {
  static isArraySelect<T>(select: ISelectOption<T>): select is (keyof T)[] {
    return Array.isArray(select);
  }

  static isBooleanSelect<T>(
    select: ISelectOption<T>,
  ): select is SelectableFields<T> {
    if (!select || typeof select !== "object" || Array.isArray(select))
      return false;

    // 객체의 모든 값이 boolean 타입인지 확인
    return Object.values(select).every(
      (value) => typeof value === "boolean" || value === undefined,
    );
  }

  static isNestedSelect<T>(
    select: ISelectOption<T>,
  ): select is { [K in keyof T]?: FindOption<T[K]> } {
    if (!select || typeof select !== "object" || Array.isArray(select))
      return false;

    // boolean이 아닌 객체 값이 하나라도 있다면 nested select로 간주
    return Object.values(select).some(
      (value) =>
        typeof value === "object" && value !== null && !Array.isArray(value),
    );
  }
}

export default SelectUtils;
