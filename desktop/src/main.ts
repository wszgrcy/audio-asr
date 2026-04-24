import {
  inject,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ThemeService } from '@piying-lib/angular-daisyui/service';
import { provideRouter, RouteReuseStrategy } from '@angular/router';

import { routes } from './app.routes';

import {
  AppComponent,
  DatabaseInitCheckToken,
  RouteStrategy,
  RemoteService,
  RemoteToken,
  SaveFileToken,
  TokenStoreToken,
  LoginToken,
  FileFilterToken,
  MediaParseToken,
  ConnectStoreToken,
  DbChangeToken,
  DbService,
  ComponentDefineToken,
} from '@@web-common';
import { DatabaseInitCheckService } from './app/service/database-init-check.service';
import { SaveFileService } from './app/service/save-file.service';
import { TokenStoreService } from './app/service/token-store.service';
import { LoginService } from './app/service/login.service';
import { FileFilterService } from './app/service/file-filter.service';
import { MediaParseService } from './app/service/media-parse.service';

import { ConnectStoreService } from './app/service/connect.store';
import { DbChangeService } from './app/service/db-change.service';
import { safeDefine } from './app/piying/define';
console.log(process.env.NODE_ENV);
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    ThemeService,
    { provide: RouteReuseStrategy, useClass: RouteStrategy },
    { provide: DatabaseInitCheckToken, useClass: DatabaseInitCheckService },
    { provide: RemoteToken, useClass: RemoteService },
    { provide: SaveFileToken, useClass: SaveFileService },
    { provide: TokenStoreToken, useClass: TokenStoreService },
    { provide: LoginToken, useClass: LoginService },
    { provide: FileFilterToken, useClass: FileFilterService },
    { provide: MediaParseToken, useClass: MediaParseService },
    { provide: ConnectStoreToken, useClass: ConnectStoreService },
    { provide: DbChangeToken, useClass: DbChangeService },
    { provide: ComponentDefineToken, useValue: safeDefine },
    provideEnvironmentInitializer(() => {
      const db = inject(DbService);
      db.version$.subscribe(() => {
        db.init().then(() => {
          db.listen();
        });
      });
    }),
  ],
}).catch((err) => console.error(err));
