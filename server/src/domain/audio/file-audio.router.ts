import { router, VerifyProcedure } from '@@router';
import * as v from 'valibot';
import { FileAudioService } from './file.service';
import { db } from '../../db';
import { asrEntity } from '@project/define';
import { eq } from 'drizzle-orm';
import { merge } from 'es-toolkit';
import { promise as fastq } from 'fastq';

export const FileAudioRouter = router({
  parse: VerifyProcedure.input(v.instance(FormData)).mutation(
    async ({ ctx, input }) => {
      const init = JSON.parse(input.get('init') as string);
      init.userId = ctx.user.id;
      const result = await db
        .insert(asrEntity)
        .values(init)
        .onConflictDoUpdate({ target: asrEntity.id, set: init })
        .returning();
      const service = ctx.injector.get(FileAudioService);

      const queue = fastq(async (event: { type: string; value?: any }) => {
        const [result] = await db
          .select()
          .from(asrEntity)
          .where(eq(asrEntity.id, init.id))
          .limit(1);
        if (event.type === 'origin') {
          result.data['chunkList'] = event.value;
        } else if (event.type === 'translate') {
          const index = result.data['chunkList'].findIndex(
            (item: any) => item.id === event.value.id,
          );
          result.data['chunkList'][index] = merge(
            result.data['chunkList'][index],
            event.value,
          );
        } else if (event.type === 'end') {
          return await db
            .update(asrEntity)
            .set({ status: 2 })
            .where(eq(asrEntity.id, init.id));
        } else if (event.type === 'error') {
          // todo 如何反馈?
          return;
        }
        return await db
          .update(asrEntity)
          .set({ data: result.data, status: 1 })
          .where(eq(asrEntity.id, init.id));
      }, 1);

      service
        .processBuffer(input, result[0].data.config! as any)
        .then((value) => {
          value.subscribe({
            next: (event) => {
              queue.push(event);
            },
            complete: () => {
              queue.push({ type: 'end' });
            },
          });
        });
    },
  ),
});
