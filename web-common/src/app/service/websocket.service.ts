import { inject, Injectable } from '@angular/core';
import { ToastService } from '@piying-lib/angular-daisyui/overlay';
import { Subject } from 'rxjs';
import { v4 } from 'uuid';
import { TokenStoreToken } from '../token/token-storage.token';
import { ConnectStoreToken } from '../token/connect.store.token';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  #toast = inject(ToastService);
  globalConfig = inject(ConnectStoreToken);
  tokenStorage = inject(TokenStoreToken);
  async init(getName = () => `audio-stream/${v4()}`) {
    // let session = await trpcClient.auth.getCookie.query();
    const config = await this.globalConfig.data$$()!;
    const token = await this.tokenStorage.get();
    const searchParams = new URLSearchParams();
    searchParams.set('authorization', ` Bearer ${token}`);
    const ws = new WebSocket(
      `${config.enableEnc ? 'wss' : 'ws'}://${config.serverUrl}/ws/${getName()}?${searchParams.toString()}`,
    );

    const start$ = Promise.withResolvers<boolean>();
    const close$ = new Subject();
    ws.onopen = function (event) {
      console.log('WebSocket连接已建立', event);
      // sendBinaryData();
      start$.resolve(true);
    };

    ws.onclose = (event) => {
      // todo 如果异常关闭,应该尝试连接
      console.log('WebSocket连接已关闭', event);
      close$.next(event);
      start$.resolve(false);
    };

    ws.onerror = (error) => {
      this.#toast.add({
        message: 'WebSocket连接错误',
        type: 'error',
      });
      console.error('WebSocket错误:', error);
      start$.resolve(false);
    };
    const listen$ = new Subject<MessageEvent<any>>();
    ws.onmessage = (event) => {
      listen$.next(event);
    };
    return {
      setConfig: (config: any) => {
        ws.send(JSON.stringify(config));
      },

      sendBuffer: (buffer: Float32Array) => {
        ws.send(new Uint8Array(buffer.buffer));
      },
      close: () => {
        ws.close();
        close$.complete();
        listen$.unsubscribe();
      },
      ws,
      inited$$: start$.promise,
      listen$: listen$,
      close$,
    };
  }
}
