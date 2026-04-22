import type { ConnectConfigType, IConnectStore } from '@@web-common/common';
import Store from 'electron-store';
import { RootStaticInjectOptions } from 'static-injector';
import { signal } from '@angular/core';

type ConfigType = ConnectConfigType;
const STORE_NAME = 'connect';
const store = new Store();

export class ConnectStoreService
  extends RootStaticInjectOptions
  implements IConnectStore
{
  #inited = Promise.withResolvers<void>();
  inited$$ = this.#inited.promise;
  #data$ = signal<ConfigType | undefined>(undefined);
  data$$ = this.#data$.asReadonly();
  constructor() {
    super();
    this.get();
  }
  async get(): Promise<ConfigType | undefined> {
    try {
      const data = store.get(STORE_NAME) as ConfigType | undefined;
      this.#inited.resolve();
      this.#data$.set(data);
      return data;
    } catch (error) {
      return undefined;
    }
  }

  async set(config: ConfigType) {
    store.set(STORE_NAME, config);
    this.#data$.set(config);
  }
}
