import { InjectionToken } from '@angular/core';

export interface FileFilterService {
  audiovideo: any;
  srt: any;
}

export const FileFilterToken = new InjectionToken<FileFilterService>(
  'FileFilterToken',
);
