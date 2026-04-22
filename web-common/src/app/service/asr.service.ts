import { ASR_INSERT_Define, asrEntity } from '@@ref/define/src/schema/asr';
import { inject, Injectable } from '@angular/core';
import { desc, eq, count } from 'drizzle-orm';
import {
  ASRType,
  AllAudioConfig,
  FileAudioConfig,
} from '@@ref/define/src/define/asr-config';
import * as v from 'valibot';
import dayjs from 'dayjs';
import { ChunkListItem } from '@@ref/define/src/define/asr';
import { isString } from 'es-toolkit';
import { RemoteToken } from '../token/remote.token';
import { SaveFileToken } from '../token/save-file.token';
import { db$$ } from './db/db';
import { asrToSRT, SRTGenerateOptions } from '../../util/asr-to-srt';
const saveDefine = v.object({
  source: ASRType,
  config: v.custom<v.InferOutput<typeof AllAudioConfig>>(Boolean),
  title: v.optional(v.string()),
});
const saveChunkInput = v.object({
  id: v.string(),
  data: v.object({ id: v.string(), title: v.string() }),
});
const findInput = v.object({ take: v.number(), skip: v.number() });
const parseFileToTextInput = v.object({
  config: FileAudioConfig,
  id: v.string(),
});
export const appendChunkItemInput = v.object({
  id: v.string(),
  value: ChunkListItem,
});
const setChunkItemTimeEndInput = v.object({
  id: v.string(),
  chunkId: v.string(),
  value: v.number(),
  end: v.optional(v.boolean()),
});
const editChunkItemInput = v.object({
  id: v.string(),
  value: v.partial(ChunkListItem),
});
const saveByRemoteInput = v.any();
const syncInput = v.object({ id: v.string() });
const exportSrtInput = v.object({
  id: v.string(),
  options: v.custom<Partial<SRTGenerateOptions>>(Boolean),
});

export function getFileTimestamp() {
  return dayjs(new Date()).format('YYYY-MM-DD HH-mm-ss');
}
@Injectable({
  providedIn: 'root',
})
export class AsrService {
  // todo 二合一
  async save(i1: v.InferInput<typeof saveDefine>) {
    const input = v.parse(saveDefine, i1);
    const [result] = await db$$()
      .insert(asrEntity)
      .values({
        title: input.title ?? `${getFileTimestamp()}`,
        source: input.source,
        data: { config: input.config, chunkList: [] },
      })
      .returning();
    return result;
  }
  async save2(i1: v.InferInput<typeof ASR_INSERT_Define>) {
    const input = v.parse(ASR_INSERT_Define, i1);
    const [result] = await db$$().insert(asrEntity).values(input).returning();
    return result;
  }
  async findDevice() {
    const [result] = await db$$()
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.source, 'audio-device'))
      .orderBy(desc(asrEntity.updatedAt))
      .limit(1);
    return result;
  }
  // async saveChunk(i1: v.InferInput<typeof saveChunkInput>) {
  //   const input = v.parse(saveChunkInput, i1);
  //   const [item] = await db
  //     .select()
  //     .from(asrEntity)
  //     .where(eq(asrEntity.id, input.id))
  //     .orderBy(desc(asrEntity.updatedAt))
  //     .limit(1);
  //   item.data ??= { config: undefined, chunkList: [] };
  //   item.data.chunkList ??= [];
  //   const chunkList = item.data.chunkList;
  //   const chunkIndex = chunkList.findLastIndex(
  //     (item: any) => item.id === input.data.id,
  //   );
  //   if (chunkIndex === -1) {
  //     chunkList.push(input.data);
  //   } else {
  //     chunkList[chunkIndex] = input.data;
  //   }
  //   await db
  //     .update(asrEntity)
  //     .set({ data: item.data })
  //     .where(eq(asrEntity.id, item.id));
  // }

  async find(i1: v.InferInput<typeof findInput>) {
    const input = v.parse(findInput, i1);
    const countQuery = db$$().select({ count: count() }).from(asrEntity);
    const listQuery = db$$()
      .select()
      .from(asrEntity)
      .orderBy(desc(asrEntity.updatedAt));
    const list = await listQuery.limit(input.take).offset(input.skip);
    const res = await countQuery;

    return {
      list,
      count: res[0].count,
    };
  }

  async findOne(input: string) {
    const [result] = await db$$()
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.id, input))
      .limit(1);
    return result!;
  }
  async remove(input: string) {
    await db$$().delete(asrEntity).where(eq(asrEntity.id, input));
  }
  async changeTitle(input: { id: string; title: string }) {
    return await db$$()
      .update(asrEntity)
      .set({ title: input.title, updateSource: 'client' })
      .where(eq(asrEntity.id, input.id));
  }
  remote = inject(RemoteToken);
  trpcClient = this.remote.trpcClient;
  /** 处理并发到后端 */
  // async parseFileToText(
  //   i1: v.InferInput<typeof parseFileToTextInput>,
  //   file: File,
  // ) {
  //   const input = v.parse(parseFileToTextInput, i1);
  //   const [result] = await db
  //     .select()
  //     .from(asrEntity)
  //     .where(eq(asrEntity.id, input.id))
  //     .limit(1);
  //   const formData = new FormData();
  //   // formData.set('id', input.id);
  //   delete (result as any).createdAt;
  //   delete (result as any).updatedAt;
  //   formData.set('init', JSON.stringify(result));
  //   formData.set('file', file);
  //   try {
  //     console.log('准备请求', result);

  //     return await (await this.trpcClient)().fileAudio.parse.mutate(formData);
  //   } finally {
  //     // todo 应该集中保存并删除
  //     // fs.promises.rm(validated.config.filePath!, {
  //     //   recursive: true,
  //     //   force: true,
  //     // });
  //   }
  // }
  async setChunkList(input: {
    id: string;
    list: v.InferInput<typeof ChunkListItem>[];
    status: number;
  }) {
    const list = input.list.map((item) => v.parse(ChunkListItem, item));
    const [item] = await db$$()
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.id, input.id))
      .limit(1);

    item.data!.chunkList = list;
    item.status = input.status ?? item.status;
    await db$$()
      .update(asrEntity)
      .set({ data: item.data, status: item.status, updateSource: 'client' })
      .where(eq(asrEntity.id, item.id));
  }
  async appendChunkList(input: {
    id: string;
    list: v.InferInput<typeof ChunkListItem>[];
  }) {
    const list = input.list.map((item) => v.parse(ChunkListItem, item));
    const [item] = await db$$()
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.id, input.id))
      .limit(1);

    item.data!.chunkList.push(...list);
    await db$$()
      .update(asrEntity)
      .set({ data: item.data, updateSource: 'client' })
      .where(eq(asrEntity.id, item.id));
  }
  // async appendChunkItem(i1: v.InferInput<typeof appendChunkItemInput>) {
  //   const input = v.parse(appendChunkItemInput, i1);
  //   const [item] = await db
  //     .select()
  //     .from(asrEntity)
  //     .where(eq(asrEntity.id, input.id))
  //     .limit(1);

  //   item.data!.chunkList.push(input.value);
  //   await db
  //     .update(asrEntity)
  //     .set({ data: item.data })
  //     .where(eq(asrEntity.id, item.id));
  // }

  // async setChunkItemTimeEnd(i1: v.InferInput<typeof setChunkItemTimeEndInput>) {
  //   const input = v.parse(setChunkItemTimeEndInput, i1);
  //   const [item] = await db
  //     .select()
  //     .from(asrEntity)
  //     .where(eq(asrEntity.id, input.id))
  //     .limit(1);

  //   const index = item.data!.chunkList.findLastIndex(
  //     (item) => item.id === input.chunkId,
  //   );
  //   if (index === -1) {
  //     return;
  //   }
  //   const lastChunk = item.data!.chunkList[index];
  //   if (
  //     input.end &&
  //     lastChunk &&
  //     (lastChunk.status === 0 || lastChunk.status === undefined)
  //   ) {
  //     item.data!.chunkList.pop();
  //   } else {
  //     lastChunk.range![1] = input.value;
  //     lastChunk.status = 2;
  //   }
  //   await db
  //     .update(asrEntity)
  //     .set({ data: item.data })
  //     .where(eq(asrEntity.id, item.id));
  // }

  // async editChunkItem(i1: v.InferInput<typeof editChunkItemInput>) {
  //   const input = v.parse(editChunkItemInput, i1);

  //   const [item] = await db
  //     .select()
  //     .from(asrEntity)
  //     .where(eq(asrEntity.id, input.id))
  //     .limit(1);

  //   const index = item.data!.chunkList.findLastIndex(
  //     (item) => item.id === input.value.id,
  //   );
  //   item.data!.chunkList[index] = merge(
  //     item.data!.chunkList[index],
  //     input.value,
  //   );
  //   if (item.data!.chunkList[index].status !== 2) {
  //     item.data!.chunkList[index].status = 1;
  //   }
  //   await db
  //     .update(asrEntity)
  //     .set({ data: item.data })
  //     .where(eq(asrEntity.id, item.id));
  // }
  /** sync download */
  async saveByRemote(input: v.InferOutput<typeof saveByRemoteInput>) {
    // todo 同步
    delete (input as any).createdAt;
    delete (input as any).updatedAt;
    delete (input as any).userId;
    await db$$()
      .update(asrEntity)
      .set({
        ...input,
        updateSource: 'server',
      })
      .where(eq(asrEntity.id, input.id));
  }
  /** sync update */
  // async sync(i1: v.InferInput<typeof syncInput>) {
  //   const input = v.parse(syncInput, i1);
  //   const [item] = await db
  //     .select()
  //     .from(asrEntity)
  //     .where(eq(asrEntity.id, input.id))
  //     .limit(1);
  //   await (await this.trpcClient)().asr.sync.mutate(item);
  // }
  #saveFile = inject(SaveFileToken);
  async exportSrt(i1: v.InferInput<typeof exportSrtInput>) {
    const input = v.parse(exportSrtInput, i1);
    const [entityItem] = await db$$()
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.id, input.id))
      .limit(1);
    const dir = await this.#saveFile.getDir();
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
      const file = new File([item.value], fileName);
      await this.#saveFile.save(file, { dir: dir });
    }
  }
  async syncRemoteList() {
    const result = await (
      await this.trpcClient
    )().asr.findList.mutate({ skip: 0, length: 9999 });
    await db$$().transaction(async (tx) => {
      for (const item of result[1]) {
        const newItem = {
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        };
        await tx
          .insert(asrEntity)
          .values(newItem)
          .onConflictDoUpdate({ target: asrEntity.id, set: newItem });
      }
    });
  }
  async archiveChunk(i1: v.InferInput<typeof saveChunkInput>) {
    const input = v.parse(saveChunkInput, i1);
    const [item] = await db$$()
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
    await db$$()
      .update(asrEntity)
      .set({ data: item.data, updateSource: 'client' })
      .where(eq(asrEntity.id, input.id));
    await db$$()
      .insert(asrEntity)
      .values({
        title: input.data.title,
        source: 'audio-history',
        data: { config: item.data.config, chunkList: list },
      });
  }
  async deleteChunkItem(input: { id: string; chunkId: string }) {
    const [item] = await db$$()
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.id, input.id))
      .limit(1);

    const index = item.data!.chunkList.findIndex(
      (item) => item.id === input.chunkId,
    );
    item.data!.chunkList.splice(index, 1);
    await db$$()
      .update(asrEntity)
      .set({ data: item.data, updateSource: 'client' })
      .where(eq(asrEntity.id, item.id));
  }
}
