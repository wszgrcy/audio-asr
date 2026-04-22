import * as v from 'valibot';
import {
  formConfig,
  NFCSchema,
  setAlias,
  setComponent,
} from '@piying/view-angular-core';
import { actions } from '@piying/view-angular';

import { LeftTitleAction } from '../common/left-title';
import { deepEqual } from 'fast-equals';
import { PickerTimeRangeDefine } from '../common/picker-time-range';
import { authClient } from '../../service/auth.service';
import { SuperUserService } from '../../service/super.service';
import { Organization, UserWithRole } from 'better-auth/plugins';
import { dateInRange, dateToStr } from '../../util/time';
import { TableResourceService } from '@piying-lib/angular-daisyui/extension';

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
export const OrganizationPageDefine = v.pipe(
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
                  columns: ['id', 'name', 'slug', 'createdAt', 'actions'],
                },
              ],
              body: [
                {
                  define: v.pipe(v.tuple([]), setComponent('tr')),
                  columns: ['id', 'name', 'slug', 'createdAt', 'actions'],
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
                body: (data: Organization) => {
                  return data.name;
                },
              },
              slug: {
                head: 'slug',
                body: (data: Organization) => {
                  return data.slug;
                },
              },
              createdAt: {
                head: v.pipe(
                  NFCSchema,
                  setComponent('common-data'),
                  actions.inputs.patch({ content: 'createdAt' }),
                  actions.wrappers.set(['td']),
                  actions.props.patch({
                    key: 'createdAt',
                    direction: -1,
                  }),
                ),
                body: (data: Organization) => {
                  return dateToStr(data.createdAt);
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
                            console.log('1');
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
                            const { data, error } =
                              await authClient.organization.delete({
                                organizationId: item.id,
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
      actions.props.patchAsync({
        data: (field) => {
          const user = field.injector.get(SuperUserService);
          return async (data: any) => {
            console.log(data);
            const list = await user.getOrganizationList();
            console.log(list);

            return list;
          };
        },

        filterParams: (field) => {
          return field.get(['@filterParams'])!.form.control!.valueChanges;
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
                const a = await authClient.organization.create({
                  name: 'test',
                  slug: 'test1',
                });
                console.warn('添加测试');
                field.injector.get(TableResourceService).needUpdate();
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
                  const result = authClient.organization.list();
                  return result;
                })()
              : lastData;
          let list = result.data!;
          list = list.filter((item) => {
            let result = input.query?.name
              ? item.name.includes(input.query.name)
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
