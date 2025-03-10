import { EventEmitter } from "events";
import chalk from "chalk";
import { LoggerState } from "./LoggerState";

type LOG_LEVEL =
  | "info"
  | "warn"
  | "error"
  | "debug"
  | "fatal"
  | "trace"
  | "slient"
  | "child";

/**
 * @class Logger
 * @description
 * Logger 클래스는 서버의 로그를 몇 가지 레벨로 구분하여 출력합니다.
 */
export class Logger extends EventEmitter {
  private readonly state: LoggerState = new LoggerState();
  static NormalColor = chalk.greenBright;
  static WarnColor = chalk.red;
  static ErrorColor = chalk.red;
  static DefaultColor = chalk.white;

  public level?: string;
  public name? = "";

  constructor(name?: string) {
    super();
    this.name = name;
  }

  // 커링 기법을 사용하여 로그 레벨 지정
  print = (level: string) => (message: string) => {
    const processId = process.pid;
    this.state[level as LOG_LEVEL]();
    console.log(
      `${Logger.DefaultColor(processId)} - ${
        level === "warn"
          ? Logger.WarnColor
          : level === "error"
            ? Logger.ErrorColor
            : Logger.NormalColor(this.state)
      }${
        this.name ? ` ${chalk.yellow("[" + this.name + "]")} - ` : ""
      } ${chalk.green(message)} - ${Logger.DefaultColor(
        new Date().toLocaleTimeString(),
      )}`,
    );
  };
  info = this.print("info");
  warn = this.print("warn");
  error = this.print("error");
  debug = this.print("debug");
  fatal = this.print("fatal");
  trace = this.print("trace");
  silent = this.print("slient");
}
