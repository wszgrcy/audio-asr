import * as v from 'valibot';
import { AllAudioConfig } from './asr-config';
import { Range } from './asr-config';
export const ChunkListItem = v.object({
  id: v.string(),
  /** input 麦克风/输入 output 扬声器  */
  type: v.picklist(['input', 'output']),
  range: Range,
  origin: v.optional(v.string()),
  translateText: v.optional(v.record(v.string(), v.any())),
  translateAudio: v.optional(v.record(v.string(), v.any())),
  // -1 失败,0默认,1处理中,2完成
  status: v.optional(v.picklist([-1, 0, 1, 2]), 0),
});
export type ChunkListItemType = v.InferOutput<typeof ChunkListItem>;
export const AsrDataDefine = v.object({
  config: v.optional(AllAudioConfig),
  chunkList: v.array(ChunkListItem),
});

export type AsrDataType = v.InferOutput<typeof AsrDataDefine>;
