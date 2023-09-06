/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import inquirer from "inquirer";
import child_process from "child_process";
import { BootstrapTransformer } from "./transformers";

// import { YarnService } from "./helper";
const execa = child_process.spawn;

export class Cli {
    async execute() {
        try {
            const prompt = inquirer.createPromptModule();

            const anwsers = await prompt([
                {
                    type: "list",
                    name: "type",
                    message: "What do you want to create?",
                    choices: [
                        {
                            name: "Controller",
                            value: "controller",
                        },
                        {
                            name: "Transformer",
                            value: "transformer",
                        },
                    ],
                },
            ]);

            if (anwsers.type === "controller") {
                // const service = new YarnService(
                //     {},
                //     (
                //         error: child_process.ExecException | null,
                //         stdout: string,
                //         stderr: string,
                //     ) => {
                //         if (error) {
                //             console.error(stderr);
                //             return;
                //         }
                //         console.log(stdout);
                //         console.log("success");
                //     },
                // );

                // service.run()!.onExit((code, signal) => {
                //     console.log(code, signal);
                // });
                // service.pendingTerminate();

                const shell = execa(
                    `yarn`,
                    ["hygen", "module", "with-prompt"],
                    {
                        stdio: "inherit",
                        shell: true,
                    },
                );

                if (shell) {
                    shell.stdin?.pipe(process.stdin);
                    shell.stdout?.pipe(process.stdout);
                    shell.stderr?.pipe(process.stderr);
                }

                shell.on("close", (code: number) => {
                    if (code === 0) {
                        console.log("Success");
                        // TODO: typescript transformer로 특정 파일에 특정 모듈 추가
                    }
                });
            } else if (anwsers.type === "transformer") {
                const transformer = new BootstrapTransformer();
                await transformer.start();
            }
        } catch (error) {
            console.error(error);
        }
    }
}

const cli = new Cli();
cli.execute()
    .then(() => {
        //
    })
    .catch((error) => {
        console.error(error);
    });
