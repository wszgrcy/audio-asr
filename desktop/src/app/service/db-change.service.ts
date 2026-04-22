import { AudioGlobalConfigDefine } from '@@ref/define/src/schema/audio-global-config';
import { db$$, IDbChange } from '@@web-common';
import { Injectable } from '@angular/core';
import { Change } from '@electric-sql/pglite/live';
import { trpcClient } from '../trpc-client';

@Injectable({
  providedIn: 'root',
})
export class DbChangeService implements IDbChange {
  async config(event: Change<typeof AudioGlobalConfigDefine.$inferSelect>[]) {
    const [item] = await db$$().select().from(AudioGlobalConfigDefine).limit(1);
    // 写入给main用
    await trpcClient.config.audioConfig.save.query(item?.config);
  }
}
