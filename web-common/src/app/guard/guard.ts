import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import {
  ConnectStoreToken,
  DbService,
  RouterConfig,
  TokenStoreToken,
} from '@@web-common';
export const loginGuard = async (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const tokenStore = inject(TokenStoreToken);
  const token = await tokenStore.get();
  if (token) {
    return router.parseUrl(RouterConfig.main);
  }
  return true;
};
export const authGuard = async (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const tokenStore = inject(TokenStoreToken);
  const connect = inject(ConnectStoreToken);
  const db = inject(DbService);
  const [token] = await Promise.all([
    tokenStore.get(),
    db.inited$$,
    connect.get(),
  ]);
  if (!token) {
    return router.parseUrl('/login');
  }

  return true;
};
