import { Render } from "./Render";

export function View(path: string): MethodDecorator {
    return Render(path);
}
