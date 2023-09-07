import ts from "typescript";
import path from "path";

const imports: string[] = [];

type IStingerModule = {
    right?: ts.CallExpression;
};

export function readModuleOption() {
    const module: IStingerModule = {};

    const bootstrapFilePath = path.resolve(
        __dirname,
        "../packages/example/bootstrap.ts",
    );

    const program = ts.createProgram([bootstrapFilePath], {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
        allowJs: false,
    });

    const sourceFile = program.getSourceFile(bootstrapFilePath);

    if (!sourceFile) {
        throw new Error("소스 파일을 찾을 수 없습니다.");
    }

    const visitor = (node: ts.Node) => {
        if (ts.isClassDeclaration(node)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const heritageClauses = node.heritageClauses?.forEach((clause) => {
                const isServerBootstrapApplication = clause.types.find(
                    (type: ts.ExpressionWithTypeArguments) => {
                        if (ts.isExpressionWithTypeArguments(type)) {
                            const name = type.expression as ts.Identifier;

                            if (
                                name.escapedText ===
                                "ServerBootstrapApplication"
                            ) {
                                return true;
                            }

                            return false;
                        }

                        return false;
                    },
                );

                if (!isServerBootstrapApplication) {
                    throw new Error(
                        "ServerBootstrapApplication 클래스를 상속받아야 합니다.",
                    );
                }
            });
        } else if (ts.isMethodDeclaration(node)) {
            const name = node.name as ts.Identifier;

            if (name.escapedText === "beforeStart") {
                console.log("beforeStart 메서드를 찾았습니다.");
            }
        } else if (ts.isBinaryExpression(node)) {
            const left = node.left as ts.PropertyAccessExpression;
            const name = left.name as ts.Identifier;

            if (name.escapedText === "moduleOptions") {
                const right = node.right as ts.CallExpression;
                module.right = right;
            }
        }

        ts.forEachChild(node, visitor);
    };

    visitor(sourceFile);

    return {
        imports,
        module,
        sourceFile,
    };
}

/**
 * 컨트롤러 속성을 읽어옵니다.
 *
 * @param node
 * @returns
 */
function readControllersWithDepth0(node: ts.CallExpression) {
    let controllerNode: ts.PropertyAssignment | undefined = undefined;

    const visitor = (node: ts.Node) => {
        if (ts.isPropertyAssignment(node)) {
            const name = node.name as ts.Identifier;

            if (name.escapedText === "controllers") {
                controllerNode = node;
            }
        }

        ts.forEachChild(node, visitor);
    };

    visitor(node);

    return controllerNode;
}

function updateControllerNode(node: ts.PropertyAssignment) {
    if (!ts.isPropertyAssignment(node)) {
        throw new Error("node는 PropertyAssignment 타입이어야 합니다.");
    }

    const initializer = node.initializer as ts.ArrayLiteralExpression;

    return ts.factory.updatePropertyAssignment(
        node,
        node.name,
        ts.factory.updateArrayLiteralExpression(initializer, [
            ...initializer.elements,
            ts.factory.createIdentifier("AuthController2"),
        ]),
    );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateControllerNode2(node: ts.PropertyAssignment) {
    if (!ts.isPropertyAssignment(node)) {
        throw new Error("node는 PropertyAssignment 타입이어야 합니다.");
    }

    const initializer = node.initializer as ts.ArrayLiteralExpression;

    return ts.factory.createPropertyAssignment(
        node.name,
        ts.factory.createArrayLiteralExpression([
            ...initializer.elements,
            ts.factory.createIdentifier("AuthController2"),
        ]),
    );
}

describe("타입스크립트 컴파일러 테스트", () => {
    const { module, sourceFile } = readModuleOption();
    const printer = ts.createPrinter();

    it("right 속성 확인", () => {
        expect(module.right).toBeDefined();
    });

    it("컨트롤러 속성 확인", () => {
        const controllers = readControllersWithDepth0(module.right!);

        console.log(
            printer.printNode(
                ts.EmitHint.Unspecified,
                controllers!,
                sourceFile,
            ),
        );

        expect(controllers).toBeDefined();
    });

    it("컨트롤러 속성에 새로운 컨트롤러 추가", () => {
        const controllers = readControllersWithDepth0(module.right!);
        const afterController = updateControllerNode(controllers!);

        console.log(
            printer.printNode(
                ts.EmitHint.Unspecified,
                afterController!,
                sourceFile,
            ),
        );

        expect(afterController).toBeDefined();
    });
});
