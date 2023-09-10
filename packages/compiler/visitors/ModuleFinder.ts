import ts from "typescript";

export type IStingerModule = {
    right?: ts.CallExpression;
    root?: ts.BinaryExpression;
};

/**
 * ServerBootstrapApplication 클래스를 상속한 클래스에서 모듈이 정의된 부분을 찾습니다.
 *
 * @param sourceFile
 * @returns
 */
export const findModuleOption =
    (sourceFile: ts.SourceFile) =>
    (moduleRef: IStingerModule = {}) => {
        const visitor = (node: ts.Node) => {
            if (ts.isClassDeclaration(node)) {
                node.heritageClauses?.forEach((clause) => {
                    const isServerBootstrapApplication = clause.types.find(
                        (type: ts.ExpressionWithTypeArguments) => {
                            if (ts.isExpressionWithTypeArguments(type)) {
                                const name = type.expression as ts.Identifier;

                                // 서버 부트스트랩 애플리케이션 클래스를 상속받았는지 확인합니다.
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

                // beforeStart 메서드가 있는지 확인합니다.
                if (name.escapedText === "beforeStart") {
                    console.log("beforeStart 메서드를 찾았습니다.");
                }
            } else if (ts.isBinaryExpression(node)) {
                const left = node.left as ts.PropertyAccessExpression;
                const name = left.name as ts.Identifier;

                // moduleOptions 속성이 있는지 확인하고 있으면 추출합니다.
                if (name.escapedText === "moduleOptions") {
                    const right = node.right as ts.CallExpression;
                    moduleRef.right = right;
                    moduleRef.root = node;
                }
            }

            ts.forEachChild(node, visitor);
        };

        visitor(sourceFile);

        return moduleRef;
    };
