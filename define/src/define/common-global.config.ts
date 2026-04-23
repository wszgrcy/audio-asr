import * as v from 'valibot';
import { actions } from '@piying/view-angular-core';
import { AudioConfigDefine, TranslateConfigDefine } from './asr-config';

export const CommonConfigDefine = v.object({
  defaultAudioConfig: v.pipe(
    v.optional(AudioConfigDefine),
    v.title('默认音频配置'),
    actions.wrappers.patch(['fieldset']),
    actions.class.top('bg-base-200 border-base-300 rounded-box border p-4'),
  ),

  defalutTranslateConfig: v.pipe(
    v.optional(TranslateConfigDefine),
    v.title('默认翻译配置'),
    actions.wrappers.patch(['fieldset']),
    actions.class.top('bg-base-200 border-base-300 rounded-box border p-4'),
  ),
});
export type CommonConfigType = v.InferOutput<typeof CommonConfigDefine>;
