import { router, VerifyProcedure } from '@@router';
import * as v from 'valibot';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { AsrDbDefine, asrEntity } from '@project/define';
import { createCommonRouter } from '../../common-query/query';
const asr = createCommonRouter(asrEntity, {
  selectByUser: true,
  define: AsrDbDefine,
});
export const AsrRouter = router({
  sync: VerifyProcedure.input(v.any()).mutation(async ({ ctx, input }) => {
    const content = {
      ...input,
      userId: ctx.user.id,
      updateSource: 'server',
    };
    content.createdAt = new Date(content.createdAt);
    delete content.updatedAt;
    await db.insert(asrEntity).values(content).onConflictDoUpdate({
      target: asrEntity.id,
      set: content,
    });
  }),
  update: VerifyProcedure.input(
    v.custom<{
      id: string;
      [name: string]: any;
    }>((input: any) => {
      return input && 'id' in input;
    }),
  ).mutation(async ({ ctx, input }) => {
    delete input['userId'];
    delete input['createdAt'];
    delete input['updatedAt'];
    return db
      .update(asrEntity)
      .set({
        ...input,
        updateSource: 'server',
      })
      .where(
        and(eq(asrEntity.id, input.id), eq(asrEntity.userId, ctx.user.id)),
      );
  }),
  findList: asr.findList,
  remove: asr.remove,
});
