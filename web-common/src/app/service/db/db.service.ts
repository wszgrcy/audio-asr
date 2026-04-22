import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { pglite$$, db$$, updatePgDb, pgVersion$ } from './db';
import { firstValueFrom } from 'rxjs';
import { DatabaseInitCheckToken } from './database-init-check.token';
import { asrEntity, AudioGlobalConfigDefine } from '@@ref/define';
import { ListService } from '../list.service';
import { RemoteService } from '../remote.service';
import { DbChangeToken } from '../../token/db-change.token';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  #inited$ = Promise.withResolvers<void>();
  inited$$ = this.#inited$.promise;
  #http = inject(HttpClient);
  #initCheck = inject(DatabaseInitCheckToken);
  #list = inject(ListService);
  version$ = toObservable(pgVersion$);
  async init() {
    return Promise.all([pglite$$().waitReady, this.#initCheck.isInited()]).then(
      async ([_, isInitialized]) => {
        if (isInitialized) {
          this.#inited$.resolve();
          return;
        }
        const result = await pglite$$().query(
          `SELECT EXISTS (
    SELECT 1
    FROM pg_namespace
    WHERE nspname = 'drizzle'
);`,
        );
        const exists = (result.rows[0] as any)['exists'];
        if (exists) {
          this.#inited$.resolve();
          return;
        }
        return firstValueFrom(this.#http.get('./assets/pglist.init.json'))
          .then((value) => {
            return (db$$() as any).dialect.migrate(
              value,
              (db$$() as any).session,
              {},
            );
          })
          .then(() => {
            this.#inited$.resolve();
            return this.#initCheck.save(true);
          });
      },
    );
  }
  #trpc = inject(RemoteService).trpcClient$$;
  #dbChange = inject(DbChangeToken, { optional: true });
  listen() {
    {
      const res = db$$().select().from(asrEntity).toSQL();
      const asrListen = pglite$$().live.changes<typeof asrEntity.$inferSelect>(
        res.sql,
        res.params,
        asrEntity.id.name,
      );
      asrListen.then((res) => {
        function convert(item: any) {
          const newItem: any = {};
          for (const [key, value] of Object.entries(item)) {
            for (const [propName, column] of Object.entries(asrEntity)) {
              if (column.name === key) {
                newItem[propName] = value;
                break;
              }
            }
          }
          return newItem;
        }
        res.subscribe(async (value) => {
          this.#list.updateList();
          const trpc = await this.#trpc();
          for (const item of value) {
            if (item.updateSource === 'server') {
              continue;
            }
            switch (item.__op__) {
              case 'INSERT': {
                const newItem = convert(item);
                trpc.asr.sync.mutate(newItem);
                break;
              }
              case 'DELETE': {
                trpc.asr.remove.mutate(item);
                break;
              }
              case 'UPDATE': {
                const changedColumns = item['__changed_columns__'];
                const updateData: Partial<typeof asrEntity.$inferInsert> = {};

                for (const col of changedColumns) {
                  if (col === 'userId') {
                  } else if (col === 'createdAt') {
                  } else if (col === 'updatedAt') {
                  } else if (col === 'updateSource') {
                  } else {
                    (updateData as any)[col] = (item as any)[col];
                  }
                }
                const newItem = convert(updateData);
                trpc.asr.update.mutate({ ...newItem, id: item.id });
                break;
              }
              case 'RESET': {
                break;
              }

              default:
                break;
            }
          }
        });
      });
    }
    {
      const configSql = db$$().select().from(AudioGlobalConfigDefine).toSQL();

      const configListen = pglite$$().live.changes<
        typeof AudioGlobalConfigDefine.$inferSelect
      >(configSql.sql, configSql.params, AudioGlobalConfigDefine.id.name);
      configListen.then((res) => {
        res.subscribe(async (value) => {
          this.#list.updateList();
          this.#dbChange?.config(value);

          const trpc = await this.#trpc();
          if (
            value[0].__op__ === 'UPDATE' &&
            value[0].updateSource !== 'server'
          ) {
            trpc.user.syncConfig.mutate(value[0]);
          }
        });
      });
    }
  }

  async clean() {
    const list = await indexedDB.databases();
    await db$$().$client.close();
    for (const item of list) {
      if (item.name) {
        await new Promise((res, rej) => {
          const req = indexedDB.deleteDatabase(item.name!);
          req.onsuccess = res;
          req.onerror = rej;
        });
      }
    }
    await this.#initCheck.save(false);
    updatePgDb();
    this.#inited$ = Promise.withResolvers<void>();
    this.inited$$ = this.#inited$.promise;
  }
}
