import { Injectable } from '@angular/core';
import { authClient } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DefaultRoleService {
  async getList() {
    const list = await authClient.organization.list();
    const roleList = await authClient.organization.listRoles({
      query: {
        organizationId: list.data!.find((item) => item.slug === 'default')!.id,
      },
    });
    return [roleList.data!.length, roleList.data!] as const;
  }
}
