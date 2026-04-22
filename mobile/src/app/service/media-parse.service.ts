import { inject, Injectable } from '@angular/core';
import { asrEntity } from '@@ref/define';
import { eq } from 'drizzle-orm';
import { db$$, RemoteService } from '@@web-common';
import { FFmpegService } from './ffmpeg.service';

@Injectable({ providedIn: 'root' })
export class MediaParseService {
  #ffmpeg = inject(FFmpegService);
  #remote = inject(RemoteService);
  async audiovideo(file: File, config: any) {
    this.#ffmpeg.run(file);
    const [result] = await db$$()
      .select()
      .from(asrEntity)
      .where(eq(asrEntity.id, config.id))
      .limit(1);
    const formData = new FormData();
    // formData.set('id', input.id);
    delete (result as any).createdAt;
    delete (result as any).updatedAt;
    formData.set('init', JSON.stringify(result));
    formData.set('file', file);
    try {
      console.log('准备请求', result);
      return await (
        await this.#remote.trpcClient$$()
      ).fileAudio.parse.mutate(formData);
    } finally {
    }
  }
  subtitle(file: File) {
    return file.text();
  }
}
