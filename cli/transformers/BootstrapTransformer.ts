/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import * as ts from "typescript";
import path from "path";
import fs from "fs";
import { Logger } from "@stingerloom/common";
import {
    NamespaceImportTransformer,
    PropertyTransformer,
} from "@stingerloom/compiler/transformers";
import {
    IStingerModule,
    findModuleOption,
} from "@stingerloom/compiler/visitors/ModuleFinder";
import { ModuleControllerService } from "@stingerloom/compiler/visitors/ModuleControllerService";
import { UpdateModuleOptionsTransformer } from "@stingerloom/compiler/transformers/UpdateModuleOptionsTransformer";
import { ModuleProviderService } from "@stingerloom/compiler/visitors/ModuleProviderService";

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

const __ENTRYPOINT__ = path.join(
    __dirname,
    "..",
    "..",
    "packages",
    "example",
    "bootstrap.ts",
);
const __ENTRYPOINT2__ = path.join(
    __dirname,
    "..",
    "..",
    "packages",
    "example",
    "bootstrap2.ts",
);

/**
 * @class BootstrapTransformer
 * @author biud436
 * @description ModuleOptions을 자동으로 수정합니다.
 */
export class BootstrapTransformer {
    private readonly logger: Logger = new Logger(BootstrapTransformer.name);

    private program!: ts.Program;
    private sourceFile!: ts.SourceFile;
    private transformer: ts.TransformerFactory<ts.SourceFile>[] = [];

    /**
     * BootstrapTransformer 클래스의 생성자
     *
     * @param newFiles 새로운 파일들의 경로를 전달합니다.
     */
    constructor(private readonly newFiles: string[]) {}

    async start() {
        this.handleImports();
        this.handleBootstrap();
        this.transform();
    }

    private handleImports() {
        this.program = ts.createProgram([__ENTRYPOINT__], {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.CommonJS,
            allowJs: false,
        });

        this.sourceFile = this.program.getSourceFile(__ENTRYPOINT__)!;

        this.newFiles.forEach((filePath) => {
            const clazzName = this.getClassName(filePath);
            const transform = NamespaceImportTransformer.transformer(
                clazzName,
                this.getSafelyImportPath(filePath),
            );

            this.transformer.push(transform);
        });
    }

    private handleBootstrap() {
        this.newFiles.forEach((filePath) => {
            const clazzName = this.getClassName(filePath);

            const target = clazzName.toLocaleLowerCase();

            if (target.includes("controller")) {
                this.updateBootstrapFileWithController(clazzName);
            } else if (target.includes("service")) {
                this.updateBootstrapFileWithProvider(clazzName);
            }
        });
    }

    private updateBootstrapFileWithController(clzzName: string) {
        let moduleRef: IStingerModule = {};
        moduleRef = findModuleOption(this.sourceFile)(moduleRef);

        if (!moduleRef.right) {
            throw new Error("moduleOptions을 찾을 수 없습니다.");
        }

        const { right } = moduleRef;

        const controllerProperty = ModuleControllerService.read(
            right as ts.CallExpression,
        );

        if (!controllerProperty) {
            throw new Error("controllers 속성을 찾을 수 없습니다.");
        }

        this.transformer.push(
            PropertyTransformer.controllerTransformer(
                controllerProperty,
                clzzName,
            ),
        );
    }

    private updateBootstrapFileWithProvider(clzzName: string) {
        let moduleRef: IStingerModule = {};
        moduleRef = findModuleOption(this.sourceFile)(moduleRef);

        if (!moduleRef.right) {
            throw new Error("moduleOptions을 찾을 수 없습니다.");
        }

        const { right } = moduleRef;

        const providerProperty = ModuleProviderService.read(
            right as ts.CallExpression,
        );

        if (!providerProperty) {
            throw new Error("providers 속성을 찾을 수 없습니다.");
        }

        this.transformer.push(
            PropertyTransformer.providerTransformer(providerProperty, clzzName),
        );
    }

    private transform() {
        const transformationResult = ts.transform(
            this.sourceFile,
            this.transformer,
            this.program.getCompilerOptions(),
        );

        const printer = ts.createPrinter();

        const result = printer.printNode(
            ts.EmitHint.Unspecified,
            transformationResult.transformed[0],
            this.sourceFile,
        );

        const bootstrapFilePath2 = path.resolve(
            __dirname,
            "..",
            "..",
            "packages",
            "example",
            "bootstrap.ts",
        );

        fs.writeFileSync(bootstrapFilePath2, result, "utf8");
    }

    private getClassName(importPath: string) {
        return path.basename(importPath, ".ts");
    }

    private getSafelyImportPath(importPath: string) {
        const rootPath = path
            .resolve(process.cwd(), "packages", "example")
            .replace(/\\/g, "/");

        const imports = importPath
            .replace(/\\/g, "/")
            .replace(rootPath, "")
            .replace(".ts", "");

        return `.${imports}`;
    }
}
