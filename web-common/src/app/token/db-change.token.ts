import type { AudioGlobalConfigDefine } from '@@ref/define/src/schema/audio-global-config';
import { InjectionToken } from '@angular/core';
import { Change } from '@electric-sql/pglite/live';

export interface IDbChange {
  config(event: Change<typeof AudioGlobalConfigDefine.$inferSelect>[]): void;
}

export const DbChangeToken = new InjectionToken<IDbChange>('DbChangeToken');
