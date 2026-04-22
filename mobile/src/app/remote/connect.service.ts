import { ConnectConfigType, IConnectStore } from '@@web-common';
import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
const STORE_NAME = 'connect';

@Injectable({
  providedIn: 'root',
})
export class ConnectStoreService implements IConnectStore {
  #inited = Promise.withResolvers<void>();
  inited$$ = this.#inited.promise;
  #data$ = signal<ConnectConfigType | undefined>(undefined);
  data$$ = this.#data$.asReadonly();
  async get() {
    try {
      const result = await Preferences.get({ key: STORE_NAME });
      const value = result.value ? JSON.parse(result.value) : undefined;
      this.#inited.resolve();
      this.#data$.set(value);
      return value;
    } catch (error) {
      return undefined;
    }
  }

  async set(value: any): Promise<void> {
    await Preferences.set({ key: STORE_NAME, value: JSON.stringify(value) });
    this.#data$.set(value);
  }
}
