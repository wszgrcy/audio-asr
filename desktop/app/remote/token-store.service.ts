const AUTH_TOKEN = 'authorization';
import Store from 'electron-store';
import { RootStaticInjectOptions } from 'static-injector';
const store = new Store();

export class TokenStoreService extends RootStaticInjectOptions {
  get() {
    return (store.get(AUTH_TOKEN) as string | undefined) ?? undefined;
  }

  set(token: string) {
    store.set(AUTH_TOKEN, token);
  }

  remove() {
    store.delete(AUTH_TOKEN);
  }
}
