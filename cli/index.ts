/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import inquirer from "inquirer";
import { spawn } from "child_process";
import { BootstrapTransformer } from "./transformers";
import fs from "fs";
import path from "path";
import { Logger } from "@stingerloom/common";

/**
 * @class Cli
 * @author biud436
 * @description
 * Cli 클래스는 새로운 컨트롤러, 서비스, 모듈을 자동으로 생성합니다.
 * 새로 생성된 파일을 자동으로 의존성으로 주입합니다.
 */
export class Cli {
    /**
     * @property oldVisitedFiles
     * @description 기존 파일
     */
    private oldVisitedFiles: Map<string, boolean>;

    /**
     * @property newVisitedFiles
     * @description 새로운 파일
     */
    private newVisitedFiles: Map<string, boolean>;

    /**
     * @property logger
     * @description 로그 출력
     */
    private readonly logger = new Logger(Cli.name);

    constructor() {
        this.oldVisitedFiles = new Map();
        this.newVisitedFiles = new Map();
    }

    /**
     * 터미널을 실행합니다.
     */
    async execute() {
        try {
            this.oldVisitedFiles = await this.readAllFiles();

            const anwsers = await this.startTerminal();
            const anwsersType = anwsers.type;

            if (anwsersType === "resource") {
                await this.executeInquirer();
                await this.executeTransformer();
            }
        } catch (error: any) {
            this.logger.error(error);
        }
    }

    /**
     * 타입스크립트 변환 작업을 수행합니다.
     */
    private async executeTransformer() {
        this.newVisitedFiles = await this.readAllFiles();
        const newFiles = await this.catchNewFiles();

        for (const file of newFiles) {
            this.logger.info(file);
        }

        const transformer = new BootstrapTransformer(newFiles);
        await transformer.start();
    }

    /**
     * 새롭게 추가된 파일을 찾습니다.
     *
     * @returns
     */
    private async catchNewFiles() {
        const newFiles: string[] = [];

        for (const [file] of this.newVisitedFiles) {
            if (!this.oldVisitedFiles.has(file)) {
                newFiles.push(file);
            }
        }

        return newFiles;
    }

    /**
     * 새로운 파일을 찾습니다.
     *
     * @returns
     */
    private async readAllFiles() {
        const visited = new Map<string, boolean>();
        await this.visitDirectory(
            path.join(__dirname, "..", "packages"),
            visited,
        );

        return visited;
    }

    /**
     * 터미널에서 선택한 값을 반환합니다.
     *
     * @returns
     */
    private startTerminal() {
        const prompt = inquirer.createPromptModule();

        return prompt([
            {
                type: "list",
                name: "type",
                message: "What do you want to create?",
                choices: [
                    {
                        name: "Resource",
                        value: "resource",
                    },
                ],
            },
        ]);
    }

    /**
     * 모든 파일을 읽습니다.
     *
     * @param dir
     * @param visited
     */
    private async visitDirectory(dir: string, visited: Map<string, boolean>) {
        const files = await fs.promises.readdir(dir);

        for (const file of files) {
            const filename = path.join(dir, file);
            const isDir = (await fs.promises.lstat(filename)).isDirectory();

            if (visited.has(filename)) {
                continue;
            }

            if (isDir) {
                await this.visitDirectory(filename, visited);
            } else {
                visited.set(filename, true);
            }
        }
    }

    /**
     * inquirer를 실행합니다.
     *
     * @returns
     */
    private executeInquirer() {
        return new Promise((resolve, reject) => {
            const shell = spawn(`yarn`, ["hygen", "module", "with-prompt"], {
                stdio: "inherit",
                shell: true,
            });

            if (shell) {
                process.stdout.on("end", (data) => {
                    console.log(`stdout: ${data}`);
                });

                shell.on("close", (code: number) => {
                    if (code === 0) {
                        this.logger.info("Success");

                        resolve(true);
                    }
                });

                shell.on("error", (error: any) => {
                    console.error(error);

                    reject(error);
                });
            }
        });
    }
}

const cli = new Cli();
cli.execute()
    .then(() => {})
    .catch((error) => {
        console.error(error);
    });
