import { Module } from "@stingerloom/core";
import { AppController } from "./AppController";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
