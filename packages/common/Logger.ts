import { EventEmitter } from "events";
import chalk from "chalk";
import { LoggerState } from "./LoggerState";

/**
 * @class Logger
 * @description
 * Logger 클래스는 서버의 로그를 몇 가지 레벨로 구분하여 출력합니다.
 */
export class Logger extends EventEmitter {
    private readonly state: LoggerState = new LoggerState();
    static NormalColor = chalk.yellow;
    static WarnColor = chalk.red;
    static ErrorColor = chalk.red;
    static DefaultColor = chalk.white;

    public level?: string;

    public info(message: string) {
        this.state.info();
        console.log(
            `${Logger.NormalColor(this.state)} ${Logger.DefaultColor(message)}`,
        );
    }

    public warn(message: string) {
        this.state.warn();
        console.log(
            `${Logger.WarnColor(this.state)} ${Logger.DefaultColor(message)}`,
        );
    }

    public error(message: string) {
        this.state.error();
        console.log(
            `${Logger.ErrorColor(this.state)} ${Logger.DefaultColor(message)}`,
        );
    }

    public debug(message: string) {
        this.state.debug();
        console.log(
            `${Logger.NormalColor(this.state)} ${Logger.DefaultColor(message)}`,
        );
    }

    public fatal(message: string) {
        this.state.fatal();
        console.log(
            `${Logger.ErrorColor(this.state)} ${Logger.DefaultColor(message)}`,
        );
    }

    public trace(message: string) {
        this.state.trace();
        console.log(
            `${Logger.NormalColor(this.state)} ${Logger.DefaultColor(message)}`,
        );
    }

    public slient(message: string) {
        this.state.slient();
        console.log(
            `${Logger.NormalColor(this.state)} ${Logger.DefaultColor(message)}`,
        );
    }

    public child(message: string) {
        this.state.child();
        console.log(
            `${Logger.NormalColor(this.state)} ${Logger.DefaultColor(message)}`,
        );
    }
}
