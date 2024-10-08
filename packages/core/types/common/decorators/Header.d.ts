export declare const HEADER_TOKEN = "HEADER_TOKEN";
export interface HeaderMetadata {
    key: string;
    value: string;
}
export declare function Header(key: string, value: string): MethodDecorator;
