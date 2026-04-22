import { Injector, computed, createInjector, inject } from 'static-injector';
import { t } from './api';
import { BrowserWindow } from 'electron';
import {
  CreateContextOptions,
  createIPCHandler,
} from 'electron-trpc-experimental/main';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { ConfigRouter } from './router/config.router';
import { FsRouter } from './router/fs.router';
import { RootInjector } from './root.injector';
import { SysRouter } from './router/sys.router';
import { AuthRouter } from './router/auth.router';

import { GlobalConfigService } from './service/config.service';
import {
  LogFactoryToken,
  GITHUB_URL_TOKEN,
  DownloadConfigToken,
  LogService,
} from '@cyia/external-call';
import { UnzipService } from '@cyia/zip';
import { RemoteService } from './remote/remote.service';
import { DownloadService } from './service/download.service';
import { AudioFileRouter } from './router/audio-file.router';

export class AppService {
  injector = inject(Injector);

  async bootstrap(window: BrowserWindow) {
    createIPCHandler({
      router: await this.getRouter(),
      windows: [window],
      createContext: this.#createContext(),
    });
    //todo
  }

  #createContext(server?: any) {
    return async (opts: CreateContextOptions) => ({
      ...opts,
      injector: this.injector,
    });
  }
  async getRouter() {
    return t.router({
      config: ConfigRouter,
      fs: FsRouter,
      sys: SysRouter,
      auth: AuthRouter,
      audioFile: AudioFileRouter,
    });
  }
}

export async function init() {
  const injector = createInjector({
    providers: [
      AppService,
      GlobalConfigService,
      RemoteService,
      {
        provide: LogFactoryToken,
        useValue: (value: string) => {
          return {
            info: (...args: any[]) => {
              console.info(`[${value}]`, ...args);
            },
            warn: (...args: any[]) => {
              console.warn(`[${value}]`, ...args);
            },
            error: (...args: any[]) => {
              console.error(`[${value}]`, ...args);
            },
          };
        },
      },
      {
        provide: GITHUB_URL_TOKEN,
        useValue: computed(() => {
          // todo 直接改成配置
          return true ? 'github.com' : '';
        }),
      },
      {
        provide: DownloadConfigToken,
        useValue: computed(() => {}),
      },
      UnzipService,
      DownloadService,
      LogService,
    ],
    parent: RootInjector,
  });

  return injector;
}
export type AppRouter = Awaited<ReturnType<AppService['getRouter']>>;
export type APPInput = inferRouterInputs<AppRouter>;
export type APPOutput = inferRouterOutputs<AppRouter>;
