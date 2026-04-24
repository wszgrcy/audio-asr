import { $localize } from '@cyia/localize';
import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';
import { actions } from '@piying/view-angular';
import { effect, untracked } from '@angular/core';
import { safeDefine } from '../define';

import { ScrollEndWC } from '../wrapper/scroll-end';
import { InfiniteListService } from '@piying-lib/angular-daisyui/extension';
import { AsrService, LeftListNFCC, ListService } from '@@web-common';

export const AudioListPage = v.pipe(
  v.tuple([
    v.pipe(
      v.object({
        start: v.pipe(NFCSchema, setComponent('div')),
        center: v.pipe(
          NFCSchema,
          safeDefine.setComponent('common-data', (actions) => {
            return [actions.inputs.patch({ content: $localize`数据列表` })];
          }),
        ),
        end: v.pipe(
          v.object({
            __menu: v.pipe(
              NFCSchema,
              safeDefine.setComponent('button', (actions) => {
                return [
                  actions.inputs.patch({
                    content: { icon: { fontIcon: 'sync' } },
                    shape: 'circle',
                    style: 'ghost',
                    size: 'sm',
                  }),
                  actions.inputs.patchAsync({
                    clicked: (field) => {
                      return async () => {
                        const asr = field.injector.get(AsrService);
                        await asr.syncRemoteList();
                      };
                    },
                  }),
                ];
              }),
            ),
          }),
        ),
      }),
      safeDefine.setComponent('navbar'),
      actions.class.top('sticky top-0 bg-base-200 z-9'),
    ),
    v.pipe(
      NFCSchema,
      setComponent(LeftListNFCC),
      actions.inputs.patchAsync({
        list: (field) => {
          const app = field.injector.get(ListService);
          const tr = field.injector.get(InfiniteListService);
          effect(
            () => {
              const index = app.update$();
              if (index) {
                tr.updateVersion();
                tr.setParams('page', undefined);
              }
            },
            { injector: field.injector },
          );

          return tr.allList$$;
        },
      }),
      actions.outputs.patchAsync({
        itemDelete: (field) => {
          const asr = field.injector.get(AsrService);
          return (item: any) => {
            asr.remove(item.id);
          };
        },
      }),
      actions.class.bottom('min-w-62.5'),
      actions.wrappers.patch([{ type: ScrollEndWC }]),
      actions.props.patchAsync({
        initChange: (field) => {
          let index = 0;
          const tr = field.injector.get(InfiniteListService);
          let lastPromise: PromiseWithResolvers<void>;
          effect(
            () => {
              const version = tr.version$();
              if (!version) {
                return;
              }
              index = 0;
              lastPromise?.resolve();
            },
            { injector: field.injector },
          );
          return (input: { promise: PromiseWithResolvers<void> }) => {
            return untracked(async () => {
              if (index && tr.count$$() === tr.allList$$().length) {
                lastPromise = input.promise;
                return;
              }

              await tr.setParams('page', { take: 20, skip: index++ * 20 });
              setTimeout(() => {
                input.promise.resolve();
              }, 0);
            });
          };
        },
      }),
    ),
  ]),
  actions.providers.patch([InfiniteListService]),
  actions.hooks.merge({
    allFieldsResolved: (field) => {
      const tr = field.injector.get(InfiniteListService);
      tr.setRequest(async (input) => {
        const asr = field.injector.get(AsrService);
        if (!input.page) {
          return [0, []];
        }
        return asr
          .find({
            take: input.page.take,
            skip: input.page.skip,
          })
          .then((result) => {
            return [
              result.count,
              result.list.map((item) => {
                return {
                  label: item.title,
                  id: item.id,
                  source: item.source,
                  data: item,
                };
              }),
            ];
          });
      });
    },
  }),
);
