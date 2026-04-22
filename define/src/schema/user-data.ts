import { CommonColumns, CommonId } from './common';
import { d } from '../drizzle-orm-export';
import { user } from './auth';
import { AudioGlobalConfigDefine } from './audio-global-config';

export const ExtraUserDataDefine = d.pgTable('extra_user_data', {
  ...CommonColumns(),
  id: d
    .text()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  audioGlobalConfigId: CommonId().references(() => AudioGlobalConfigDefine.id, {
    onDelete: 'set null',
  }),
});
