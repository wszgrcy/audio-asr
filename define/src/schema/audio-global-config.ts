import { d } from '../drizzle-orm-export';
import { CommonColumns } from './common';
import { createSelectSchema } from 'drizzle-valibot';
import * as v from 'valibot';
import { CommonConfigDefine } from '../define/common-global.config';
/** 通用 */
export const AudioGlobalConfigDefine = d.pgTable('audio_global_config', {
  ...CommonColumns(),
  name: d.text().default('default'),
  description: d.text(),
  config: d.jsonb().$type<v.InferOutput<typeof CommonConfigDefine>>().notNull(),
  /** 更新来源: local-本地, server-远程 */
  updateSource: d
    .text({
      enum: ['client', 'server'],
    })
    .notNull()
    .default(process.env.WORK_PLATFORM),
  // userId: userId(),
});
export const AudioGlobalConfig = createSelectSchema(AudioGlobalConfigDefine);
export type AudioGlobalConfigInput = v.InferOutput<typeof AudioGlobalConfig>;
export type AudioGlobalConfigOutput = v.InferOutput<typeof AudioGlobalConfig>;
