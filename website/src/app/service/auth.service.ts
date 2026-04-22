import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createAuthClient } from 'better-auth/client';
import { environment } from '../../environments/environment';
import * as v from 'valibot';
import type { LoginDefine } from '../define-page/login';
import { RegisterDefine } from '../define-page/register';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { apiKeyClient } from '@better-auth/api-key/client';
import { ac, adminRole, userRole } from '@project/define';
import { ToastService } from './toast.service';
export const authClient = createAuthClient({
  baseURL: `${environment.prefix}`,
  plugins: [
    apiKeyClient(),
    adminClient({
      ac: ac,
      roles: {
        admin: adminRole,
        user: userRole,
      },
    }),
    organizationClient({
      dynamicAccessControl: {
        enabled: true,
      },
    }),
  ],
});

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  router = inject(Router);
  #toastService = inject(ToastService);
  toRegister() {
    return this.router.navigateByUrl('/register');
  }
  async register(user: v.InferOutput<typeof RegisterDefine>) {
    try {
      const result = await authClient.signUp.email({
        email: user.email,
        password: user.password,
        name: user.name,
      });
      if (result.error) {
        throw result.error;
      }
      return this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.#toastService.add(JSON.stringify(error), { type: 'error' });
      return false;
    }
  }

  async login(input: v.InferOutput<typeof LoginDefine>) {
    try {
      const result = await authClient.signIn.email({
        email: input.email,
        password: input.password,
      });
      if (result.error) {
        throw result.error;
      }
      const result2 = await authClient.organization.list();
      if (result2.error) {
        throw result2.error;
      }
      const result3 = await authClient.organization.setActive({
        organizationSlug: result2.data![0].slug,
      });
      if (result3.error) {
        throw result3.error;
      }
      return this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.#toastService.add(JSON.stringify(error), { type: 'error' });
      return false;
    }
  }
  async logout() {
    await authClient.signOut();
    return this.router.navigateByUrl('/login');
  }
  async isLogin() {
    const result = await authClient.getSession();
    return !!result.data?.session;
  }
}
