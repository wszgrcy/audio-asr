import { t } from '../api';
import * as v from 'valibot';
import { RemoteService } from '../remote/remote.service';
import * as fs from 'fs';
import { $localize } from '@cyia/localize';
export const AudioFileRouter = t.router({
  audioParse: t.procedure
    .input(v.object({ filePath: v.string(), config: v.any() }))
    .query(async ({ input, ctx }) => {
      const config = input.config;
      const formData = new FormData();
      // formData.set('id', input.id);
      delete (config as any).createdAt;
      delete (config as any).updatedAt;
      formData.set('init', JSON.stringify(config));
      formData.set(
        'file',
        new Blob([new Uint8Array(await fs.promises.readFile(input.filePath!))]),
      );
      try {
        console.log($localize`准备请求`, JSON.stringify(config, undefined, 4));
        return await (
          await ctx.injector.get(RemoteService).trpcClient$$()
        ).fileAudio.parse.mutate(formData);
      } finally {
      }
    }),
});
