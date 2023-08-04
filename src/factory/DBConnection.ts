import { DataSource } from "typeorm";

/**
 * @class DBConnection
 * @description
 * 현재 TypeORM에 강하게 결합되어있습니다.
 * 각 ORM에 대한 공통 요소 추상화를 해야 하지만 아이디어가 떠오를 때까지 상위 클래스를 통해 방향성만 잡고 있습니다.
 * 결국 이 클래스는 각 ORM에 대한 서비스를 중개하는 역할을 해야 합니다.
 */
export class DBConnection extends DataSource {}
