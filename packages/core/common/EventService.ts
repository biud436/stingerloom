/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from "events";
import { Injectable } from "./decorators";
import { OnModuleInit } from "./OnModuleInit";

@Injectable()
export class EventService extends EventEmitter implements OnModuleInit {
    async onModuleInit(): Promise<void> {
        this.emit("init");
    }
}
