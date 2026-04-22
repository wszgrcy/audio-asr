import { Injectable } from '@angular/core';
import { trpcClient } from '../trpc-client';
@Injectable({ providedIn: 'root' })
export class MediaParseService {
  async audiovideo(file: File, config: any) {
    const result = await trpcClient.fs.parseToAudio.query({
      filePath: file.name,
    });
    await trpcClient.audioFile.audioParse.query({
      config,
      filePath: result.filePath,
    });
    return;
  }
  subtitle(file: File) {
    const result = trpcClient.fs.readFileContent.query({ filePath: file.name });
    // 这里再发送?
    return result;
  }
}
