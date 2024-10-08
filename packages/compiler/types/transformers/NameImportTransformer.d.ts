import ts from "typescript";
export declare const NamespaceImportTransformer: {
    /**
     * 새로운 import 구문을 추가합니다.
     *
     * @param namedImportIdentifier
     * @param importPath
     * @returns
     */
    transformer: (namedImportIdentifier: string, importPath: string) => (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile;
};
