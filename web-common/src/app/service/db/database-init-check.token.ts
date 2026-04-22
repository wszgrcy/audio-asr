import { InjectionToken } from '@angular/core';
export interface IDatabaseInitCheckService {
  isInited(): Promise<boolean>;
  save(isInitialized: boolean): Promise<void>;
}
export const DatabaseInitCheckToken =
  new InjectionToken<IDatabaseInitCheckService>('IDatabaseInitCheckService');
