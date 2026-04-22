import { Injectable } from '@angular/core';
import { trpcClient } from '../trpc-client';

@Injectable({
  providedIn: 'root',
})
export class SaveFileService {
  async getDir() {
    return trpcClient.fs.selectDir.query();
  }
  async save(buffer: File, options: { dir: string }) {
    return trpcClient.fs.save.query({ buffer, options });
  }
}
