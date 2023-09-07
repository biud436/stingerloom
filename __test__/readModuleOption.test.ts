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
    };
}

describe("타입스크립트 컴파일러 테스트", () => {
    const { module } = readModuleOption();

    it("right 속성 확인", () => {
        console.log(module.right);

        expect(module.right).toBeDefined();
    });
});
