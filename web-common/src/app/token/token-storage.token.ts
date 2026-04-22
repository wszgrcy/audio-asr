import { InjectionToken } from '@angular/core';

export interface ITokenStore<T = any> {
  get(): Promise<string | undefined>;
  set(token: string): Promise<void>;
  remove(): Promise<void>;
}

export const TokenStoreToken = new InjectionToken<ITokenStore>(
  'TokenStoreToken',
);
