import { ColumnOption, Column } from "./Column";

/**
 * 프라이머리(PK) 컬럼을 설정합니다.
 * `@PrimaryColumn` 데코레이터로 마킹함으로써 해당 컬럼에 프라이머리 키 (기본키)를 설정할 수 있습니다.
 */
export function PrimaryGeneratedColumn(
    option?: ColumnOption,
): PropertyDecorator {
    return (target, propertyKey) => {
        Column({
            primary: true,
            length: 11,
            nullable: false,
            autoIncrement: true,
            type: "int",
            ...option,
        })(target, propertyKey);
    };
}
