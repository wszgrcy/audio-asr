import { inject, Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { ToastService } from '@piying-lib/angular-daisyui/overlay';

@Injectable({
  providedIn: 'root',
})
export class SaveFileService {
  async getDir() {
    return 'audio';
  }
  #toast = inject(ToastService);
  async save(buffer: File, options: { dir: string }) {
    const result = await Filesystem.writeFile({
      data: await buffer.text(),
      path: `${options!.dir}/${buffer.name}`,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    this.#toast.add({ message: `💾${result.uri}` });
  }
}
