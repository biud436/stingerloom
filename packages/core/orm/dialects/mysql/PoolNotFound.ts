export class PoolNotFound extends Error {
    constructor() {
        super("pool이 존재하지 않습니다.");
    }
}
