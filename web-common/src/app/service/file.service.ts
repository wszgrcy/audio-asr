import { inject, Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
// import { AudioDataService } from './page/audio-device/audio-data.service';

@Injectable({
  providedIn: 'root',
})
export class FileAudioService {
  #ws = inject(WebsocketService);
  instance = this.#ws.init(() => 'file-queue');

  async requestData(id: string) {
    // todo 初始化内置
    await (
      await this.instance
    ).inited$$;
    (await this.instance).setConfig({ type: 'request-item', value: { id } });
  }
}
