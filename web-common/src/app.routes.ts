import { Routes } from '@angular/router';

import { SchemaViewPage } from '@piying-lib/angular-core';
import { safeDefine } from './app/piying/define';
import { MainPage, TabsPage } from './app/piying/page-define/main';
import { inject } from '@angular/core';
import { loginGuard, authGuard } from './app/guard/guard';
import {
  LoginPageDefine,
  AudioDevicePageDefine,
  AudioFilePageDefine,
  SelectKindPage,
  AudioListPage,
} from './app/piying';
import { ConnectStoreToken } from './app/token';

const defaultOptions = () => {
  return {
    fieldGlobalConfig: safeDefine.define,
  };
};
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: SchemaViewPage,
    data: {
      schema: () => LoginPageDefine,
      options: defaultOptions,
      model: () => {
        const config = inject(ConnectStoreToken);
        return config.get().then((config) => {
          return { connectConfig: config };
        });
      },
    },
    canActivate: [loginGuard],
  },
  {
    path: '',
    canActivate: [authGuard],
    component: SchemaViewPage,
    data: {
      schema: () => MainPage,
      options: defaultOptions,
      id: () => 'page-main',
    },

    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs/home' },
      {
        path: 'item/audio-device/:id',
        component: SchemaViewPage,
        data: {
          schema: () => AudioDevicePageDefine,
          options: defaultOptions,
          model: () => {
            return;
          },
          id: () => 'page-audio-device',
        },
      },
      {
        path: 'item/audio-history/:id',
        component: SchemaViewPage,
        data: {
          schema: () => AudioDevicePageDefine,
          options: defaultOptions,
          model: () => {
            return;
          },
          id: () => 'page-audio-history',
        },
      },
      {
        path: 'item/:source/:id',
        component: SchemaViewPage,
        data: {
          schema: () => AudioFilePageDefine,
          options: defaultOptions,
          model: () => {
            return;
          },
          id: () => 'page-audio-file',
        },
      },
      // tabs +dock
      {
        path: 'tabs',
        component: SchemaViewPage,
        data: {
          schema: () => TabsPage,
          options: defaultOptions,
          model: () => {},
        },
        children: [
          {
            path: 'home',
            component: SchemaViewPage,
            data: {
              schema: () => SelectKindPage,
              options: defaultOptions,
              model: () => {},
            },
          },
          {
            path: 'list',
            component: SchemaViewPage,
            data: {
              schema: () => AudioListPage,
              options: () => {
                return {
                  fieldGlobalConfig: safeDefine.define,
                };
              },
              model: () => {},
            },
          },
          {
            path: 'globalConfig',
            component: SchemaViewPage,
          },
        ],
      },
    ],
  },
];
