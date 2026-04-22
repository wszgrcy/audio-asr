import * as v from 'valibot';
import {
  formConfig,
  NFCSchema,
  setAlias,
  setComponent,
} from '@piying/view-angular-core';
import { actions } from '@piying/view-angular';

import {
  SortService,
  TableResourceService,
} from '@piying-lib/angular-daisyui/extension';
import { DialogService } from '../../service/dialog.service';
import { deepEqual } from 'fast-equals';
import { ApiPermissionObj } from '@project/define';
import { authClient } from '../../service/auth.service';
import { trpc } from '../../service/trpc';
import { UserWithRole } from 'better-auth/plugins';
import {
  dateToStr,
  formatDatetimeToStr,
  timeCompare,
  toDateStr,
} from '../../util/time';
import dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';
import { ConfirmService } from '../../service/confirm.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastService } from '../../service/toast.service';

const CreateApikeyDefine = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.title('名字'),
      actions.props.patch({
        labelPosition: 'top',
      }),
    ),
    expiresIn: v.pipe(
      v.number(),
      v.title('过期时间'),
      setComponent('date'),
      formConfig({
        transformer: {
          toModel(value, control) {
            return dayjs(value).diff(new Date(), 's');
          },
        },
      }),
      actions.attributes.patch({
        min: toDateStr(new Date()),
      }),
    ),
    // todo ,改成全列出来那种,然后选择
    permissions: v.pipe(
      v.record(
        v.string(),
        v.pipe(
          v.array(
            v.pipe(
              v.string(),
              setComponent('boolean'),
              actions.props.patch({ disableRequired: true }),
            ),
          ),
          formConfig({ emptyValue: [] }),
          actions.wrappers.patch(['div']),
          actions.class.top('flex gap-2 w-[100]'),
          actions.inputs.patchAsync({
            options: (field) => {
              return ((ApiPermissionObj as any)[field.key!] as any[]).map(
                (value) => {
                  return {
                    value,
                    props: {
                      title: value,
                    },
                  };
                },
              );
            },
          }),
          setComponent('checkbox-list'),
        ),
      ),
      setComponent('edit-group'),
      actions.inputs.patch({
        showKey: true,
        layout: 'column',
        disableAdd: true,
        disableRemove: true,
      }),
      v.title('权限'),
      actions.wrappers.set(['label-wrapper', 'validate-tooltip-wrapper']),
    ),
  }),
);

export const ApikeyPageDefine = v.pipe(
  v.object({
    table: v.pipe(
      NFCSchema,
      setAlias('table'),
      setComponent('table'),
      actions.props.patch({
        expandSelectModel: { _multiple: true, compareWith: deepEqual },
      }),
      actions.inputs.patchAsync({
        define: (field) => {
          const pageFiled = field.get(['..', 'page']);
          return {
            row: {
              head: [
                {
                  columns: ['id', 'name', 'createdAt', 'expiresAt', 'actions'],
                },
              ],
              body: [
                {
                  define: v.pipe(v.tuple([]), setComponent('tr')),
                  columns: ['id', 'name', 'createdAt', 'expiresAt', 'actions'],
                },
              ],
            },
            columns: {
              id: {
                head: 'id',
                body: (data: UserWithRole) => {
                  return data.id;
                },
              },
              name: {
                head: 'name',
                body: (data: any) => {
                  return data.name;
                },
              },
              createdAt: {
                head: v.pipe(
                  NFCSchema,
                  setComponent('common-data'),
                  actions.inputs.patch({ content: 'createdAt' }),
                  actions.wrappers.set(['td', 'sort-header']),
                  actions.props.patch({
                    key: 'createdAt',
                  }),
                ),
                body: (data: UserWithRole) => {
                  return dateToStr(data.createdAt);
                },
              },
              expiresAt: {
                head: 'expiresAt',
                body: (data: any) => {
                  const icon = timeCompare(data.expiresAt!) ? '✔️' : '❌';
                  return `${icon}${formatDatetimeToStr(data.expiresAt)}`;
                },
              },

              actions: {
                head: ' ',
                body: v.pipe(
                  v.object({
                    rename: v.pipe(
                      NFCSchema,
                      setComponent('button'),
                      actions.inputs.patch({
                        content: { icon: { fontIcon: 'edit' } },
                        shape: 'circle',
                        size: 'sm',
                      }),
                      actions.inputs.patchAsync({
                        clicked: (field) => {
                          return async () => {};
                        },
                      }),
                    ),
                    delete: v.pipe(
                      NFCSchema,
                      setComponent('button'),
                      actions.inputs.patch({
                        content: { icon: { fontIcon: 'delete' } },
                        shape: 'circle',
                        size: 'sm',
                      }),
                      actions.class.top('text-error'),
                      actions.inputs.patchAsync({
                        clicked: (field) => {
                          return async () => {
                            await authClient.apiKey.delete({
                              keyId: field.context['item$']().id,
                            });
                            field.injector
                              .get(TableResourceService)
                              .needUpdate();
                          };
                        },
                      }),
                    ),
                  }),
                  actions.wrappers.set(['td']),
                  actions.class.top('flex gap-2'),
                ),
              },
            },
          };
        },
      }),
      actions.inputs.patchAsync({
        data: (field) => {
          return field.injector.get(TableResourceService).list$$;
        },
      }),
      actions.providers.patch([SortService]),
      actions.hooks.merge({
        allFieldsResolved: (field) => {
          const instance = field.injector.get(SortService);
          instance.setInitValue({ createdAt: -1 });
          instance.sortList.set(['createdAt']);
          instance.multiple.set(false);
          instance.value$$.subscribe((value) => {
            field.injector
              .get(TableResourceService)
              .setParams('sort', value[0]);
          });
        },
      }),
    ),

    bottom: v.pipe(
      v.object({
        add: v.pipe(
          NFCSchema,
          setComponent('button'),
          actions.inputs.patch({
            content: { icon: { fontIcon: 'add' }, title: 'add' },
          }),
          actions.inputs.patchAsync({
            clicked: (field) => {
              return async () => {
                const ref = field.injector.get(DialogService).openDialog({
                  title: '创建key',
                  schema: CreateApikeyDefine,
                  value: {
                    permissions: Object.keys(ApiPermissionObj).reduce(
                      (obj, key) => {
                        obj[key] = [];
                        return obj;
                      },
                      {} as any,
                    ),
                  },
                  applyValue: async (value) => {
                    const result = await trpc.apikey.create.mutate(value);
                    field.injector.get(TableResourceService).needUpdate();
                    console.log(result);
                    return result;
                  },
                });
                const result = await firstValueFrom(ref.closed);
                if (!result) {
                  return;
                }
                field.injector.get(ConfirmService).open({
                  title: 'apikey',
                  message: result.key,
                  buttons: [
                    {
                      label: '复制',
                      close: async () => {
                        const a = field.injector
                          .get(Clipboard)
                          .copy(result.key);
                        field.injector
                          .get(ToastService)
                          .add('复制成功', { type: 'success' });
                        await new Promise(() => {});
                      },
                    },
                    { label: '关闭' },
                  ],
                  modal: true,
                });
              };
            },
          }),
        ),
        page: v.pipe(
          NFCSchema,
          setComponent('pagination'),
          actions.class.top('mt-4 flex justify-end'),
          actions.inputs.patch({
            value: {
              size: 10,
              index: 0,
            },
          }),
          actions.inputs.patchAsync({
            count: (field) => {
              return field.injector.get(TableResourceService).count$$;
            },
          }),
          actions.outputs.patchAsync({
            valueChange: (field) => {
              return (data) => {
                field.injector
                  .get(TableResourceService)
                  .setParams('page', data);
              };
            },
          }),
        ),
      }),
      actions.wrappers.set(['div']),
      actions.class.top('flex justify-between items-center'),
    ),
  }),
  setAlias('table-block'),
  actions.wrappers.set([{ type: 'loading-wrapper' }]),
  actions.providers.patch([TableResourceService]),
  actions.hooks.merge({
    allFieldsResolved: async (field) => {
      let lastData;
      field.injector.get(TableResourceService).setRequest(
        async (
          input: {
            page: {
              size: number;
              index: number;
            };
          },
          needUpdate,
        ) => {
          if (!input.page) {
            return [0, []];
          }

          const result =
            !lastData || needUpdate
              ? await (async () => {
                  const result = await authClient.apiKey.list();
                  return result!;
                })()
              : lastData;

          const list = result.data!.apiKeys.slice(
            input.page.index,
            input.page.index + input.page.size,
          );
          return [result.data!.total, list];
        },
      );
    },
  }),
);
