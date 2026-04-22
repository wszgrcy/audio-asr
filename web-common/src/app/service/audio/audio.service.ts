import {
  computed,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  signal,
} from '@angular/core';
import { map, Observable } from 'rxjs';
import { AudioDeviceService } from './audio-device.service';
import { MicVAD } from '@ricky0123/vad-web';
import { AudioDataChildService } from './audio-data-manager.service';
import { ToastService } from '@piying-lib/angular-daisyui/overlay';
import { ChunkListItemType } from '@@ref/define/src/define/asr';
import { WebsocketService } from '../websocket.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { mergeFloat32Array } from '../../../util/float32-merge';
import { AudioDataService } from './audio-router.service';

const TypeToken = new InjectionToken<'input' | 'output'>('type');
const MediaStreamToken = new InjectionToken<
  Promise<{
    dispose: () => void;
    data$$: Observable<MessageEvent<any>>;
    msInstance: MediaStream;
    track: MediaStreamTrack;
  }>
>('mediaStream');
export enum AudioState {
  CLOSED,
  INITIALIZING,
  WEBSOCKET_INITED,
  MEDIACONNECTION_INITED,
  CONFIG_INITED,
  READY,
}
export class AudioStream {
  #audioOutput = inject(AudioDeviceService);
  start$ = signal(AudioState.CLOSED);
  nameMessage$$ = computed(() => {
    return this.type === 'input' ? '麦克风' : '扬声器';
  });
  #streamDispose?: () => any;
  #websocket = inject(WebsocketService);
  wsInstance: undefined | ReturnType<WebsocketService['init']>;
  type = inject(TypeToken);

  vad?: MicVAD;
  data = inject(AudioDataChildService);
  #toast = inject(ToastService);
  async start() {
    this.start$.set(AudioState.INITIALIZING);
    const ws$$ = this.#websocket.init();
    this.wsInstance = ws$$;

    const ws = await ws$$;
    // 传入配置,发射给后端,进行监听
    const inited = await ws.inited$$;
    if (!inited) {
      await this.stop();
      return;
    }
    this.start$.set(AudioState.WEBSOCKET_INITED);
    let stream;
    let dispose;
    try {
      ({ stream, dispose } = await this.#audioOutput.createAudio(this.type));
    } catch (error) {
      this.stop();
      return;
    }
    this.start$.set(AudioState.MEDIACONNECTION_INITED);
    this.#streamDispose = dispose;
    const config = await this.data.getConfig();
    const typeConfig = config.device![this.type];
    ws.setConfig({
      type: 'init',
      value: {
        ...typeConfig,
        sampleRate: 16000,
      },
    });
    ws.setConfig({ type: 'chunkStart', value: this.data.newChunkId$() });
    await this.data.appendChunkItemTemp(this.type, Date.now());
    this.start$.set(AudioState.CONFIG_INITED);

    ws.close$.subscribe(() => {
      this.#toast.add({
        message: `${this.nameMessage$$()} WebSocket连接被关闭`,
        type: 'warning',
      });
      this.stop();
    });
    ws.listen$.subscribe((event) => {
      if (typeof event.data !== 'string') {
        return;
      }
      const data = JSON.parse(event.data) as any;
      switch (data.type) {
        case 'origin': {
          this.data.editChunkItemTemp(data.value);
          break;
        }
        case 'translate': {
          this.data.editChunkItemTemp(data.value);
          break;
        }
        case 'error': {
          this.#toast.add({
            message: `错误：${data.value.error.message}`,
            type: 'error',
          });
          this.stop();
          break;
        }
        case 'audio-end': {
          this.data.chunkItemTempEnd(data.value);
          break;
        }
        default:
          break;
      }
    });

    let list: Float32Array[] = [];
    // todo 还可以将每次的音频都保存
    let maxSplitTime = config.redemptionMs;
    let start = performance.now();
    let lastSplitTime = start;

    const splitChunk = () => {
      const oldId = this.data.newChunkId$();
      this.data.updateChunkId();
      ws.setConfig({ type: 'chunkStart', value: this.data.newChunkId$() });
      if (list.length) {
        ws.sendBuffer(mergeFloat32Array(list));
        list = [];
      }
      this.data.updateNextChunkItemTemp(oldId, this.type);
      lastSplitTime = performance.now();
    };

    this.vad = await MicVAD.new({
      redemptionMs: config.redemptionMs,
      getStream: async () => {
        return stream;
      },
      onSpeechEnd: (audio) => {
        splitChunk();
      },
      onFrameProcessed: (p, f) => {
        list.push(f);
        const end = performance.now();
        const duration = end - start;
        if (duration / 1000 > config.timeChunk!) {
          ws.sendBuffer(mergeFloat32Array(list));
          list = [];
          start = end;
        }
        const sinceLastSplit = end - lastSplitTime;
        if (p.notSpeech > 1 && sinceLastSplit / 1000 > maxSplitTime) {
          splitChunk();
        }
        p.notSpeech
      },
      model: 'v5',
    });
    await this.vad.start();
    this.start$.set(AudioState.READY);
  }

  async stop() {
    const start = await (await this.wsInstance)?.inited$$;
    this.start$.set(AudioState.CLOSED);
    this.#streamDispose?.();
    (await this.wsInstance)?.close();
    this.vad?.destroy();
    this.vad = undefined;
    this.#streamDispose = undefined;
    this.wsInstance = undefined;
    if (start) {
      await this.data.templateListEnd(this.data.newChunkId$());
    }
  }
}
@Injectable()
export class AudioService {
  #activateRoute = inject(ActivatedRoute);
  readonly id$ = toSignal<string>(
    this.#activateRoute.params.pipe(map((item) => item['id'])),
  );
  #update$$ = signal(0);
  updateList() {
    this.#update$$.update((a) => a + 1);
  }

  list$ = signal<ChunkListItemType[]>([]);
  #injector = inject(Injector);
  #dataService = inject(AudioDataService);
  create(type: 'input' | 'output') {
    const instance = Injector.create({
      providers: [
        AudioStream,
        { provide: TypeToken, useValue: type },
        { provide: MediaStreamToken, useValue: '' },
        {
          provide: AudioDataChildService,
          useValue: this.#dataService.current$$(),
        },
      ],
      parent: this.#injector,
    });
    return instance.get(AudioStream);
  }

  /** 当前列表重置,比如归档后 */
  restList() {
    this.list$.set([]);
  }
}
