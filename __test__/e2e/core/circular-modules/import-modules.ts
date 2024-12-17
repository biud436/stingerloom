import { Module } from "@stingerloom/core";

// 순환 의존성 테스트용 모듈
@Module({
    imports: [],
    controllers: [],
    providers: [],
})
export class CircularModuleA {}

@Module({
    imports: [CircularModuleA],
    controllers: [],
    providers: [],
})
export class CircularModuleB {}

@Module({
    imports: [CircularModuleB],
    controllers: [],
    providers: [],
})
export class CircularModuleAWithCycle {}

@Module({
    imports: [CircularModuleAWithCycle],
    controllers: [],
    providers: [],
})
export class CircularModuleBWithCycle {}

// 직접적인 순환 의존성 테스트용 모듈
@Module({
    imports: [CircularModuleB],
    controllers: [],
    providers: [],
})
export class CircularModuleA_Cycle {}

@Module({
    imports: [CircularModuleA_Cycle],
    controllers: [],
    providers: [],
})
export class CircularModuleB_Cycle {}
