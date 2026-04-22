import { router, VerifyProcedure } from '@@router';
import * as v from 'valibot';
import { and, count, eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { DB_TYPE } from '@config';
export const FindOptionDefine = v.object({
  skip: v.number(),
  length: v.number(),
  order: v.optional(v.array(v.object({ key: v.string(), type: v.string() }))),
  query: v.optional(v.record(v.string(), v.any())),
});
/** @internal */
export function createCommonRouter<
  TTable extends DB_TYPE['table'],
  InsertDefine extends v.BaseSchema<any, any, any>,
  UpdateDefine extends v.BaseSchema<any, any, any>,
>(
  table: TTable,
  option: {
    define: { insert: InsertDefine; update: UpdateDefine };
    selectByUser?: boolean;
  },
) {
  return router({
    customQuery: VerifyProcedure.input(
      v.object({
        templateName: v.string(),
        queryList: v.array(
          v.object({
            keyPath: v.array(v.any()),
            value: v.any(),
          }),
        ),
      }),
    ).mutation(async ({ ctx, input }) => {}),
    findList: VerifyProcedure.input(FindOptionDefine).mutation(
      async ({ ctx, input }) => {
        let qb = db.select().from(table as DB_TYPE['table']);
        let count$$ = db
          .select({ count: count() })
          .from(table as DB_TYPE['table']);
        const andList = [];
        // todo 重构
        if (input.query) {
          for (const key in input.query) {
            const item = input.query[key];
            andList.push(eq((table as any)[key], item));
          }
        }
        if (input.order) {
        }
        if (option.selectByUser) {
          andList.push(eq((table as any)['userId'], ctx.user.id));
        }
        if (andList.length) {
          qb = qb.where(and(...andList)) as any;
          count$$ = count$$.where(and(...andList)) as any;
        }
        const result = (await qb
          .offset(input.skip)
          .limit(input.length)) as any[];
        const countRes = await count$$;
        return [countRes[0].count, result] as const;
      },
    ),
    remove: VerifyProcedure.input(
      v.object({ id: v.union([v.number(), v.string()]) }),
    ).mutation(async ({ ctx, input }) => {
      const andList = [];
      if (option.selectByUser) {
        andList.push(eq((table as any)['userId'], ctx.user.id));
      }
      andList.push(eq((table as any).id, input.id));
      return db.delete(table).where(and(...andList));
    }),
    removeList: VerifyProcedure.input(
      v.array(v.union([v.number(), v.string()])),
    ).mutation(async ({ ctx, input }) => {
      const andList = [];
      if (option.selectByUser) {
        andList.push(eq((table as any)['userId'], ctx.user.id));
      }
      andList.push(inArray((table as any).id, input));
      return db.delete(table).where(and(...andList));
    }),
    insert: VerifyProcedure.input(option.define.insert).mutation(
      async ({ ctx, input }) => {
        const data = input;
        if (option.selectByUser) {
          data.userId = ctx.user.id;
        }
        return db.insert(table).values(data);
      },
    ),
    update: VerifyProcedure.input(option.define.update).mutation(
      async ({ ctx, input }) => {
        const andList = [];
        if (option.selectByUser) {
          andList.push(eq((table as any)['userId'], ctx.user.id));
        }
        andList.push(eq((table as any).id, input.id));
        return db
          .update(table)
          .set(input)
          .where(and(...andList));
      },
    ),
  });
}
