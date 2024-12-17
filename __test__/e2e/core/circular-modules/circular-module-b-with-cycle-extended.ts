import "reflect-metadata";
import { Module } from "@stingerloom/core";
import { CircularModuleAWithCycleExtended } from "./circular-module-a-with-cycle-extended";

@Module({
    imports: [CircularModuleAWithCycleExtended],
    controllers: [],
    providers: [],
})
export class CircularModuleBWithCycleExtended {}
