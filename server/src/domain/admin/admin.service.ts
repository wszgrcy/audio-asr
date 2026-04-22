import { auth } from '@@domain/auth/auth';
import { User } from 'better-auth';
import { RootStaticInjectOptions } from 'static-injector';

export class AdminService extends RootStaticInjectOptions {
  user$?: PromiseWithResolvers<{ headers: [string, string][]; id: string }>;
  async #getAdminHeaders() {
    const result2 = await auth.api.signInEmail({
      body: { email: 'admin@admin.com', password: process.env.ADMIN_PASSWORD },
      returnHeaders: true,
    });
    const headers = [
      ['cookie', result2.headers.get('set-cookie')!] as [string, string],
    ];
    const result = await auth.api.listOrganizations({
      headers,
    });
    return {
      headers,
      id: result.find((item) => item.slug === 'default')!.id,
    };
  }
  #_getAdminHeaders() {
    if (this.user$) {
      return this.user$.promise;
    }
    const a = Promise.withResolvers<{
      headers: [string, string][];
      id: string;
    }>();
    this.user$ = a;
    this.#getAdminHeaders().then(a.resolve);
    return a.promise;
  }
  async addUserToDefaultOrganization(user: User) {
    const { headers, id } = await this.#_getAdminHeaders();
    const result = await auth.api.addMember({
      body: {
        userId: user.id,
        role: 'member',
        organizationId: id,
      },
      headers: headers,
    });
  }
}
