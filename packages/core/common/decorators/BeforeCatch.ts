import { Catch } from "./Catch";

export function BeforeCatch(): MethodDecorator {
  return Catch("before-throwing");
}
