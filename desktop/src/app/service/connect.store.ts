import { ConnectConfigType, IConnectStore } from '@@web-common/common';
import { Injectable, signal } from '@angular/core';
import { trpcClient } from '../trpc-client';

type ConfigType = ConnectConfigType;
@Injectable()
export class ConnectStoreService implements IConnectStore {
  #inited = Promise.withResolvers<void>();
  inited$$ = this.#inited.promise;
  #data$ = signal<ConfigType | undefined>(undefined);
  data$$ = this.#data$.asReadonly();
  constructor() {
    this.get();
  }
  async get(): Promise<ConfigType | undefined> {
    try {
      const data = (await trpcClient.config.connect.find.query()) as
        | ConfigType
        | undefined;
      this.#inited.resolve();
      this.#data$.set(data);
      if (!data) return undefined;
      return data;
    } catch (error) {
      return undefined;
    }
  }

  async set(config: ConfigType) {
    await trpcClient.config.connect.save.query(config);
    this.#data$.set(config);
  }
}
