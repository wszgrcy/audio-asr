import { router, RootProcedure } from '@@router';

import * as v from 'valibot';
import { db } from '../../db';
import { eq, sql } from 'drizzle-orm';
import { DB_TYPE } from '@config';
export const FindOptionDefine = v.object({
  skip: v.number(),
  length: v.number(),
  order: v.optional(v.array(v.object({ key: v.string(), type: v.string() }))),
  query: v.optional(v.record(v.string(), v.any())),
});
export function createSuperRouter<TTable extends DB_TYPE['table']>(
  table: TTable,
) {
  return router({
    findList: RootProcedure.input(FindOptionDefine).mutation(
      async ({ ctx, input }) => {
        // todo 性能?
        let qb = db.select().from(table as DB_TYPE['table']);
        let count$$ = db
          .select({ count: sql`count(*)` })
          .from(table as DB_TYPE['table']);

        if (input.query) {
          for (const key in input.query) {
            const item = input.query[key];
            qb = qb.where(eq((table as any)[key], item)) as any;
            count$$ = count$$.where(eq((table as any)[key], item)) as any;
          }
        }
        if (input.order) {
        }
        const result = (await qb.offset(input.skip).limit(input.length)) as any;
        const count = await count$$;
        return [count[0].count as number, result] as const;
      },
    ),
  });
}
