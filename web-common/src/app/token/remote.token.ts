import { InjectionToken, Signal } from '@angular/core';
import type { AppRouter } from '@audio-server/sdk';
import { TRPCClient } from '@trpc/client';
import { createAuthClient } from 'better-auth/client';

export interface IRemoteService {
  trpcClient: Promise<Signal<TRPCClient<AppRouter>>>;
  authClient?: Promise<Signal<ReturnType<typeof createAuthClient>>>;
}
export const RemoteToken = new InjectionToken<IRemoteService>('RemoteToken');
