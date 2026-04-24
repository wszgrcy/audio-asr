import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

import { ProgressComponent } from '../progress/component';
import {
  StartDownloadMessage,
  EndDownloadMessage,
  ErrorDownloadMessage,
} from '../progress/const';
import { trpcClient } from '../../trpc-client';
@Component({
  selector: 'download-button',
  templateUrl: './component.html',
  standalone: true,
  imports: [ProgressComponent],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadButtonFCC {
  label = input('下载');
  fileList = input<
    { url: string; dir?: string | undefined; fileName?: string | undefined }[]
  >([]);
  dir = input<string>();
  autoUnzip = input(true);
  strip = input(0);
  loading$ = signal(false);
  #client = trpcClient;
  info = signal<any>(undefined);
  download() {
    this.loading$.set(true);
    return new Promise<void>((resolve, reject) => {
      this.info.set(StartDownloadMessage);
      this.#client.fs.download.subscribe(
        {
          fileList: this.fileList()!,
          dir: this.dir()!,
          autoUnzip: this.autoUnzip(),
          strip: this.strip(),
        },
        {
          onData: (value) => {
            this.info.set(value);
          },
          onComplete: () => {
            this.info.set(EndDownloadMessage);
            resolve();
          },
          onError: (err) => {
            this.info.set(ErrorDownloadMessage);
            reject(err);
          },
        },
      );
    }).finally(() => {
      this.loading$.set(false);
    });
  }
  openDir() {
    this.#client.fs.openPath.query({ filePath: this.dir()! });
  }
}
