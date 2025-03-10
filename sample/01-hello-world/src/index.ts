import 'reflect-metadata';
import { MODULE_OPTIONS_TOKEN, ModuleOptions } from '@stingerloom/core';
import { ServerBootstrapApplication } from '@stingerloom/core/bootstrap';

import databaseOption from './config/database';
import { AppModule } from './app/AppModule';

export class CustomServerBootstrapApplication extends ServerBootstrapApplication {
  override beforeStart(): void {
    const appModuleOption = Reflect.getMetadata(
      MODULE_OPTIONS_TOKEN,
      AppModule,
    );

    this.moduleOptions = ModuleOptions.merge(
      {
        controllers: [],
        providers: [],
        configuration: databaseOption,
      },
      appModuleOption,
    );
  }
}

const application = new CustomServerBootstrapApplication();
application.on('start', () => {
  console.log('Server is running on http://localhost:3002');
});

application.start();
