import { Injectable } from '@angular/core';
import { authClient } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  #getSession() {
    return authClient.getSession();
  }

  async hasRole(key: string) {
    const session = await this.#getSession();
    return session.data?.user.role === key;
  }
  async isLogin() {
    const session = await this.#getSession();
    return !!session.data?.session;
  }
}
