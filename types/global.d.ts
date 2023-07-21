declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            SERVER_PORT: number;
            DB_HOST: string;
            DB_PORT: number;
            DB_NAME: string;
            DB_USER: string;
            DB_PASSWORD: string;
            SESSION_SECRET: string;
            COOKIE_SECRET: string;
        }
    }
}

export {};
