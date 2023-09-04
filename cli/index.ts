/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import inquirer from "inquirer";
import child_process from "child_process";

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
                            name: "Module",
                            value: "module",
                        },
                    ],
                },
            ]);

            if (anwsers.type === "controller") {
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
