import {
  computed,
  effect,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { v4 } from 'uuid';
import { deepEqual } from 'fast-equals';
import { computedWithPrev } from '@piying-lib/angular-core';
import { promise as fastq } from 'fastq';
import { LRUCache } from 'lru-cache';

import { StreamChunkItemOutputType, StreamChunkItemType } from '@@ref/define/src/define/asr-config';
import { AsrService } from '../asr.service';
import { TranslateSubtitleService } from '../translate-subtitle.service';
import * as v from 'valibot';
import { ChunkListItem } from '@@ref/define/src/define/asr';
import { merge } from 'es-toolkit';
import { FileAudioService } from '../file.service';
import { asrEntity } from '@@ref/define';

@Injectable()
export class AudioDataChildService {
  readonly id = inject(ID_TOKEN);
  readonly #injector = inject(Injector);
  readonly #asrService = inject(AsrService);
  readonly #translateService = inject(TranslateSubtitleService);

  readonly #updateIndex$ = signal(0);
  readonly tmpList$ = signal<v.InferOutput<typeof ChunkListItem>[]>([]);
  readonly onlyTmp$ = signal(false);
  readonly newChunkId$ = signal(v4());
  readonly #lastEndIndex$ = signal(0);

  readonly audioItem$$ = resource({
    params: () => {
      return [this.#updateIndex$()] as const;
    },
    loader: async (input) => {
      return this.#asrService.findOne(this.id).then((value) => {
        this.#audioFileChange(value);
        this.#subtitleChange(value);
        return value;
      });
    },
    equal: deepEqual,
  });
  updateList() {
    this.#updateIndex$.update((a) => a + 1);
  }
  item$$ = computedWithPrev<
    ReturnType<AudioDataChildService['audioItem$$']['value']>
  >((prev) => {
    const isLoading = this.audioItem$$.isLoading();
    return isLoading ? prev : this.audioItem$$.value();
  });

  list$$ = computed(() => {
    const templateList = this.tmpList$();
    if (this.onlyTmp$()) {
      return templateList;
    }
    const list = this.item$$()?.data.chunkList ?? [];
    return list.slice().concat(templateList);
  });

  appendChunkItemTemp(type: any, start: number) {
    this.tmpList$.update((list) => {
      const input = v.parse(ChunkListItem, {
        id: this.newChunkId$(),
        type: type,
        range: [start, start],
        status: 0,
      });
      return list.slice().concat(input);
    });
  }
  editChunkItemTemp(data: any) {
    this.tmpList$.update((list) => {
      list = list.slice();
      const index = list.findLastIndex((item) => item.id === data.id);
      list[index] = merge(list[index], data);
      if (list[index].status !== 2) {
        list[index].status = 1;
      }
      return list;
    });
  }
  updateNextChunkItemTemp(chunkId: string, type: any) {
    const now = Date.now();
    this.tmpList$.update((list) => {
      list = list.slice();
      const index = list.findLastIndex((item) => item.id === chunkId);
      const lastChunk = list[index];
      lastChunk.range![1] = now;
      return list;
    });
    this.appendChunkItemTemp(type, now);
  }
  chunkItemTempEnd(chunkId: string) {
    this.tmpList$.update((list) => {
      list = list.slice();
      const index = list.findLastIndex((item) => item.id === chunkId);
      list[index].status = 2;
      return list;
    });
    const endIndex = this.tmpList$().findIndex(
      (item, index) => index > this.#lastEndIndex$() && item.status !== 2,
    );
    const endList = this.tmpList$().slice(this.#lastEndIndex$(), endIndex);
    this.#lastEndIndex$.set(endIndex);

    if (endList.length) {
      this.#asrService.appendChunkList({ id: this.id, list: endList });
    }
  }
  async templateListEnd(chunkId: string) {
    this.tmpList$.update((list) => {
      const index = list.findLastIndex((item) => item.id === chunkId);
      // 申请失败时
      if (index == -1) {
        return list;
      }
      list = list.slice();
      const lastChunk = list[index];

      if (
        lastChunk &&
        (lastChunk.status === 0 || lastChunk.status === undefined)
      ) {
        list.pop();
      } else {
        lastChunk.range![1] = Date.now();
        lastChunk.status = 2;
      }
      return list;
    });    
    if (!this.tmpList$().length) {
      return;
    }
    await this.#asrService
      .appendChunkList({
        id: this.id,
        list: this.tmpList$().slice(-1),
      })
      .then(() => {
        this.updateList();
        const ref = effect(
          () => {
            const isLoading = this.audioItem$$.isLoading();
            if (isLoading) {
              return;
            }
            this.tmpList$.set([]);
            this.#lastEndIndex$.set(0);
            ref.destroy();
          },
          { injector: this.#injector },
        );
      });
  }
  updateChunkId() {
    this.newChunkId$.set(v4());
  }

  lastConfig$$ = computed(() => {
    const item = this.audioItem$$.value();
    if (!item) {
      return undefined;
    }
    return item.data?.config;
  });

  getConfig() {
    return new Promise<StreamChunkItemOutputType>((resolve) => {
      const ref = effect(
        () => {
          const isLoading = this.audioItem$$.isLoading();
          if (isLoading) {
            return;
          }
          const res = this.audioItem$$.value();
          const config = res!.data!.config!;
          resolve(config);
          ref.destroy();
        },
        { injector: this.#injector },
      );
    });
  }

  #fileAudioService = inject(FileAudioService);
  #isOnAudioChange = false;
  #audioFileChange(value: typeof asrEntity.$inferSelect) {
    if (
      value.source !== 'audio-file' ||
      value.status === 2 ||
      this.#isOnAudioChange
    ) {
      return;
    }
    this.#isOnAudioChange = true;
    this.#fileAudioService.requestData(value.id);
    this.#fileAudioService.instance.then(async (instance) => {
      const ref = instance.listen$.subscribe(async (event) => {
        if (typeof event.data !== 'string') {
          return;
        }
        const data = JSON.parse(event.data) as {
          type: string;
          value: any;
          id: any;
        };
        if (data.id !== value.id) {
          return;
        }
        switch (data.type) {
          case 'data': {
            if (data.value) {
              await this.#asrService.saveByRemote(data.value);
              this.updateList();
              if (data.value.status !== 2) {
                setTimeout(() => {
                  this.#fileAudioService.requestData(data.id);
                }, 3000);
              } else {
                ref.unsubscribe();
              }
            } else {
              setTimeout(() => {
                this.#fileAudioService.requestData(data.id);
              }, 5000);
            }

            break;
          }

          default:
            break;
        }
      });
    });
  }
  #isTranslate = false;

  #subtitleChange(value: typeof asrEntity.$inferSelect) {
    if (value.source !== 'subtitle' || value.status === 2) {
      return;
    }
    if (this.#isTranslate) {
      return;
    }
    this.#isTranslate = true;
    const config = value;
    const fileConfig = config?.data.config?.file;
    if (!config || !fileConfig?.translate.enable) {
      return;
    }

    this.onlyTmp$.set(true);
    this.tmpList$.set(config.data.chunkList!);

    let completedCount = 0;
    const batchSize = 5;

    const saveQueue = fastq(
      async (task: {
        list: v.InferOutput<typeof ChunkListItem>[];
        status: number;
      }) => {
        await this.#asrService.setChunkList({
          id: this.id,
          list: task.list,
          status: task.status,
        });
      },
      1,
    );

    this.#translateService
      .translate(
        fileConfig!.translate.value!,
        fileConfig.audio.language,
        this.tmpList$(),
      )
      .subscribe({
        next: ({ value }) => {
          this.tmpList$.update((list) => {
            list = list.slice();
            const item = list.find((item) => item.id === value.id)!;
            item!.translateText ??= {};
            item.translateText[value.target] = value.content;
            return list;
          });
          completedCount++;

          if (completedCount % batchSize === 0) {
            saveQueue.push({
              list: this.tmpList$(),
              status: 1,
            });
          }
        },
        complete: () => {
          saveQueue.push({
            list: this.tmpList$(),
            status: 2,
          });
        },
      });
  }
}
const ID_TOKEN = new InjectionToken<string>('ID_TOKEN');
@Injectable({
  providedIn: 'root',
})
export class AudioDataManagerService {
  readonly #injector = inject(Injector);
  readonly #childServices = new LRUCache<string, AudioDataChildService>({
    max: 20,
  });

  getChild(id: string) {
    let childService = this.#childServices.get(id);
    if (!childService) {
      childService = this.#createChildService(id);
      this.#childServices.set(id, childService);
    }

    return childService;
  }

  #createChildService(id: string) {
    return untracked(() => {
      const childInjector = Injector.create({
        providers: [{ provide: ID_TOKEN, useValue: id }, AudioDataChildService],
        parent: this.#injector,
      });
      return childInjector.get(AudioDataChildService);
    });
  }
}
