import { t } from '../api';

import * as v from 'valibot';
import { RemoteService } from '../remote/remote.service';
import { TokenStoreService } from '../remote/token-store.service';
import { GlobalConfigService } from '../service/config.service';
export const AuthRouter = t.router({
  emailSignIn: t.procedure
    .input(v.object({ email: v.string(), password: v.string() }))
    .query(async ({ input, ctx }) => {
      const { authClient$$ } = ctx.injector.get(RemoteService);
      return (await authClient$$()).signIn.email(input);
    }),
  getToken: t.procedure.query(async ({ input, ctx }) => {
    const service = ctx.injector.get(TokenStoreService);
    return service.get();
  }),
  signOut: t.procedure.query(async ({ input, ctx }) => {
    const service = ctx.injector.get(TokenStoreService);
    ctx.injector.get(GlobalConfigService).remove();
    await service.remove();
  }),
});
