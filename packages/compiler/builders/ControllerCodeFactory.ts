import { ClassCodeGenerator } from "./ClassCodeGenerator";

export class ControllerCodeFactory {
    private codeGenerator: ClassCodeGenerator;

    constructor(routerName: string) {
        this.codeGenerator = new ClassCodeGenerator(
            [
                {
                    name: "Controller",
                    path: "@stingerloom/common/decorators/Controller",
                },
                { name: "TestService", path: "./TestService", type: "service" },
                { name: "Get", path: "@stingerloom/common/decorators/Get" },
            ],
            routerName,
            {
                isController: true,
            },
        );
    }

    public build() {
        this.codeGenerator.generateControllerFile();
    }
}
