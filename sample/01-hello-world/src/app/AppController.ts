import { Controller, Get } from '@stingerloom/core';
import { AppService } from './AppService';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  async hello() {
    return this.appService.hello();
  }
}
