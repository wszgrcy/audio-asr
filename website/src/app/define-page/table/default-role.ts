import * as v from 'valibot';
import {
  formConfig,
  NFCSchema,
  setAlias,
  setComponent,
} from '@piying/view-angular-core';
import { actions } from '@piying/view-angular';

import { DialogService } from '../../service/dialog.service';
import { LeftTitleAction } from '../common/left-title';
import { PickerTimeRangeDefine } from '../common/picker-time-range';
import { OrgPermissionDefine } from '@project/define';
import { authClient } from '../../service/auth.service';
import { UserWithRole } from 'better-auth/plugins';
import { dateToStr, dateInRange } from '../../util/time';
import { TableResourceService } from '@piying-lib/angular-daisyui/extension';
import { omitBy } from 'es-toolkit';
const NewRoleDefine = v.object({
  role: v.pipe(
    v.string(),
    v.title('角色'),
    actions.props.patch({
      labelPosition: 'top',
    }),
  ),
  permission: v.pipe(
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
            return ((OrgPermissionDefine as any)[field.key!] as any[]).map(
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
});
const FilterCondition = v.pipe(
  v.object({
    params: v.pipe(
      v.object({
        name: v.pipe(v.optional(v.string()), v.title('name'), LeftTitleAction),
        createdAt: v.pipe(
          v.optional(PickerTimeRangeDefine),
          v.title('createdAt'),
          LeftTitleAction,
        ),
      }),
      formConfig({ updateOn: 'submit' }),
      actions.wrappers.set(['div']),
      actions.class.top('flex gap-4'),
      setAlias('filterParams'),
    ),
    __flex: v.pipe(NFCSchema, setComponent('div'), actions.class.top('flex-1')),
    reset: v.pipe(
      NFCSchema,
      setComponent('input-button'),
      actions.inputs.patch({ type: 'reset', color: 'error' }),
      actions.inputs.patchAsync({
        clicked: (field) => {
          return () => {
            const result = field.get(['..', 'params'])!.form.control!;
            result.reset();
          };
        },
      }),
    ),
    submit: v.pipe(
      NFCSchema,
      setComponent('input-button'),
      actions.inputs.patch({ type: 'submit', color: 'primary' }),
      actions.inputs.patchAsync({
        clicked: (field) => {
          return () => {
            const result = field.get(['..', 'params'])!.form.control!;
            result.emitSubmit();
            console.log(result.errors);

            field.injector
              .get(TableResourceService)
              .setParams('query', result.value);
          };
        },
      }),
    ),
  }),
  actions.wrappers.set(['div']),
  actions.class.top('flex gap-2'),
);
export const DefaultRolePageDefine = v.pipe(
  v.object({
    query: FilterCondition,
    table: v.pipe(
      NFCSchema,
      setAlias('table'),
      setComponent('table'),

      actions.inputs.patchAsync({
        define: (field) => {
          return {
            row: {
              head: [
                {
                  columns: ['id', 'name', 'permission', 'createdAt', 'actions'],
                },
              ],
              body: [
                {
                  define: v.pipe(v.tuple([]), setComponent('tr')),
                  columns: ['id', 'name', 'permission', 'createdAt', 'actions'],
                },
              ],
            },
            columns: {
              id: {
                head: 'id',
                body: (data: any) => {
                  return data.id;
                },
              },
              name: {
                head: 'name',
                body: (data: any) => {
                  return data.role;
                },
              },
              permission: {
                head: 'permission',
                body: (data: any) => {
                  return Object.entries(data.permission)
                    .map(([key, value]) => {
                      return `${key}:${(value as any).join(',')}`;
                    })
                    .join(';');
                },
              },
              createdAt: {
                head: v.pipe(
                  NFCSchema,
                  setComponent('common-data'),
                  actions.inputs.patch({ content: 'createdAt' }),
                  actions.wrappers.set(['td']),
                ),
                body: (data: UserWithRole) => {
                  return dateToStr(data.createdAt);
                },
              },

              email: {
                head: 'email',
                body: (data: UserWithRole) => {
                  return data.email;
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
                          return async () => {
                            const item = field.context['item$']();
                            field.injector.get(DialogService).openDialog({
                              title: '更新角色',
                              schema: NewRoleDefine,
                              value: {
                                role: item.role,
                                permission: Object.keys(
                                  OrgPermissionDefine,
                                ).reduce((obj, key) => {
                                  obj[key] = item.permission[key] ?? [];
                                  return obj;
                                }, {} as any),
                              },
                              applyValue: async (value) => {
                                console.log(value);
                                value.permission = omitBy(
                                  value.permission,
                                  (a) => !a.length,
                                ) as any;
                                const updateData: any = {
                                  permission: value.permission,
                                };
                                if (value.role !== item.role) {
                                  updateData['roleName'] = value.role;
                                }
                                const result =
                                  await authClient.organization.updateRole({
                                    roleId: item.id,
                                    data: updateData,
                                  });
                                field.injector
                                  .get(TableResourceService)
                                  .needUpdate();
                              },
                            });
                          };
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
                            const item = field.context['item$']();
                            await authClient.organization.deleteRole({
                              roleId: item.id,
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
              return () => {
                field.injector.get(DialogService).openDialog({
                  title: '添加角色',
                  schema: NewRoleDefine,
                  value: {
                    permission: Object.keys(OrgPermissionDefine).reduce(
                      (obj, key) => {
                        obj[key] = [];
                        return obj;
                      },
                      {} as any,
                    ),
                  },
                  applyValue: async (value) => {
                    console.log(value);
                    value.permission = omitBy(
                      value.permission,
                      (a) => !a.length,
                    ) as any;
                    const result =
                      await authClient.organization.createRole(value);
                    field.injector.get(TableResourceService).needUpdate();
                  },
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
            query?: {
              name?: string;
              createdAt?: [Date, Date];
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
                  const list = await authClient.organization.list();
                  const result = await authClient.organization.listRoles({
                    query: {
                      organizationId: list.data!.find(
                        (item) => item.slug === 'default',
                      )!.id,
                    },
                  });
                  return result;
                })()
              : lastData;
          let list = result.data!;
          list = list.filter((item) => {
            let result = input.query?.name
              ? item.role.includes(input.query.name)
              : true;
            if (!result) {
              return result;
            }

            result = input.query?.createdAt
              ? dateInRange(item.createdAt, input.query.createdAt)
              : true;
            return result;
          });
          list = list.slice(
            input.page.index,
            input.page.index + input.page.size,
          );
          return [result.data!.length, list];
        },
      );
    },
  }),
  actions.props.patchAsync({
    isLoading: (field) => {
      return field.injector.get(TableResourceService).isLoading$$;
    },
  }),
);
