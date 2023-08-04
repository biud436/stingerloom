import { DataSourceOptions } from "typeorm";

/**
 * 별도의 옵션 객체로 추상화되어야 합니다.
 * DBConnectionOption은 미래 벌어질 추상화 작업에 대비하기 위한 타입입니다.
 */
export type DBConnectionOption = DataSourceOptions;
