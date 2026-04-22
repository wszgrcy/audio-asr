import { computed, inject, Injectable } from '@angular/core';
import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '@audio-server/sdk';
import { TokenStoreToken } from '../token';
import { ConnectStoreToken } from '../token/connect.store.token';
@Injectable({ providedIn: 'root' })
export class RemoteService {
  protected config = inject(ConnectStoreToken);
  protected tokenStorage = inject(TokenStoreToken);
  trpcClient = this.config.inited$$.then(() => {
    return computed(() => {
      const config = this.config.data$$()!;
      return createTRPCClient<AppRouter>({
        links: [
          httpLink({
            url: `${config.enableEnc ? 'https' : 'http'}://${config.serverUrl}/api`,
            fetch(url, options) {
              return fetch(url, {
                ...options,
                credentials: 'include',
              });
            },
            headers: async (opts) => {
              const token = await this.tokenStorage.get();
              if (!token) {
                return {};
              }
              return {
                authorization: `Bearer ${token}`,
              };
            },
          }),
        ],
      });
    });
  });
  trpcClient$$ = () => this.trpcClient.then((a) => a());
}
