import { router, VerifyProcedure } from '@@router';
import * as v from 'valibot';
import { db } from '../../db';
import { AudioGlobalConfigDefine, ExtraUserDataDefine } from '@project/define';
import { eq, and } from 'drizzle-orm';
// import { createCommonRouter } from '../../common-query/query';
// const asr = createCommonRouter(asrEntity, {
//   selectByUser: true,
//   define: AsrDbDefine,
// });
export const UserRouter = router({
  findConfig: VerifyProcedure.mutation(async ({ ctx, input }) => {
    return db
      .select({ config: AudioGlobalConfigDefine })
      .from(AudioGlobalConfigDefine)
      .leftJoin(
        ExtraUserDataDefine,
        and(
          eq(
            AudioGlobalConfigDefine.id,
            ExtraUserDataDefine.audioGlobalConfigId,
          ),
          eq(ExtraUserDataDefine.id, ctx.user.id),
        ),
      )
      .limit(1)
      .then((list) => {
        return list[0].config;
      });
  }),
  syncConfig: VerifyProcedure.input(v.any()).mutation(
    async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const configData = {
        config: input.config,
        updateSource: 'server' as const,

        id: undefined,
      };

      await db.transaction(async (tx) => {
        const [userConfig] = await tx
          .select()
          .from(ExtraUserDataDefine)
          .where(eq(ExtraUserDataDefine.id, userId))
          .limit(1);
        const configId = userConfig
          ? (userConfig.audioGlobalConfigId ?? undefined)
          : undefined;
        configData.id = configId as any;

        const [newConfig] = await tx
          .insert(AudioGlobalConfigDefine)
          .values(configData)
          .onConflictDoUpdate({
            target: AudioGlobalConfigDefine.id,
            set: configData,
          })
          .returning();

        console.log(newConfig);
        if (!configId) {
          await tx.insert(ExtraUserDataDefine).values({
            audioGlobalConfigId: newConfig.id,
            id: userId,
          });
        }
      });
    },
  ),
});
