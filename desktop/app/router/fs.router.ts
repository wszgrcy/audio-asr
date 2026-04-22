import { dialog, shell } from 'electron';
import { t } from '../api';
import * as v from 'valibot';
import { DownloadService } from '../service/download.service';
import { GlobalConfigService } from '../service/config.service';
import { observable } from '@trpc/server/observable';
import { LogService } from '@cyia/external-call';
import { createMessage2Log } from '@cyia/dl';
import { $ } from 'execa';
import { getTempFilePath } from '../util/get-temp-filepath';
import { DefaultConfigDir } from '../const';
import * as fs from 'fs';
import { isTruthy } from '@@web-common/common';
import path from 'path';

export const FsRouter = t.router({
  readFileContent: t.procedure
    .input(
      v.object({
        filePath: v.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return await fs.promises.readFile(input.filePath, { encoding: 'utf-8' });
    }),
  openPath: t.procedure
    .input(
      v.object({
        filePath: v.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const filePath = path.resolve(DefaultConfigDir!, input.filePath);
      try {
        const stat = await fs.promises.stat(filePath);
        if (stat.isDirectory()) {
          shell.openPath(filePath);
        } else {
          shell.showItemInFolder(filePath);
        }
      } catch (error) {}
    }),
  selectFile: t.procedure
    .input(
      v.optional(
        v.object({
          multiple: v.optional(v.boolean()),
          accept: v.optional(
            v.array(
              v.object({ name: v.string(), extensions: v.array(v.string()) }),
            ),
          ),
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      const ref = await dialog.showOpenDialog({
        properties: [
          'openFile',
          input?.multiple ? ('multiSelections' as const) : undefined,
        ].filter(isTruthy) as any,
        filters: input?.accept,
      });
      if (ref.canceled) {
        return;
      }
      return input?.multiple ? ref.filePaths : ref.filePaths[0];
    }),
  selectDir: t.procedure
    .input(v.optional(v.object({ multiple: v.optional(v.boolean()) })))
    .query(async ({ input, ctx }) => {
      const pathResult = await dialog.showOpenDialog({
        properties: [
          'createDirectory',
          'openDirectory',
          input?.multiple ? 'multiSelections' : undefined,
        ].filter(isTruthy) as any,
      });
      if (pathResult.canceled) {
        return;
      }
      if (input?.multiple) {
        return pathResult.filePaths;
      }
      return pathResult.filePaths[0];
    }),
  download: t.procedure
    .input(
      v.object({
        fileList: v.array(
          v.object({
            url: v.string(),
            dir: v.optional(v.string()),
            fileName: v.optional(v.string()),
          }),
        ),
        dir: v.string(),
        autoUnzip: v.boolean(),
        strip: v.number(),
      }),
    )
    .subscription(async ({ input, ctx }) => {
      return observable<any>((ob) => {
        const configS = ctx.injector.get(GlobalConfigService);

        const downloadService = ctx.injector.get(DownloadService);

        const progressLog = createMessage2Log();
        const log = ctx.injector.get(LogService).getToken('download');
        (async () => {
          try {
            const absDir = path.resolve(DefaultConfigDir!, input.dir);
            for (const item of input.fileList) {
              const url = item.url;
              await downloadService.download(url, {
                output: item.dir ? path.resolve(absDir, item.dir) : absDir,
                fileName: item.fileName,
                disableUnzip: !input.autoUnzip,
                strip: input.strip,
                progressMessage: (message) => {
                  const result = progressLog(message);
                  if (result) {
                    ob.next(result);
                    log?.info(result.message);
                  }
                },
              });
            }
          } catch (rej) {
            log?.info(`下载失败`);
            log?.info(rej);
            ob.error(rej);
          } finally {
            ob.complete();
          }
        })();
      });
    }),
  parseToAudio: t.procedure
    .input(v.object({ filePath: v.string() }))
    .query(async ({ input, ctx }) => {
      const exePath = await ctx.injector
        .get(GlobalConfigService)
        .getFFprobePath();
      const execExist = await fs.existsSync(exePath);
      if (!execExist) {
        throw new Error(`ffmpeg未下载`);
      }
      const result = await $({ reject: false })(exePath, [
        `-i`,
        input.filePath,
        `-print_format`,
        `json`,
        `-show_streams`,
        `-v`,
        `quiet`,
      ]);
      if (result.failed) {
        throw new Error(`${result.stdout}\n${result.stderr}`);
      }
      const data = JSON.parse(result.stdout);
      const isWav16000 =
        data['streams'].length === 1 &&
        data['streams'][0].codec_type === 'audio' &&
        data['streams'][0].sample_rate === '16000';
      const fileName = path.basename(input.filePath);
      if (isWav16000) {
        return { filePath: input.filePath, fileName: fileName };
      }
      const tempFilePath = `${getTempFilePath()}.wav`;
      const result2 = await $({ reject: false })(
        await ctx.injector.get(GlobalConfigService).getFFmpegPath(),
        [
          `-i`,
          input.filePath,
          `-vn`,
          `-ar`,
          `16000`,
          `-ac`,
          `1`,
          '-f',
          `wav`,
          tempFilePath,
        ],
      );
      if (result2.failed) {
        throw new Error(`${result2.stdout}\n${result2.stderr}`);
      }
      return { filePath: tempFilePath, fileName: fileName };
    }),

  save: t.procedure
    .input(
      v.object({ buffer: v.file(), options: v.object({ dir: v.string() }) }),
    )
    .query(async ({ input, ctx }) => {
      return fs.promises.writeFile(
        path.join(input.options.dir, input.buffer.name),
        new Uint8Array(await input.buffer.arrayBuffer()),
      );
    }),
});
//ffmpeg -i input.mp4 -vn -ar 16000 -ac 2 -f wav output.wav
