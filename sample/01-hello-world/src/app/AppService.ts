import { Injectable, Logger, OnModuleInit } from '@stingerloom/core';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger('AppService');

  async onModuleInit(): Promise<void> {
    this.logger.info('AppService initialized.');
  }

  hello(): string {
    return 'Hello, Stingerloom!';
  }
}
