export const INJECTABLE_TOKEN = "injectable";
export function Injectable(): ClassDecorator {
    return function (target) {
        const metadata = {
            type: "injectable",
            name: target.name,
            target,
        };

        Reflect.defineMetadata(INJECTABLE_TOKEN, metadata, target);

        /**
         * TODO: 매개변수 주입을 위한 코드 추가 필요 (컨트롤러 주입 코드와 같음)
         */

        return target;
    };
}
