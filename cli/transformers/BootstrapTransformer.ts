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

import { ModuleProviderService } from "@stingerloom/compiler/visitors/ModuleProviderService";
import ConfigService from "@stingerloom/common/ConfigService";

/**
 * @class BootstrapTransformer
 * @author biud436
 * @description ModuleOptions을 자동으로 수정합니다.
 */
export class BootstrapTransformer {
    private readonly logger: Logger = new Logger(BootstrapTransformer.name);

    /**
     * @property program
     * @description 타입스크립트 프로그램
     */
    private program!: ts.Program;

    /**
     * @property sourceFile
     * @description 타겟 파일
     */
    private sourceFile!: ts.SourceFile;

    /**
     * @property transformer
     * @description 타입스크립트 트랜스포머
     */
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

    private get rootPath() {
        return ConfigService.get<string>("ROOT_PATH");
    }

    /**
     * import 문을 타겟 파일에 추가합니다.
     */
    private handleImports() {
        this.program = ts.createProgram([this.rootPath], {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.CommonJS,
            allowJs: false,
        });

        this.sourceFile = this.program.getSourceFile(this.rootPath)!;

        if (!this.sourceFile) {
            throw new Error("bootstrap.ts 파일을 찾을 수 없습니다.");
        }

        this.newFiles.forEach((filePath) => {
            const clazzName = this.getClassName(filePath);
            const transform = NamespaceImportTransformer.transformer(
                clazzName,
                this.getSafelyImportPath(filePath),
            );

            this.transformer.push(transform);
        });
    }

    /**
     * ModuleOption.merge에 controller, provider를 추가합니다.
     */
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

    /**
     * 새로운 컨트롤러를 추가합니다.
     *
     * @param clzzName
     */
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

    /**
     * 새로운 프로바이더를 추가합니다.
     *
     * @param clzzName
     */
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

    /**
     * 변환 작업을 수행합니다.
     */
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

        fs.writeFileSync(this.rootPath, result, "utf8");
    }

    /**
     * 클래스의 이름을 가져옵니다.
     *
     * @param importPath
     * @returns
     */
    private getClassName(importPath: string) {
        return path.basename(importPath, ".ts");
    }

    /**
     * 파일 경로를 안전하게 처리합니다.
     *
     * @param importPath
     * @returns
     */
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
