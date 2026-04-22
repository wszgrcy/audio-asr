import * as v from 'valibot';
import { NFCSchema, setComponent } from '@piying/view-angular-core';
import { actions } from '@piying/view-angular';
import { Router } from '@angular/router';
import { resource } from '@angular/core';
import { safeDefine } from '../define';
import { LeftListNFCC } from '../../component/list/component';
import { AsrService, ListService } from '../../service';
import { computedWithPrev } from '../../../util/computed-with-prev';
import { RouterConfig } from '../../../const/router-config';

export const MainPage = v.pipe(
  v.object({
    content: v.object({
      router: v.pipe(NFCSchema, safeDefine.setComponent('router-outlet')),
    }),
    side: v.pipe(
      v.object({
        btnList: v.pipe(
          v.tuple([
            v.pipe(
              NFCSchema,
              safeDefine.setComponent('button', (actions) => {
                return [
                  actions.inputs.patch({
                    content: { icon: { fontIcon: 'home' } },
                    shape: 'circle',
                  }),
                  actions.class.bottom('text-primary'),
                  actions.inputs.patchAsync({
                    clicked: (field) => {
                      return () => {
                        field.injector
                          .get(Router)
                          .navigateByUrl(RouterConfig.main);
                      };
                    },
                  }),
                ];
              }),
            ),
            v.pipe(
              NFCSchema,
              safeDefine.setComponent('button', (actions) => {
                return [
                  actions.inputs.patch({
                    content: { icon: { fontIcon: 'settings' } },
                    shape: 'circle',
                  }),
                  actions.class.bottom('text-primary'),
                  actions.inputs.patchAsync({
                    clicked: (field) => {
                      return () => {
                        field.injector
                          .get(Router)
                          .navigateByUrl(RouterConfig.globalConfig);
                      };
                    },
                  }),
                ];
              }),
            ),
            v.pipe(NFCSchema, setComponent('div'), actions.class.top('flex-1')),
            v.pipe(
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
          ]),
          actions.wrappers.patch(['div']),
          actions.class.top('flex gap-2'),
        ),
        list2: v.pipe(
          NFCSchema,
          setComponent(LeftListNFCC),
          actions.inputs.patchAsync({
            list: (field) => {
              const app = field.injector.get(ListService);
              const asr = field.injector.get(AsrService);

              const list$$ = resource({
                params: () => {
                  return app.update$();
                },
                loader: () => {
                  return asr.find({ take: 9999, skip: 0 }).then((result) => {
                    return result.list.map((item) => {
                      return {
                        label: item.title,
                        id: item.id,
                        source: item.source,
                        data: item,
                      };
                    });
                  });
                },
                injector: field.injector,
              });
              return computedWithPrev((list) => {
                return list$$.isLoading() ? (list ?? []) : list$$.value()!;
              });
            },
          }),
          actions.outputs.patchAsync({
            itemDelete: (field) => {
              return (item: any) => {
                const asr = field.injector.get(AsrService);
                asr.remove(item.id);
              };
            },
          }),
          actions.class.top('min-w-[250px]'),
        ),
      }),
      actions.wrappers.set([{ type: 'div' }]),
      actions.class.top('bg-base-100 h-full z-9'),
    ),
  }),
  safeDefine.setComponent('drawer', (actions) => {
    return [
      actions.inputs.patch({
        contentClass:
          'flex flex-col *:last:flex-1 h-[100vh] will-change-transform',
        mode: 'side',
        // opened: true,
      }),
    ];
  }),
  actions.class.top('lg:drawer-open'),
);

export const TabsPage = v.pipe(
  NFCSchema,
  safeDefine.setComponent('dock-tab', (actions) => {
    return [
      actions.attributes.patch({ class: 'lg:hidden' }),
      actions.inputs.patch({
        list: [
          {
            title: '操作',
            router: { routerLink: ['home'] },
            icon: {
              fontIcon: 'add',
            },
          },
          {
            title: '列表',
            router: { routerLink: ['list'] },
            icon: {
              fontIcon: 'list',
            },
          },
          {
            title: '配置',
            router: { routerLink: ['globalConfig'] },
            icon: {
              fontIcon: 'settings',
            },
          },
        ],
      }),
    ];
  }),
);
