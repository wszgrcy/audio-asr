import * as v from 'valibot';
import { RootProcedure, router } from '@@router';

export class TestService {
  router = router({
    hello: RootProcedure.input(v.any()).mutation(async ({ ctx }) => {
      return 'hello';
    }),
  });
}
