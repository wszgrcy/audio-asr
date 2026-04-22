import { signal, untracked, computed, Injectable } from '@angular/core';

import { deepEqual } from 'fast-equals';
import { CommonConfigDefine } from '@@ref/define/src/define/common-global.config';
import * as v from 'valibot';
import { db$$ } from '../db/db';
import { AudioGlobalConfigDefine, AudioGlobalConfigOutput } from '@@ref/define';
import { merge } from 'es-toolkit';
export type CommonConfigType = v.InferOutput<typeof CommonConfigDefine>;
@Injectable({ providedIn: 'root' })
export class GlobalConfigService<T extends CommonConfigType> {
  #config = signal<AudioGlobalConfigOutput | undefined>(undefined, {
    equal: deepEqual,
  });
  #inited = Promise.withResolvers();
  inited = this.#inited.promise;
  config$$ = computed(() => {
    const config = this.#config()?.config;
    return {
      ...config,
      ...(config as any)?.platform?.[process.platform],
    };
  });
  constructor() {
    this.getConfig$$();
  }
  async getConfig$$() {
    return untracked(async () => {
      if (!this.#config()) {
        const [data] = await db$$()
          .select()
          .from(AudioGlobalConfigDefine)
          .limit(1);
        this.#config.set(data);
        this.#inited.resolve(true);
      }
      return this.config$$()!;
    });
  }

  async patchConfig(
    data: T,
    save?: boolean,
    updateSource: 'client' | 'server' = 'client',
  ) {
    await this.inited;
    const id = this.#config()?.id;
    const config = !save ? merge({ ...this.#config()?.config }, data) : data;
    const [result] = await db$$()
      .insert(AudioGlobalConfigDefine)
      .values({
        config: config,
        id,
        updateSource,
      })
      .onConflictDoUpdate({
        target: AudioGlobalConfigDefine.id,
        set: { config: config, updateSource },
      })
      .returning();
    this.#config.set(result);
  }
}
