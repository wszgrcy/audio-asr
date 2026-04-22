import { InjectionToken, Signal } from '@angular/core';
import type { ConnectConfigType } from '../piying/page-define/login';

export interface IConnectStore {
  inited$$: Promise<void>;
  get(): Promise<ConnectConfigType | undefined>;
  set(config: ConnectConfigType): Promise<void>;
  data$$: Signal<ConnectConfigType | undefined>;
}

export const ConnectStoreToken = new InjectionToken<IConnectStore>(
  'ConnectStoreToken',
);
