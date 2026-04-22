import { IDatabaseInitCheckService } from '@@web-common';
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const dbInit = 'db_inited';

@Injectable({
  providedIn: 'root',
})
export class DatabaseInitCheckService implements IDatabaseInitCheckService {
  async isInited() {
    const key = await Preferences.get({ key: dbInit });
    return key.value === 'true';
  }

  async save(isInitialized: boolean) {
    await Preferences.set({
      key: dbInit,
      value: isInitialized ? 'true' : 'false',
    });
  }
}
