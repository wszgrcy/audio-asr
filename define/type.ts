import type { AppRouter } from '@project/server';
import type { TRPCClient } from '@trpc/client';
export type ApiType = TRPCClient<AppRouter>;
export interface PageInfo {
  take: number;
  skip: number;
}
export interface CurdType {
  find?: (info: PageInfo) => Promise<any>;
  save?: (info: any) => Promise<any>;
  remove?: (info: any) => Promise<any>;
}
