import { Catch } from "./Catch";

export function AfterCatch(): MethodDecorator {
  return Catch("after-throwing");
}
