import { Module } from '@stingerloom/core';
import { AppController } from './AppController';
import { AppService } from './AppService';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
