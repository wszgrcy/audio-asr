import { InjectionToken } from '@angular/core';

export interface MediaParseService {
  audiovideo(file: File, config: any): Promise<void>;
  subtitle(file: File): any;
}

export const MediaParseToken = new InjectionToken<MediaParseService>(
  'MediaParseToken',
);
