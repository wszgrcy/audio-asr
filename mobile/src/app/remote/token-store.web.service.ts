import { Injectable } from '@angular/core';
const AUTH_TOKEN = 'authorization';

@Injectable({
  providedIn: 'root',
})
export class TokenStoreWebService {
  get() {
    const token = localStorage.getItem(AUTH_TOKEN);
    return token ?? undefined;
  }

  set(token: string) {
    localStorage.setItem(AUTH_TOKEN, token);
  }

  remove() {
    localStorage.removeItem(AUTH_TOKEN);
  }
}
