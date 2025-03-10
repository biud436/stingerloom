import {
  AFTER_TRANSACTION_TOKEN,
  BEFORE_TRANSACTION_TOKEN,
  TRANSACTION_COMMIT_TOKEN,
  TRANSACTION_ROLLBACK_TOKEN,
} from "../decorators";

/**
 * @type ITransactionStore
 */
export interface ITransactionStore {
  /**
   * 트랜잭션을 시작하기 전에 실행되는 메소드입니다.
   */
  [BEFORE_TRANSACTION_TOKEN]?: string;

  /**
   * 트랜잭션을 시작한 후에 실행되는 메소드입니다.
   */
  [AFTER_TRANSACTION_TOKEN]?: string;

  /**
   * 트랜잭션이 커밋된 후 실행되는 메소드입니다.
   */
  [TRANSACTION_COMMIT_TOKEN]?: string;

  /**
   * 트랜잭션이 롤백된 후 실행되는 메소드입니다.
   */
  [TRANSACTION_ROLLBACK_TOKEN]?: string;
}
