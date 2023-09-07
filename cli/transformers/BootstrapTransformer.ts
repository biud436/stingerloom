/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import * as ts from "typescript";
import path from "path";
import { Logger } from "@stingerloom/common";

type Importer = Map<
    string,
    Map<
        string,
        {
            pos: number;
            end: number;
        }
    >
>;

type IStingerModule = {
    right?: ts.CallExpression;
};

const __ENTRYPOINT__ = path.join(
    __dirname,
    "..",
    "..",
    "packages",
    "example",
    "bootstrap.ts",
);

/**
 * @class BootstrapTransformer
 * @author biud436
 * @description ModuleOptions을 자동으로 수정합니다.
 */
export class BootstrapTransformer {
    private importsMap: Importer = new Map();
    private readonly logger: Logger = new Logger(BootstrapTransformer.name);

    private program!: ts.Program;
    private typeChecker!: ts.TypeChecker;

    /**
     * BootstrapTransformer 클래스의 생성자
     *
     * @param newFiles 새로운 파일들의 경로를 전달합니다.
     */
    constructor(private readonly newFiles: string[]) {}

    async start() {
        this.program = ts.createProgram([__ENTRYPOINT__], {});
        this.typeChecker = this.program.getTypeChecker();

        const sourceFile = this.program.getSourceFile(__ENTRYPOINT__);

        this.visitNode(sourceFile!, this.importsMap);

        this.importsMap.forEach((value, key) => {
            console.log(key, value);
        });
    }

    private isPropertyAssignment(node: ts.Node): boolean {
        return node.kind === ts.SyntaxKind.PropertyAssignment;
    }

    private isBeforeStartHook(node: ts.Identifier): boolean {
        return node.escapedText === "beforeStart";
    }

    /**
     * ModuleOptions 노드를 획득합니다.
     *
     * @returns
     */
    getModuleOptionsNode(): { module: IStingerModule } {
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
                const heritageClauses = node.heritageClauses?.forEach(
                    (clause) => {
                        const isServerBootstrapApplication = clause.types.find(
                            (type: ts.ExpressionWithTypeArguments) => {
                                if (ts.isExpressionWithTypeArguments(type)) {
                                    const name =
                                        type.expression as ts.Identifier;

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
                    },
                );
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
            module,
        };
    }

    /**
     * 타입스크립트 AST를 순회하면서 필요한 정보를 수집합니다.
     *
     * @see
     * https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/transform/src/transform.ts
     *
     * https://youtu.be/X8k_4tZ16qU
     *
     * https://www.huy.rocks/everyday/04-01-2022-typescript-how-the-compiler-compiles
     *
     * @param sourceFile 타입스크립트 소스 파일
     * @param importsMap 모듈 옵션의 imports 속성을 수집합니다.
     */
    visitNode(sourceFile: ts.SourceFile, importsMap: Importer) {
        let isFoundModuleOption = false;
        let isFoundImports = false;

        const visitor = (node: ts.Node) => {
            if (ts.isClassDeclaration(node)) {
                this.logger.debug(`${node.name?.text}을 찾았습니다.`);
            }

            if (ts.isMethodDeclaration(node)) {
                const name = node.name as ts.Identifier;

                if (this.isBeforeStartHook(name)) {
                    node.body?.statements.forEach((stmt) => {
                        if (ts.isExpressionStatement(stmt)) {
                            const expression = stmt.expression;

                            console.log(expression.getText(sourceFile));
                        }
                    });
                }
            }

            if (ts.isIdentifier(node)) {
                const identifier = node as ts.Identifier;

                if (identifier.escapedText === "ModuleOptions") {
                    isFoundModuleOption = true;
                    this.logger.debug("ModuleOptions을 찾았습니다");
                }

                if (isFoundModuleOption) {
                    if (identifier.escapedText === "imports") {
                        isFoundImports = true;
                        this.logger.debug("imports를 찾았습니다");
                    }
                }

                if (isFoundImports) {
                    const imports = node.parent?.parent;

                    imports.forEachChild((child) => {
                        if (
                            child.kind === ts.SyntaxKind.ArrayLiteralExpression
                        ) {
                            const parent = child.parent;

                            if (!this.isPropertyAssignment(parent)) {
                                return;
                            }

                            const propertyAssignment =
                                parent as ts.PropertyAssignment;
                            const propertyName =
                                propertyAssignment.name as ts.Identifier;

                            if (
                                !importsMap.has(
                                    propertyName.escapedText as string,
                                )
                            ) {
                                importsMap.set(
                                    propertyName.escapedText as string,
                                    new Map(),
                                );
                            }

                            const arrayLiteralExpression =
                                child as ts.ArrayLiteralExpression;

                            arrayLiteralExpression.elements.forEach(
                                (element) => {
                                    const name = element as ts.Identifier;

                                    const valuesMap = importsMap.get(
                                        propertyName.escapedText as string,
                                    );

                                    if (valuesMap) {
                                        valuesMap.set(
                                            name.escapedText as string,
                                            {
                                                pos: name.pos,
                                                end: name.end,
                                            },
                                        );
                                    }
                                },
                            );
                        }
                    });
                }
            }

            ts.forEachChild(node, visitor);
        };

        visitor(sourceFile);
    }
}
