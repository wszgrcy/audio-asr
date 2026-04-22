import { auth } from '@@domain/auth/auth';
import { router, VerifyProcedure } from '@@router';
import * as v from 'valibot';
export const ApikeyRouter = router({
  create: VerifyProcedure.input(v.any()).mutation(async ({ ctx, input }) => {
    return auth.api.createApiKey({ body: { ...input, userId: ctx.user.id } });
  }),
});
