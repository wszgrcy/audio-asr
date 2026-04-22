import { InjectionToken } from '@angular/core';
import type { LoginDataType } from '../../piying/page-define/login';
export interface ILoginService {
  login(data: LoginDataType): Promise<void>;
  signOut(): Promise<void>;
}
export const LoginToken = new InjectionToken<ILoginService>('LoginToken');
