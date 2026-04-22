import { ITokenStore } from '@@web-common';
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
const AUTH_TOKEN = 'authorization';

@Injectable({
  providedIn: 'root',
})
export class TokenStoreService implements ITokenStore {
  async get() {
    const result = await Preferences.get({ key: AUTH_TOKEN });
    return result.value ?? undefined;
  }

  async set(token: string): Promise<void> {
    await Preferences.set({ key: AUTH_TOKEN, value: token });
  }

  remove(): Promise<void> {
    return Preferences.remove({ key: AUTH_TOKEN });
  }
}
