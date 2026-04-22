import { CommonColumns } from './common';
import { d } from '../drizzle-orm-export';
import { AsrDataType } from '../define/asr';
import { createInsertSchema, createUpdateSchema } from 'drizzle-valibot';
import { userId } from './user-common';
/** 通用 */
export const asrEntity = d.pgTable('asr_entity', {
  ...CommonColumns(),
  title: d.text('title').notNull(),
  source: d
    .text({
      enum: ['audio-device', 'audio-history', 'audio-file', 'subtitle'],
    })
    .notNull(),
  /** 状态,文件用 */
  status: d.integer().notNull().default(0),
  /** JSON 格式存储配置和块列表 */
  data: d.jsonb().$type<AsrDataType>().notNull(),
  /** 更新来源: local-本地, server-远程 */
  updateSource: d
    .text({
      enum: ['client', 'server'],
    })
    .notNull()
    .default(process.env.WORK_PLATFORM),
  userId: userId(),
});

export const AsrDbDefine = {
  insert: createInsertSchema(asrEntity),
  update: createUpdateSchema(asrEntity),
};
export const ASR_INSERT_Define = createInsertSchema(asrEntity);
