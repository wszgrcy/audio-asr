import { createTRPCClient, httpLink } from '@trpc/client';
import type { AppRouter } from '@project/server';
import { environment } from '../../environments/environment';
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${environment.prefix}/api`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
