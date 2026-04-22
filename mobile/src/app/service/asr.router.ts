import { t } from '../api';
import * as v from 'valibot';
import { backendTrpcClient$$ } from '../trpc/server-client';
import { db } from '../db';
import { asrEntity } from '../entity';
import { desc, eq, count } from 'drizzle-orm';
import { asrToSRT, SRTGenerateOptions } from '../util/asr-to-srt';
import { isString, merge } from 'es-toolkit';
import {
  AllAudioConfig,
  ASRType,
  FileAudioConfig,
} from '@@ref/define/src/define/asr-config';
import { ChunkListItem } from '@@ref/define/src/define/asr';
import dayjs from 'dayjs';

export function getFileTimestamp() {
  return dayjs(new Date()).format('YYYY-MM-DD HH-mm-ss');
}

export const ASRRouter = t.router({
  save: t.procedure
    .input(
      v.object({
        source: ASRType,
        config: v.custom<v.InferOutput<typeof AllAudioConfig>>(Boolean),
        title: v.optional(v.string()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [result] = await db
        .insert(asrEntity)
        .values({
          title: input.title ?? `${getFileTimestamp()}`,
          source: input.source,
          data: { config: input.config, chunkList: [] },
          updateSource: 'client',
        })
        .returning();
      return result;
    }),
  findDevice: t.procedure.query(async ({ input, ctx }) => {
    const [result] = await db
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.source, 'audio-device'))
      .orderBy(desc(asrEntity.updatedAt))
      .limit(1);

    return result;
  }),

  saveChunk: t.procedure
    .input(v.object({ id: v.string(), data: v.any() }))
    .query(async ({ input, ctx }) => {
      const [item] = await db
        .select()
        .from(asrEntity)
        .where(eq(asrEntity.id, input.id))
        .orderBy(desc(asrEntity.updatedAt))
        .limit(1);
      item.data ??= { config: undefined, chunkList: [] };
      item.data.chunkList ??= [];
      const chunkList = item.data.chunkList;
      const chunkIndex = chunkList.findLastIndex(
        (item: any) => item.id === input.data.id,
      );
      if (chunkIndex === -1) {
        chunkList.push(input.data);
      } else {
        chunkList[chunkIndex] = input.data;
      }
      await db
        .update(asrEntity)
        .set({ data: item.data, updateSource: 'client' })
        .where(eq(asrEntity.id, item.id));
    }),
  archiveChunk: t.procedure
    .input(v.object({ data: v.any(), id: v.string() }))
    .query(async ({ input, ctx }) => {
      const [item] = await db
        .select()
        .from(asrEntity)
        .where(eq(asrEntity.id, input.id))
        .limit(1);
      item.data ??= { config: undefined, chunkList: [] };
      item.data.chunkList ??= [];
      const chunkList = item.data.chunkList;

      const findIndex = chunkList.findIndex(
        (item: any) => item.id === input.data.id,
      );
      if (findIndex === -1) {
        return;
      }
      const list = chunkList.slice(0, findIndex + 1);
      const restList = chunkList.slice(findIndex + 1);
      item.data.chunkList = restList;
      await db
        .update(asrEntity)
        .set({ data: item.data, updateSource: 'client' })
        .where(eq(asrEntity.id, input.id));
      await db.insert(asrEntity).values({
        title: `[归档]${getFileTimestamp()}`,
        source: 'audio-history',
        data: { config: item.data.config, chunkList: list },
        updateSource: 'client',
      });
    }),
  find: t.procedure
    .input(v.object({ take: v.number(), skip: v.number() }))
    .query(async ({ input, ctx }) => {
      const countQuery = db.select({ count: count() }).from(asrEntity);
      const listQuery = db
        .select()
        .from(asrEntity)
        .orderBy(desc(asrEntity.updatedAt));
      const list = await listQuery.limit(input.take).offset(input.skip);
      const res = await countQuery;

      return {
        list,
        count: res[0].count,
      };
    }),
  findOne: t.procedure.input(v.string()).query(async ({ input, ctx }) => {
    const [result] = await db
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.id, input))
      .limit(1);
    return result!;
  }),
  remove: t.procedure.input(v.string()).query(async ({ input, ctx }) => {
    await db.delete(asrEntity).where(eq(asrEntity.id, input));
    (await backendTrpcClient$$())().asr.remove.mutate({ id: input });
  }),
  parseFileToText: t.procedure
    .input(
      v.object({
        config: FileAudioConfig,
        id: v.string(),
        file: v.optional(v.file()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [result] = await db
        .select()
        .from(asrEntity)
        .where(eq(asrEntity.id, input.id))
        .limit(1);
      const formData = new FormData();
      // formData.set('id', input.id);
      delete (result as any).createdAt;
      delete (result as any).updatedAt;
      formData.set('init', JSON.stringify(result));
      // todo 两个,一个是根据路径,一个是根据file
      // todo 应该是electron请求后端
      formData.set('file', input.file);
      try {
        console.log('准备请求', result);

        return await (
          await backendTrpcClient$$()
        ).fileAudio.parse.mutate(formData);
      } finally {
        // todo 应该集中保存并删除
        // fs.promises.rm(input.config.filePath!, {
        //   recursive: true,
        //   force: true,
        // });
      }
    }),

  /** 一个项目中可能有多个对话, */
  appendChunkItem: t.procedure
    .input(v.object({ id: v.string(), value: ChunkListItem }))
    .query(async ({ input, ctx }) => {
      const [item] = await db
        .select()
        .from(asrEntity)
        .where(eq(asrEntity.id, input.id))
        .limit(1);
      item.data!.chunkList.push(input.value);
      await db
        .update(asrEntity)
        .set({ data: item.data, updateSource: 'client' })
        .where(eq(asrEntity.id, item.id));
    }),
  setChunkItemTimeEnd: t.procedure
    .input(
      v.object({
        id: v.string(),
        chunkId: v.string(),
        value: v.number(),
        end: v.optional(v.boolean()),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [item] = await db
        .select()
        .from(asrEntity)
        .where(eq(asrEntity.id, input.id))
        .limit(1);

      const index = item.data!.chunkList.findLastIndex(
        (item) => item.id === input.chunkId,
      );
      if (index === -1) {
        return;
      }
      const lastChunk = item.data!.chunkList[index];
      if (
        input.end &&
        lastChunk &&
        (lastChunk.status === 0 || lastChunk.status === undefined)
      ) {
        item.data!.chunkList.pop();
      } else {
        lastChunk.range![1] = input.value;
        lastChunk.status = 2;
      }
      await db
        .update(asrEntity)
        .set({ data: item.data, updateSource: 'client' })
        .where(eq(asrEntity.id, item.id));
    }),
  /** item id和chunkid */
  editChunkItem: t.procedure
    .input(v.object({ id: v.string(), value: v.partial(ChunkListItem) }))
    .query(async ({ input, ctx }) => {
      const [item] = await db
        .select()
        .from(asrEntity)
        .where(eq(asrEntity.id, input.id))
        .limit(1);

      const index = item.data!.chunkList.findLastIndex(
        (item) => item.id === input.value.id,
      );
      item.data!.chunkList[index] = merge(
        item.data!.chunkList[index],
        input.value,
      );
      if (item.data!.chunkList[index].status !== 2) {
        item.data!.chunkList[index].status = 1;
      }
      await db
        .update(asrEntity)
        .set({ data: item.data, updateSource: 'client' })
        .where(eq(asrEntity.id, item.id));
    }),
  saveByRemote: t.procedure.input(v.any()).query(async ({ input, ctx }) => {
    // todo 同步
    delete (input as any).createdAt;
    delete (input as any).updatedAt;
    delete (input as any).userId;
    await db
      .update(asrEntity)
      .set({
        ...input,
        updateSource: 'server',
      })
      .where(eq(asrEntity.id, input.id));
  }),
  sync: t.procedure
    .input(v.object({ id: v.string() }))
    .query(async ({ input, ctx }) => {
      const [item] = await db
        .select()
        .from(asrEntity)
        .where(eq(asrEntity.id, input.id))
        .limit(1);
      await (
        await backendTrpcClient$$()
      ).asr.sync.mutate({
        ...item,
        updateSource: 'server',
      });
    }),
  exportSrt: t.procedure
    .input(
      v.object({
        id: v.string(),
        options: v.custom<Partial<SRTGenerateOptions>>(Boolean),
      }),
    )
    .query(async ({ input, ctx }) => {
      // todo 需要注入器
      const [entityItem] = await db
        .select()
        .from(asrEntity)
        .where(eq(asrEntity.id, input.id))
        .limit(1);
      const dir = '/tmp'; // 临时，需要通过 SaveFileService
      if (!isString(dir)) {
        return;
      }
      // todo 临时
      const list = asrToSRT(entityItem.data['chunkList'], {
        ...input.options,
        originLanguage:
          entityItem.data.config!.device?.input!['audio']['language'] ??
          entityItem.data.config!.device?.output!['audio']['language'] ??
          entityItem.data.config!.file!.audio.language,
      });
      for (const item of list) {
        const fileName = `${entityItem.title}_${item.languages.join('_')}.srt`;
        // 临时，需要通过 SaveFileService
      }
    }),
  // todo 有一个同步远程的列表
});
//ffmpeg -i input.mp4 -vn -ar 16000 -ac 2 -f wav output.wav
