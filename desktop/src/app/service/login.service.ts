import { inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '@piying-lib/angular-daisyui/overlay';
import { trpcClient } from '../trpc-client';
import {
  GlobalConfigService,
  ConnectStoreToken,
  DbService,
  ILoginService,
  LoginDataType,
  RemoteService,
  RouterConfig,
} from '@@web-common';
@Injectable({ providedIn: 'root' })
export class LoginService implements ILoginService {
  private router = inject(Router);
  private toastService = inject(ToastService);

  private readonly LOGIN_ROUTE = '/login';

  #connectStore = inject(ConnectStoreToken);
  #remote = inject(RemoteService);
  #injector = inject(Injector);
  async login(data: LoginDataType): Promise<void> {
    try {
      await this.#connectStore.set(data.connectConfig);
      const result = await trpcClient.auth.emailSignIn.query(data.loginConfig);

      if (result.error) {
        this.toastService.add({
          message: `${result.error.code}:${result.error.message}`,
        });
        return;
      }
      const config = await (
        await this.#remote.trpcClient$$()
      ).user.findConfig.mutate();
      await this.#injector
        .get(GlobalConfigService)
        .patchConfig(config?.config, undefined, 'server');

      await this.router.navigateByUrl(RouterConfig.main);
    } catch (error) {
      console.error('Login error:', error);
      this.toastService.add({
        message: '登录过程中发生错误，请稍后重试',
      });
    }
  }

  #db = inject(DbService);

  async signOut(): Promise<void> {
    try {
      await trpcClient.auth.signOut.query();
      await this.#db.clean();
      await this.router.navigateByUrl(this.LOGIN_ROUTE);
    } catch (error) {
      console.error('Sign out error:', error);
      this.toastService.add({
        message: '退出过程中发生错误，请稍后重试',
      });
    }
  }
}
