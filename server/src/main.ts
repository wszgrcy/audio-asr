import { createRootInjector } from 'static-injector';
import { AppService } from './app.service';
import { $localize } from '@cyia/localize';
console.log($localize`运行环境`, process.env.NODE_ENV);
process.env.TZ = 'utc';
const injector = createRootInjector({
  providers: [AppService],
});
const instance = injector.get(AppService);
instance.bootstrap().catch((rej) => {
  console.error(rej);
});
