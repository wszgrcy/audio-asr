import * as v from 'valibot';
import { actions, NFCSchema, setComponent } from '@piying/view-angular-core';
import { map } from 'rxjs';

import { CommonConfigDefine } from '@@ref/define/src/define/common-global.config';
const ffmpegConfg = v.object({
  ffmpeg: v.pipe(
    v.optional(
      v.object({
        url: v.pipe(
          // https://github.com/BtbN/FFmpeg-Builds/releases
          v.optional(
            v.string(),
            `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-win64-gpl-8.1.zip`,
          ),
          v.title('ffmpeg下载地址'),
          v.description(
            `linux下使用: https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-linux64-gpl-8.1.tar.xz`,
          ),
        ),
        dir: v.pipe(
          v.optional(v.string(), './plugin/tts/ffmpeg'),
          v.title('保存文件夹'),
        ),
        execPath: v.pipe(
          v.optional(
            v.string(),
            './ffmpeg-n8.0-latest-win64-gpl-8.0/bin/ffmpeg.exe',
          ),
          v.title('执行路径'),
        ),
        __download: v.pipe(
          NFCSchema,
          setComponent('download-button'),
          actions.inputs.patch({ autoUnzip: true }),
          actions.inputs.patchAsync({
            fileList: (field) => {
              const url = field.get(['..', 'url'])!;
              return url.form.control!.valueChanges.pipe(
                map((value) => {
                  return [{ url: value }];
                }),
              );
            },
            dir: (field) => {
              const dir = field.get(['..', 'dir'])!;
              return dir.form.control!.valueChanges;
            },
          }),
        ),
      }),
    ),
    actions.class.bottom('grid gap-2'),
  ),
});
export const GlobalConfigDefine = v.intersect([
  CommonConfigDefine,
  v.object({ platform: v.object({ win32: ffmpegConfg }) }),
]);

export type GlobalConfigType = v.InferOutput<typeof GlobalConfigDefine>;
