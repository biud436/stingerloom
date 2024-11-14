export interface HttpError {
    status?: number;
    code?: number;
    message: string;
    stack?: string;
    name?: string;
}
