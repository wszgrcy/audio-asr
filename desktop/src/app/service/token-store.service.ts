import { Injectable } from '@angular/core';
import { trpcClient } from '../trpc-client';

@Injectable({
  providedIn: 'root',
})
export class TokenStoreService {
  async get() {
    const result = await trpcClient.auth.getToken.query();
    return result;
  }
}
