import { ClazzType } from "../RouterMapper";
export declare const AUTO_WIRED_TOKEN: unique symbol;
export interface AutoWiredMetadata {
    target: ClazzType<any>;
    name: string;
    type: any;
}
/**
 * Autowired 데코레이터
 *
 * `@Autowired()`는 생성된 인스턴스의 멤버 변수에 의존성을 주입합니다.
 *
 * Autowired는 Private fields (#으로 시작하는 field)에는 사용할 수 없습니다.
 *
 * Autowired는 생성자 주입이 끝나면 주입됩니다 (클래스 생성자가 호출된 이후에 바로 주입됩니다).
 *
 * 또한 Controller나 Injectable로 마킹한 클래스에서만 사용할 수 있습니다.
 */
export declare function Autowired(): PropertyDecorator;
