import { t } from '../api';
import * as v from 'valibot';
import { GlobalConfigService } from '../service/config.service';
import { ConnectStoreService } from '../service/store/connect.store';
export const ConfigRouter = t.router({
  connect: t.router({
    find: t.procedure.query(async ({ ctx }) => {
      return ctx.injector.get(ConnectStoreService).get();
    }),
    save: t.procedure.input(v.any()).query(async ({ input, ctx }) => {
      return ctx.injector.get(ConnectStoreService).set(input);
    }),
  }),
  audioConfig: t.router({
    find: t.procedure.query(async ({ ctx }) => {
      return ctx.injector.get(GlobalConfigService).get();
    }),
    save: t.procedure.input(v.any()).query(async ({ input, ctx }) => {
      return ctx.injector.get(GlobalConfigService).set(input);
    }),
  }),
});
