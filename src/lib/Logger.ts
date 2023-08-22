import { EventEmitter } from "events";
import chalk from "chalk";

export class LoggerState {
    private state = "[Logger]";

    public info() {
        this.state = "[INFO]";
    }

    public warn() {
        this.state = "[WARN]";
    }

    public error() {
        this.state = "[ERROR]";
    }

    public get() {
        return this.state;
    }

    public toString() {
        return this.state;
    }
}

export class Logger extends EventEmitter {
    private readonly state: LoggerState = new LoggerState();
    static NormalColor = chalk.yellow;
    static WarnColor = chalk.red;
    static ErrorColor = chalk.red;
    static DefaultColor = chalk.white;

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
}
