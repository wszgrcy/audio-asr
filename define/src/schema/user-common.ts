import { d } from '../drizzle-orm-export';
import { user } from './auth';

export function userId() {
  return process.env.WORK_PLATFORM === 'server'
    ? d.text().references(() => user.id, { onDelete: 'cascade' })
    : d.text();
}
