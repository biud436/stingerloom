import { ClassCodeGenerator } from "./ClassCodeGenerator";

export class ControllerCodeFactory {
    private codeGenerator: ClassCodeGenerator;

    constructor(routerName: string) {
        const serviceFileName = this.toPascalCase(routerName);

        this.codeGenerator = new ClassCodeGenerator(
            [
                {
                    name: "Controller",
                    path: "@stingerloom/common/decorators/Controller",
                },
                {
                    name: serviceFileName,
                    path: `./${serviceFileName}`,
                    type: "service",
                },
                { name: "Get", path: "@stingerloom/common/decorators/Get" },
            ],
            routerName,
            {
                isController: true,
            },
        );
    }

    /**
     * 파스칼 케이스로 변환합니다.
     *
     * @param str
     * @returns
     */
    public toPascalCase(str: string) {
        return `${str[0].toUpperCase()}${str.slice(1)}`;
    }

    /**
     * 카멜 케이스로 변환합니다.
     *
     * @param str
     * @returns
     */
    public toCamelCase(str: string) {
        return `${str[0].toLowerCase()}${str.slice(1)}`;
    }

    /**
     * 파일을 생성합니다.
     */
    public build() {
        this.codeGenerator.generateControllerFile();
    }
}
