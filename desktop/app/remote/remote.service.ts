import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '@audio-server/sdk';
import { createAuthClient } from 'better-auth/client';
import { TokenStoreService } from './token-store.service';
import { computed, inject, RootStaticInjectOptions } from 'static-injector';
import { ConnectStoreService } from '../service/store/connect.store';
export class RemoteService extends RootStaticInjectOptions {
  config = inject(ConnectStoreService);
  tokenStorage = inject(TokenStoreService);
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
  authClient = this.config.inited$$.then(() => {
    return computed(() => {
      const config = this.config.data$$()!;
      return createAuthClient({
        baseURL: `${config.enableEnc ? 'https' : 'http'}://${config.serverUrl}`,
        plugins: [],
        fetchOptions: {
          onSuccess: (ctx) => {
            const authToken = ctx.response.headers.get('set-auth-token');
            if (authToken) {
              return this.tokenStorage.set(authToken);
            }
            return;
          },
          auth: {
            type: 'Bearer',
            token: () => {
              return this.tokenStorage.get();
            },
          },
          headers: [['origin', 'http://localhost:4200']],
        },
      });
    });
  });
  authClient$$ = () => this.authClient.then((a) => a());
}
