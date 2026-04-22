import * as v from 'valibot';
import {
  formConfig,
  NFCSchema,
  setAlias,
  setComponent,
} from '@piying/view-angular-core';
import { actions } from '@piying/view-angular';

import {
  SortList,
  SortService,
  TableResourceService,
} from '@piying-lib/angular-daisyui/extension';
import { DialogService } from '../../service/dialog.service';
import { LeftTitleAction } from '../common/left-title';
import { deepEqual } from 'fast-equals';
import { authClient } from '../../service/auth.service';
import { UserWithRole } from 'better-auth/plugins';
import { dateToStr } from '../../util/time';
import { DefaultRoleService } from '../../service/default-role.service';

const UpdateRoleDefine = v.pipe(
  v.object({
    role: v.pipe(
      v.array(
        v.pipe(
          v.string(),
          setComponent('select'),
          actions.inputs.patchAsync({
            options: async (field) => {
              const instance = field.injector.get(DefaultRoleService);
              const list = await instance.getList();
              return list[1]
                .map((item) => {
                  return { label: item.role, value: item.role } as any;
                })
                .concat([
                  {
                    label: 'owner',
                    value: 'owner',
                    disabled: true,
                  },
                ]);
            },
          }),
        ),
      ),
      setComponent('edit-group'),
    ),
  }),
);
const FilterCondition = v.pipe(
  v.object({
    params: v.pipe(
      v.object({
        role: v.pipe(v.optional(v.string()), v.title('role'), LeftTitleAction),
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
export const UserPageDefine = v.pipe(
  v.object({
    query: FilterCondition,
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
                  columns: ['id', 'name', 'email', 'createdAt', 'actions'],
                },
              ],
              body: [
                {
                  define: v.pipe(v.tuple([]), setComponent('tr')),
                  columns: ['id', 'name', 'email', 'createdAt', 'actions'],
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
                  return data.user.name;
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
                              title: '设置角色',
                              schema: UpdateRoleDefine,
                              value: {
                                role:
                                  typeof item.role === 'string'
                                    ? [item.role]
                                    : item.role,
                              },
                              applyValue: async (value) => {
                                await authClient.organization.updateMemberRole({
                                  role: value.role,
                                  memberId: item.id,
                                });
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
                            console.log('1');
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
              return () => {
                console.log('1');
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
    allFieldsResolved: (field) => {
      field.injector.get(TableResourceService).setRequest(
        async (input: {
          page: {
            size: number;
            index: number;
          };
          query: {
            role: string;
          };
          sort: SortList[number];
        }) => {
          if (!input.page) {
            return [0, []];
          }
          const result = await authClient.organization.listMembers({
            query: {
              limit: input.page.size,
              offset: input.page.index,
              ...(() => {
                if (input.query?.role) {
                  return {
                    filterField: 'role',
                    filterOperator: 'contains',
                    filterValue: input.query.role,
                  };
                }
                return {};
              })(),
              ...(() => {
                if (input.sort) {
                  return {
                    sortBy: input.sort.key,
                    sortDirection: input.sort.value === 1 ? 'asc' : 'desc',
                  };
                }
                return {};
              })(),
            },
          });

          return [result.data!.total, result.data!.members];
        },
      );
    },
  }),
);
