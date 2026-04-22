import {
  actions,
  asVirtualGroup,
  FieldLogicGroup,
  formConfig,
  hideWhen,
  NFCSchema,
  renderConfig,
  setAlias,
  setComponent,
} from '@piying/view-angular-core';
import * as v from 'valibot';
import { map, merge } from 'rxjs';
import { QueryBuilderService } from './query-builder.service';
import { computed } from '@angular/core';
import { isUndefined } from 'es-toolkit';
const opList = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '<', value: '<' },
  { label: '>', value: '>' },
  { label: '<=', value: '<=' },
  { label: '>=', value: '>=' },
  { label: 'contains', value: 'contains' },
  { label: 'begins with', value: 'beginsWith' },
  { label: 'ends with', value: 'endsWith' },
  { label: 'does not contain', value: 'doesNotContain' },
  { label: 'does not begin with', value: 'doesNotBeginWith' },
  { label: 'does not end with', value: 'doesNotEndWith' },
  { label: 'is null', value: 'null', valueCount: 0 },
  { label: 'is not null', value: 'notNull', valueCount: 0 },
  { label: 'in', value: 'in' },
  { label: 'not in', value: 'notIn' },
  { label: 'between', value: 'between', valueCount: 2 },
  { label: 'not between', value: 'notBetween', valueCount: 2 },
];
const opMap = opList.reduce(
  (obj, item) => {
    obj[item.value] = item.valueCount ?? 1;
    return obj;
  },
  {} as Record<string, number>,
);
const Empty_Array = [] as [];
export const RuleDefine = v.pipe(
  v.object({
    optional: v.pipe(
      v.optional(v.boolean(), true),
      v.title('可选'),
      actions.props.patch({
        labelPosition: 'top',
      }),
    ),
    type: v.pipe(
      v.optional(v.literal('rule'), 'rule'),
      setComponent(''),
      renderConfig({ hidden: true }),
    ),
    field: v.pipe(
      v.optional(v.string()),
      setComponent('select'),
      v.title('字段'),
      actions.props.patch({
        labelPosition: 'top',
      }),
      ...(typeof process.env.WORK_PLATFORM === 'string' &&
      process.env.WORK_PLATFORM === 'client'
        ? ([
            actions.inputs.patchAsync({
              options: (field) => {
                const service = field.injector.get(QueryBuilderService);
                return service.fieldList$$;
              },
            }),
          ] as any as [])
        : Empty_Array),
    ),
    operator: v.pipe(
      v.string(),
      setComponent('select'),
      actions.inputs.patchAsync({
        options: () => {
          return opList;
        },
      }),
      v.title('操作符'),
      actions.props.patch({
        labelPosition: 'top',
      }),
      setAlias('operator'),
    ),
    // 可能有0个/一个/多个, 应该根据操作符设计
    value: v.pipe(
      v.optional(
        v.tuple([
          v.pipe(
            v.optional(v.string()),
            hideWhen({
              disabled: true,
              listen: (fn) => {
                return fn({ list: [['@operator']] }).pipe(
                  map(({ list: [item] }) => {
                    return (opMap[item] ?? 0) < 1;
                  }),
                );
              },
            }),
            actions.wrappers.patch(['ref-wrapper']),
          ),
          v.pipe(
            v.optional(v.string()),
            hideWhen({
              disabled: true,
              listen: (fn) => {
                return fn({ list: [['@operator']] }).pipe(
                  map(({ list: [item] }) => {
                    return (opMap[item] ?? 0) < 2;
                  }),
                );
              },
            }),
          ),
        ]),
      ),
      formConfig({ emptyValue: [] }),
      v.title('值'),
      actions.wrappers.set(['label-wrapper']),
      actions.props.patch({
        labelPosition: 'top',
      }),
    ),
  }),
  setAlias('rule'),
  actions.wrappers.patch([
    { type: 'div', attributes: { class: 'flex gap-2' } },
  ]),
  formConfig({
    validators: [
      (control) => {
        if (control.value.optional) {
          return undefined;
        } else {
          const opCount = opMap[control.value.operator];
          for (let i = 0; i < opCount; i++) {
            if (control.value.value[i] === undefined) {
              return [{ kind: 'required' }];
            }
          }
        }
        return undefined;
      },
    ],
  }),
);
type Lazy = v.GenericSchema<
  {
    rules: v.InferInput<typeof GroupDefine | typeof RuleDefine>[];
  },
  {
    rules: v.InferOutput<typeof GroupDefine | typeof RuleDefine>[];
  }
>;
export const GroupCommonDefine = v.pipe(
  v.object({
    type: v.pipe(
      v.literal('group'),
      setComponent(''),
      renderConfig({ hidden: true }),
    ),
    combinator: v.optional(v.picklist(['and', 'or']), 'and'),
  }),
);
export const GroupLazyDefine: Lazy = v.pipe(
  v.object({
    rules: v.pipe(
      v.array(
        v.pipe(
          v.union([v.lazy(() => GroupDefine), RuleDefine]),
          setComponent('union-group'),
          formConfig({ disableOrUpdateActivate: false }),
          actions.hooks.merge({
            allFieldsResolved: (field) => {
              const control = field.form.control as FieldLogicGroup;
              const childControl =
                control.children$$()[control.activateIndex$()];
              merge(
                childControl.valueChanges,
                childControl.statusChanges,
              ).subscribe((value) => {
                const rawValue = childControl.getRawValue();
                if (!rawValue) {
                  return;
                }
                if (rawValue.type === 'group') {
                  control.activateIndex$.set(0);
                } else {
                  control.activateIndex$.set(1);
                }
              });
            },
          }),
        ),
      ),
      setComponent('union-array'),
      actions.inputs.patch({ layout: 'column', addPosition: 'top' }),
      actions.inputs.patchAsync({
        addDefine: () => {
          return v.pipe(
            v.tuple([
              v.pipe(
                NFCSchema,
                setComponent('button'),
                actions.inputs.patch({ content: '+group' }),
                actions.inputs.patchAsync({
                  clicked: (field) => {
                    return () => {
                      field.context['submit']({ type: 'group' });
                    };
                  },
                }),
              ),
              v.pipe(
                NFCSchema,
                setComponent('button'),
                actions.inputs.patch({ content: '+rule' }),
                actions.inputs.patchAsync({
                  clicked: (field) => {
                    return () => {
                      field.context['submit']({ type: 'rule' });
                    };
                  },
                }),
              ),
            ]),
          );
        },
      }),
      // node解析时使用
      ...(typeof process.env.WORK_PLATFORM === 'string' &&
      process.env.WORK_PLATFORM === 'server'
        ? ([
            v.transform((list: GroupType['rules']) => {
              return list.filter((item) => {
                if (item.type === 'group') {
                  return true;
                } else if (item.optional) {
                  if (
                    isUndefined(item.field) ||
                    isUndefined(item.operator) ||
                    item.value?.some((value) => typeof value === 'undefined')
                  ) {
                    return false;
                  }
                }
                return true;
              });
            }),
          ] as any as [])
        : Empty_Array),
    ),
  }),
);
export const GroupDefine = v.pipe(
  v.intersect([GroupCommonDefine, GroupLazyDefine]),
  asVirtualGroup(),
  actions.wrappers.patch([
    {
      type: 'fieldset-wrapper',
      attributes: {
        class: 'bg-base-200 border-base-300 rounded-box border p-4 w-full',
      },
    },
  ]),
  ...(typeof process.env.WORK_PLATFORM === 'string' &&
  process.env.WORK_PLATFORM === 'client'
    ? ([
        actions.props.patchAsync({
          title: (field) => {
            const control = field.form.control!;
            return computed(() => {
              return control.value.combinator
                ? `${control.value.type}-${control.value.combinator}`
                : control.value.type;
            });
          },
        }),
      ] as any as [])
    : Empty_Array),
);
type GroupType = v.InferOutput<typeof GroupDefine>;
// group里还有rules
// 需要解决的事lazy问题
// 还有group中可以添加group/rule
// rule是最基础的单位
// 也就是group要支持添加自身
