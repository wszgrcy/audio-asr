import { createRootInjector } from 'static-injector';
import { AppService } from './app.service';
console.log('运行环境', process.env.NODE_ENV);
process.env.TZ = 'utc';
const injector = createRootInjector({
  providers: [AppService],
});
const instance = injector.get(AppService);
instance.bootstrap().catch((rej) => {
  console.error(rej);
});
