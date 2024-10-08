import { Controller, Get } from '@stingerloom/core';

@Controller('/')
export class AppController {
  @Get('/')
  async hello() {
    return 'Hello, Stingerloom!';
  }
}
