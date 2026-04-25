import { $localize } from '@cyia/localize';
import * as v from 'valibot';
import { asControl } from '@piying/valibot-visit';
import { actions, disableWhen, setComponent } from '@piying/view-angular-core';
import { LanguageList } from '../const/language';
import { map } from 'rxjs';
import { localeKey } from '../const/locale';
const STR_DEFINE = v.string();
export const ASRType = v.picklist([
  'audio-device',
  'audio-history',
  'audio-file',
  'subtitle',
]);
export const Range = v.optional(v.tuple([v.number(), v.number()]));

const AsrModelList = [{ label: $localize`whisper`, value: 'whisper' }];

export const TranslateConfigValueDefine = v.object({
  baseURL: v.pipe(STR_DEFINE, v.title($localize`地址`)),
  apiKey: v.pipe(v.optional(STR_DEFINE), v.title('apiKey')),
  model: v.pipe(STR_DEFINE, v.title($localize`模型`)),
  target: v.pipe(
    v.optional(v.array(STR_DEFINE)),
    asControl(),
    setComponent('select'),
    actions.props.patch({
      multiple: true,
      options: LanguageList.map((item) => {
        return { label: item[localeKey], value: item.value };
      }),
    }),
    v.title($localize`翻译为`),
  ),
});
export type TranslateConfigValueType = v.InferOutput<
  typeof TranslateConfigValueDefine
>;
export const TranslateConfigDefine = v.object({
  enable: v.pipe(v.optional(v.boolean(), false), v.title($localize`自动翻译`)),
  value: v.pipe(
    v.optional(TranslateConfigValueDefine),
    disableWhen({
      listen: (fn) => {
        return fn({ list: [['..', 'enable']] }).pipe(
          map(({ list: [value] }) => !value),
        );
      },
    }),
  ),
});
export const AudioConfigDefine = v.object({
  baseURL: v.pipe(
    v.optional(STR_DEFINE, 'http://whisper:8080/v1'),
    v.title($localize`地址`),
  ),
  apiKey: v.pipe(v.optional(STR_DEFINE), v.title('apiKey')),
  model: v.pipe(
    v.optional(STR_DEFINE, AsrModelList[0].value),
    // setComponent('select'),
    // actions.props.patch({
    //   options: AsrModelList,
    // }),

    v.title($localize`模型`),
  ),
  language: v.pipe(
    v.optional(STR_DEFINE, LanguageList[0].value),
    setComponent('select'),
    actions.props.patch<string>({
      options: LanguageList.map((item) => {
        return { label: item[localeKey], value: item.value };
      }),
    }),
    v.title($localize`音频语言`),
  ),
});
export const AudioToTextDefine = v.object({
  audio: AudioConfigDefine,
  translate: TranslateConfigDefine,
});
export const DeviceInputOutputDefine = v.object({
  input: v.pipe(
    v.optional(AudioToTextDefine),
    v.title($localize`麦克风`),
    actions.wrappers.patch(['fieldset']),
    actions.class.top('bg-base-200 border-base-300 rounded-box border p-4'),
  ),
  output: v.pipe(
    v.optional(AudioToTextDefine),
    v.title($localize`扬声器`),
    actions.wrappers.patch(['fieldset']),
    actions.class.top('bg-base-200 border-base-300 rounded-box border p-4'),
  ),
});

// DeviceConfigDefine
export const DeviceConfigDefine = v.object({
  device: v.optional(DeviceInputOutputDefine),
});

export const StreamPartDefine = v.object({
  timeChunk: v.pipe(
    v.optional(v.number(), 0.2),
    v.title($localize`时间切片(秒)`),
    v.description($localize`每隔多长时间发送一次数据`),
  ),
  redemptionMs: v.pipe(
    v.optional(v.number(), 600),
    v.title($localize`静音容忍(毫秒)`),
    v.description($localize`检测到静音多长算一句话`),
  ),
  maxSplitTime: v.pipe(
    v.optional(v.number(), 5),
    v.title($localize`最大分割时间(秒)`),
    v.description($localize`一句话最大的持续时间`),
  ),
});
export const StreamAudioConfig = v.intersect([
  StreamPartDefine,
  DeviceConfigDefine,
]);
export type StreamChunkItemType = v.InferInput<typeof StreamAudioConfig>;
export type StreamChunkItemOutputType = v.InferOutput<typeof StreamAudioConfig>;
/** @deprecated 好像没用了 */
export const FilePartDefine = v.object({
  filePath: v.pipe(
    v.string(),
    v.title($localize`文件`),
    actions.wrappers.patch(['file-input']),
    actions.props.patchAsync({
      clicked: (field) => () => {
        return field.context['getMediaFilePath']();
      },
    }),
  ),
  file: v.optional(AudioToTextDefine),
});
export const FileAudioConfig = v.intersect([FilePartDefine]);
export type FileChunkItemType = v.InferInput<typeof FileAudioConfig>;
export type AudioToTextOutputDefine = v.InferOutput<typeof AudioToTextDefine>;
export const AllAudioConfig = v.intersect([
  FilePartDefine,
  StreamPartDefine,
  DeviceConfigDefine,
]);
export type AllAudioConfigType = v.InferOutput<typeof AllAudioConfig>;
