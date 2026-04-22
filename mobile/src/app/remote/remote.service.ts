import { computed, Injectable } from '@angular/core';
import { createAuthClient } from 'better-auth/client';
import { RemoteService as GRemoteService } from '@@web-common';
@Injectable({ providedIn: 'root' })
export class RemoteService extends GRemoteService {
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
        },
      });
    });
  });
  authClient$$ = () => this.authClient.then((a) => a());
}
