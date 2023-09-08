import ts from "typescript";

const transformer =
    (namedImportIdentifier: string, importPath: string) =>
    (context: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const { factory } = context;

            const imports = sourceFile.statements.filter(
                ts.isImportDeclaration,
            );

            const lastImports = imports.at(-1);

            const lastIndex = lastImports
                ? sourceFile.statements.indexOf(lastImports)
                : 0;

            return ts.factory.updateSourceFile(sourceFile, [
                ...sourceFile.statements.slice(0, lastIndex),
                factory.createImportDeclaration(
                    undefined,
                    ts.factory.createImportClause(
                        false,
                        undefined,
                        ts.factory.createNamedImports([
                            ts.factory.createImportSpecifier(
                                false,
                                undefined,
                                ts.factory.createIdentifier(
                                    namedImportIdentifier,
                                ),
                            ),
                        ]),
                    ),
                    ts.factory.createStringLiteral(importPath),
                ),
                ...sourceFile.statements.slice(lastIndex + 1),
            ]);
        };
    };

export const NamespaceImportTransformer = {
    /**
     * 새로운 import 구문을 추가합니다.
     *
     * @param namedImportIdentifier
     * @param importPath
     * @returns
     */
    transformer,
};
