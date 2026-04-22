import { Injectable } from '@angular/core';
import { FFmpeg, LogEventCallback } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
@Injectable({
  providedIn: 'root',
})
export class FFmpegService {
  ffmpeg = new FFmpeg();
  inited = false;
  async #init() {
    if (this.inited) {
      return;
    }
    const ffmpeg = this.ffmpeg;
    const baseURL = 'ffmpeg';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
      // workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      classWorkerURL: `${baseURL}/worker.js`,
    });
    this.inited = true;
  }
  async run(file: File) {
    await this.#init();
    const ffmpeg = this.ffmpeg;

    await ffmpeg.writeFile('input', new Uint8Array(await file.arrayBuffer()));
    let str = '';
    const fn: LogEventCallback = (aaa) => {
      str += aaa.message;
    };
    ffmpeg.on('log', fn);
    const c = await ffmpeg.ffprobe([
      '-i',
      'input',
      '-print_format',
      'json',
      '-show_streams',
      '-v',
      'quiet',
    ]);
    if (c !== -1) {
      throw new Error(str);
    }
    const data = JSON.parse(str);
    ffmpeg.off('log', fn);
    const isWav16000 =
      data['streams'].length === 1 &&
      data['streams'][0].codec_type === 'audio' &&
      data['streams'][0].sample_rate === '16000';
    if (isWav16000) {
      return file;
    }
    const result = await ffmpeg.exec([
      '-i',
      'input',
      `-vn`,
      `-ar`,
      `16000`,
      `-ac`,
      `1`,
      '-f',
      `wav`,
      'output.wav',
    ]);
    if (result !== 0) {
      throw new Error('转换失败');
    }
    const fileData = await ffmpeg.readFile('output.wav');
    await ffmpeg.deleteFile('input');
    return new File(
      [fileData as any as Uint8Array<ArrayBuffer>],
      `${file.name}`,
      {},
    );
  }
}
