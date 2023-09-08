import ts from "typescript";

type IModuleUpdator = (
    binaryExpression: ts.BinaryExpression,
) => ts.BinaryExpression;

const transformer =
    (updateModuleOption: IModuleUpdator) =>
    (context: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const visitor: ts.Visitor = (rootNode: ts.Node) => {
                if (ts.isExpressionStatement(rootNode)) {
                    const expression = rootNode.expression;

                    if (ts.isBinaryExpression(expression)) {
                        const left = expression.left;
                        const binaryExpression = expression;

                        if (ts.isPropertyAccessExpression(left)) {
                            const expression = left.expression;

                            if (expression.kind === ts.SyntaxKind.ThisKeyword) {
                                const name = left.name as ts.Identifier;

                                if (name.escapedText === "moduleOptions") {
                                    return ts.factory.updateExpressionStatement(
                                        rootNode,
                                        updateModuleOption(binaryExpression),
                                    );
                                }
                            }
                        }
                    }
                }

                return ts.visitEachChild(rootNode, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };

export const UpdateModuleOptionsTransformer = {
    transformer,
};
