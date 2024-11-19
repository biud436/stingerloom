/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from "events";
import { Injectable } from "./decorators";
import { OnModuleInit } from "./OnModuleInit";

/**
 * @class EventService
 * @description
 * Lazy loading이 필요한 서비스를 초기화하거나 (예: 데이터베이스 연결 후 Repository 생성 같은 작업)
 * 두 객체 또는 여러 객체를 커플링 없이 통신하려는 경우 사용됩니다.
 */
@Injectable()
export class EventService extends EventEmitter implements OnModuleInit {
    async onModuleInit(): Promise<void> {
        this.emit("init");
    }
}
