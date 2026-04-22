import { createTRPCProxyClient } from '@trpc/client';
import { ipcLink } from 'electron-trpc-experimental/renderer';
import type { AppRouter } from '../../app/app.service';
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [ipcLink()],
});
