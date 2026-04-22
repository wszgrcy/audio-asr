import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  of,
  scan,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { encode } from 'node-wav';
import { OpenAI } from 'openai';
import {
  ITranslationConfig,
  OpenAITranslationService,
  TranslateConfigToken,
} from './translation.service';
import { inject, InjectionToken, Injector } from 'static-injector';
interface AudioChunk {
  id: string;
  buffer: Buffer;
}
export type WSMessageType =
  | 'origin' // 原始转译结果
  | 'translate' // 翻译结果
  | 'error' // 错误信息
  | 'audio-end';
export type ChunkCallback = (data: { type: WSMessageType; value: any }) => void;

export type WSErrorMessage = {
  type: 'error';
  value: {
    id?: string;
    error: {
      message: string;
      code?: string;
      details?: any;
    };
  };
};
export class Child {
  #end$ = new BehaviorSubject<string>('');
  buffer$ = new Subject<{ id: string; buffer: Buffer }>();
  idSet = new Map<string, () => void>();
  #translateService = inject(OpenAITranslationService);
  #config = inject(ChildConfigToken);

  run(input: AudioChunk): void {
    console.log(`Child ${input.id} running with `);
    this.buffer$.next(input);
    if (!this.idSet.has(input.id)) {
      let streamLoading = false;
      const op = new OpenAI({
        baseURL: this.#config.config.audio.baseURL,
        apiKey: this.#config.config.audio.apiKey ?? ' ',
      });
      const ref = combineLatest([
        this.buffer$.pipe(
          filter((item) => item.id === input.id),
          map((item) => item.buffer),
          takeUntil(
            this.#end$.pipe(
              filter((value) => value === input.id),
              tap(() => {
                streamLoading = false;
              }),
            ),
          ),
          scan((acc, value) => {
            return acc.concat(value);
          }, [] as Buffer[]),
          map((list) => {
            const buf = Buffer.concat(list);
            return encode(
              [new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4)],
              {
                sampleRate: this.#config.config.sampleRate,
              },
            );
          }),
          filter(() => streamLoading === false),
          tap(() => {
            streamLoading = true;
          }),
          switchMap(async (buffer) => {
            const start = performance.now();

            const instance = await op.audio.transcriptions.create({
              file: new File([new Uint8Array(buffer)], ''),
              stream: false,
              model: this.#config.config.audio.model ?? 'whisper',
              response_format: 'json',
              language: this.#config.config.audio.language,
            });
            console.log('用时', performance.now() - start);
            return instance;
          }),
          catchError((err) => {
            console.error('音频转文本失败:', err);
            this.#config.callback({
              type: 'error',
              value: {
                id: input.id,
                error: {
                  message: `音频转文本失败：${err instanceof Error ? err.message : String(err)}`,
                  code: err instanceof Error ? err.name : undefined,
                  details: err,
                },
              },
            });
            return of(undefined);
          }),
          tap(() => {
            streamLoading = false;
          }),
          filter(Boolean),
        ),
        this.#end$.pipe(map((value) => value === input.id)),
      ]).subscribe(async ([data, isEnd]: any) => {
        console.log(data, isEnd);
        this.#config.callback({
          type: 'origin',
          value: { origin: data.text, id: input.id },
        });
        if (isEnd) {
          ref.unsubscribe();
          if (this.#config.config.translate.enable) {
            await Promise.all(
              this.#config.config.translate.value!.target.map(
                async (language) => {
                  try {
                    const result = await this.#translateService.translate(
                      data.text,
                      this.#config.config.audio.language!,
                      language,
                    );
                    this.#config.callback({
                      type: 'translate',
                      value: {
                        id: input.id,
                        translateText: {
                          [language]: result,
                        },
                      },
                    });
                  } catch (error) {
                    this.#config.callback({
                      type: 'error',
                      value: {
                        id: undefined, // 翻译错误可能不关联特定的 chunk
                        error: {
                          message: `翻译失败：${error instanceof Error ? error.message : String(error)}`,
                          code: error instanceof Error ? error.name : undefined,
                          details: error,
                        },
                      },
                    });
                    console.error('翻译任务失败:', error);
                  }
                },
              ),
            );
          }
          this.#config.callback({
            type: 'audio-end',
            value: input.id,
          });
        }
      });
      this.idSet.set(input.id, () => {
        return ref.unsubscribe();
      });
    }
  }

  end(id: string) {
    this.#end$.next(id);
    this.idSet.delete(id);
  }
  clear() {
    this.idSet.forEach((value) => {
      value();
    });
  }
}
export interface IChildConfig {
  id: string;
  config: {
    sampleRate: number;
    audio: {
      baseURL: string;
      apiKey?: string;
      model?: string;
      language?: string;
    };

    translate: {
      enable: boolean;
      value?: {
        baseURL: string;
        apiKey?: string;
        model: string;
        target: string[];
      };
    };
  };
  callback: ChunkCallback;
}
export const ChildConfigToken = new InjectionToken<IChildConfig>(
  'ChildConfigToken',
);
export class StreamAudioService {
  /** session id 也就是ws的id */
  private children: Map<string, Child> = new Map();
  #injector = inject(Injector);

  init(
    id: string,
    config: IChildConfig['config'],
    callback: ChunkCallback,
  ): Child {
    const injector = Injector.create({
      providers: [
        Child,
        OpenAITranslationService,
        {
          provide: ChildConfigToken,
          useValue: { id, config, callback } as IChildConfig,
        },
        {
          provide: TranslateConfigToken,
          useValue: {
            model: config.translate.value?.model,
            apiKey: config.translate.value?.apiKey,
            baseURL: config.translate.value?.baseURL,
          } as ITranslationConfig,
        },
      ],
      parent: this.#injector,
    });
    const child = injector.get(Child);
    this.children.set(id, child);
    return child;
  }

  add(id: string, chunk: AudioChunk): void {
    const child = this.children.get(id)!;
    child.run(chunk);
  }
  end(id: string, chunkId: string) {
    const instance = this.children.get(id)!;
    instance.end(chunkId);
  }
  clear(id: string) {
    const instance = this.children.get(id);
    instance?.clear();
  }
}
