import { IFactory } from "./IFactory";
import { DataSourceFactory } from "./DataSourceFactory";

import { DataSourceOptions } from "typeorm";

/**
 * @name DatabaseFactory
 * @description
 * 데이터베이스 연결을 생성하는 팩토리 클래스입니다.
 */
class DatabaseFactory implements IFactory<DataSourceFactory> {
  /**
   * DB 연결 객체를 생성합니다.
   * 추후 생명 주기(싱글턴, 일회성 생성)를 관리하기 위해 팩토리 클래스 내부에서 생성하고 있습니다.
   * 호출 시, 매번 새로운 객체가 생성됩니다.
   * 하지만 기본적으로는 싱글턴(메타데이터 저장)이 되어야 합니다.
   */
  public create(options: DataSourceOptions) {
    return DataSourceFactory.create(options);
  }
}

export const databaseFactory = new DatabaseFactory();
