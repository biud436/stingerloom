declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            SERVER_PORT: number;
        }
    }
}

export {};
