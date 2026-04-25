import 'core-js/modules/es.promise.with-resolvers.js';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';

import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { ThemeService } from '@piying-lib/angular-daisyui/service';
import {
  inject,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { SaveFileService } from './app/service/save-file/save-file.service';
import {
  AppComponent,
  DatabaseInitCheckToken,
  RouteStrategy,
  RemoteToken,
  SaveFileToken,
  LoginToken,
  FileFilterToken,
  MediaParseToken,
  ConnectStoreToken,
  TokenStoreToken,
  AudioOutputService,
  DbService,
  ComponentDefineToken,
} from '@@web-common';
import { RemoteService } from './app/remote/remote.service';
import { DatabaseInitCheckService } from './app/service/database-init-check.service';
import { LoginService } from './app/service/login.service';
import { FileFilterService } from './app/service/file-filter.service';
import { MediaParseService } from './app/service/media-parse.service';
import { ConnectStoreService } from './app/remote/connect.service';
import { TokenStoreService } from './app/remote/token-store.service';
import { AudioOutputCapactiorService } from './app/service/audio-output.service.capactior';
import { safeDefine } from './app/piying/define';

bootstrapApplication(AppComponent, {
  providers: [
    // todo 移动
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    ThemeService,
    { provide: RouteReuseStrategy, useClass: RouteStrategy },
    { provide: DatabaseInitCheckToken, useClass: DatabaseInitCheckService },
    { provide: RemoteToken, useClass: RemoteService },
    { provide: SaveFileToken, useClass: SaveFileService },
    { provide: LoginToken, useClass: LoginService },
    { provide: FileFilterToken, useClass: FileFilterService },
    { provide: MediaParseToken, useClass: MediaParseService },
    { provide: ConnectStoreToken, useClass: ConnectStoreService },
    { provide: TokenStoreToken, useClass: TokenStoreService },
    (process.platform as any) === 'webview'
      ? { provide: AudioOutputService, useClass: AudioOutputCapactiorService }
      : [],
    { provide: ComponentDefineToken, useValue: safeDefine },

    provideEnvironmentInitializer(() => {
      let db = inject(DbService);
      db.version$.subscribe(() => {
        db.init().then(() => {
          db.listen();
        });
      });
    }),
  ],
});

import { App } from '@capacitor/app';
if ((process.platform as any) === 'webview') {
  App.addListener('backButton', (event) => {
    if (
      location.href.endsWith('tabs/home') ||
      location.href.endsWith('login') ||
      !event.canGoBack
    ) {
      App.exitApp();
    } else {
      window.history.back();
    }
  });
}
