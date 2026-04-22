import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { live, LiveNamespace } from '@electric-sql/pglite/live';
import { computed, signal } from '@angular/core';
export const pgVersion$ = signal(0);
export function updatePgDb() {
  pgVersion$.update((a) => a + 1);
}
export const pglite$$ = computed(() => {
  pgVersion$();

  return new PGlite('idb://audio-asr', {
    extensions: { live },
  }) as PGlite & {
    live: LiveNamespace;
  };
});

export const db$$ = computed(() => {
  return drizzle({
    client: pglite$$(),
    logger: process.env.NODE_ENV === 'dev',
  });
});
