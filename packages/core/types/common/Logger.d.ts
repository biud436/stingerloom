/// <reference types="node" />
import { EventEmitter } from "events";
import chalk from "chalk";
/**
 * @class Logger
 * @description
 * Logger 클래스는 서버의 로그를 몇 가지 레벨로 구분하여 출력합니다.
 */
export declare class Logger extends EventEmitter {
    private readonly state;
    static NormalColor: chalk.Chalk;
    static WarnColor: chalk.Chalk;
    static ErrorColor: chalk.Chalk;
    static DefaultColor: chalk.Chalk;
    level?: string;
    name?: string | undefined;
    constructor(name?: string);
    print: (level: string) => (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
    debug: (message: string) => void;
    fatal: (message: string) => void;
    trace: (message: string) => void;
    silent: (message: string) => void;
}
