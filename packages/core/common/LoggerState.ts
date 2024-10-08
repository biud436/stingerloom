/**
 * @class LoggerState
 * @description
 * 로거의 상태를 관리하기 위해 정의된 클래스입니다.
 */
export class LoggerState {
    private state = "Logger";

    public info() {
        this.state = "INFO";
    }

    public warn() {
        this.state = "WARN";
    }

    public error() {
        this.state = "ERROR";
    }

    public debug() {
        this.state = "DEBUG";
    }

    public fatal() {
        this.state = "FATAL";
    }

    public trace() {
        this.state = "TRACE";
    }

    public slient() {
        this.state = "SILENT";
    }

    public child() {
        this.state = "CHILD";
    }

    public get() {
        return this.state;
    }

    public toString() {
        return this.state;
    }
}
