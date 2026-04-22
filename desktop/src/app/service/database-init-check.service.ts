import { IDatabaseInitCheckService } from '@@web-common';
import { Injectable } from '@angular/core';

const dbInit = 'db_inited';

@Injectable({
  providedIn: 'root',
})
export class DatabaseInitCheckService implements IDatabaseInitCheckService {
  async isInited() {
    const value = localStorage.getItem(dbInit);
    return value === 'true';
  }

  async save(isInitialized: boolean) {
    return localStorage.setItem(dbInit, isInitialized ? 'true' : 'false');
  }
}
