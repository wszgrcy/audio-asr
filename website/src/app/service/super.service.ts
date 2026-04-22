import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { authClient } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SuperUserService {
  router = inject(Router);

  async getUserList() {
    const result = await authClient.admin.listUsers({ query: {} });
    return result;
  }
  // todo 这是获得当前用户的,要改成所有的
  async getOrganizationList() {
    const result = await authClient.organization.list();
    console.log(result);

    return [result.data!.length, result.data];
  }
}
