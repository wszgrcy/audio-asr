import { InjectionToken } from '@angular/core';

// SaveFileService 接口
export interface ISaveFileService {
  getDir(): Promise<string>;
  save(buffer: File, options: { dir: string }): Promise<void>;
}
export const SaveFileToken = new InjectionToken<ISaveFileService>(
  'SaveFileToken',
);
