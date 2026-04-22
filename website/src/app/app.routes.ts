import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';

import { AuthService } from './service/auth.service';
import { inject } from '@angular/core';
import { SchemaViewRC } from './page/schema-view/component';
import { LoginPageDefine } from './define-page/login';
import { MainPage } from './define-page/main';
import { UserPageDefine } from './define-page/table/user';
import { RegisterPageDefine } from './define-page/register';
import { OrganizationPageDefine } from './define-page/table/organization';
import { SessionService } from './service/session.servie';
import { _404Component } from './component/404/component';
import { DefaultRolePageDefine } from './define-page/table/default-role';
import { ApikeyPageDefine } from './define-page/table/apikey';
import { TestPage } from './define-page/table/test';

export const loginGuard = async (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const result = await inject(AuthService).isLogin();
  if (result) {
    return router.parseUrl('/dashboard');
  }
  return true;
};
export const authGuard = async (
  route?: ActivatedRouteSnapshot,
  state?: RouterStateSnapshot,
) => {
  const router = inject(Router);
  const result = await inject(SessionService).isLogin();
  if (!result) {
    return router.parseUrl('/login');
  }
  return result;
};
export const roleAuthGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const hasRole = await inject(SessionService).hasRole(route.data['role']);
  return hasRole ? hasRole : router.parseUrl('/dashboard/404');
};

export const routes: Routes = [
  //可以改成权限判断
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'register',
    component: SchemaViewRC,
    data: { schema: () => RegisterPageDefine },
    canActivate: [loginGuard],
  },
  {
    path: 'login',
    component: SchemaViewRC,
    data: { schema: () => LoginPageDefine },
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: SchemaViewRC,
    data: {
      schema: () => MainPage,
    },
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      {
        path: 'user',
        component: SchemaViewRC,
        data: {
          schema: () => UserPageDefine,
          context: () => {
            return {};
          },
          role: 'admin',
        },
        canActivate: [roleAuthGuard],
      },
      {
        path: 'organization',
        component: SchemaViewRC,
        data: {
          schema: () => OrganizationPageDefine,
          role: 'admin',
        },
        canActivate: [roleAuthGuard],
      },
      {
        path: 'default-role',
        component: SchemaViewRC,
        data: {
          schema: () => DefaultRolePageDefine,
          role: 'admin',
        },
        canActivate: [roleAuthGuard],
      },

      {
        path: 'apikey',
        component: SchemaViewRC,
        data: {
          schema: () => ApikeyPageDefine,
        },
      },

      {
        path: 'test',
        component: SchemaViewRC,
        data: {
          schema: () => TestPage,
        },
      },
      {
        path: '**',
        component: _404Component,
      },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '**',
    component: _404Component,
  },
];
