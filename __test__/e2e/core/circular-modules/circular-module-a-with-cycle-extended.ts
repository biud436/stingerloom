import "reflect-metadata";
import { Module } from "@stingerloom/core";
import { CircularModuleBWithCycleExtended } from "./circular-module-b-with-cycle-extended";

@Module({
    imports: [CircularModuleBWithCycleExtended],
    controllers: [],
    providers: [],
})
export class CircularModuleAWithCycleExtended {}
