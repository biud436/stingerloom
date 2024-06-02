export type IOrderBy<T> = {
    [K in keyof T]: "ASC" | "DESC";
};
