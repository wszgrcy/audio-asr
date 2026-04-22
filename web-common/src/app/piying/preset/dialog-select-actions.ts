import { computed, untracked } from '@angular/core';
import { CommonSelectOptions } from '@piying-lib/angular-core';
import { FormDialogService } from '@piying-lib/angular-daisyui/overlay';
import { actions, FieldControl, setComponent } from '@piying/view-angular-core';
import * as v from 'valibot';

export const DialogSelectActions = [
  actions.inputs.patchAsync({
    content: (field) => {
      return computed(() => {
        const value = field.form.control!.value;
        return untracked(() => {
          const options = field.props()['options'] as any[];
          if (Array.isArray(value)) {
            return options
              .filter((item) => value.includes(item.value))
              .map((item) => item.label)
              .join(',');
          }
          return options.find((item) => item.value === value)?.label;
        });
      });
    },
  }),
  actions.wrappers.set(['label-wrapper']),

  actions.wrappers.patchAsync('div', [
    actions.attributes.patch({ class: 'select' }),
    actions.events.patchAsync({
      click: (field) => {
        const options = field.props()['options'] as CommonSelectOptions;

        const multiple = field.props()['multiple'];
        return async (event) => {
          // let item: ResolvedOption | undefined;
          const result = await field.injector.get(FormDialogService).open({
            class: 'select-form-dialog',
            value: field.form.control!.value,
            schema: multiple
              ? v.pipe(
                  v.array(
                    v.pipe(
                      v.any(),
                      setComponent('boolean'),
                      actions.props.patch({ disableRequired: true }),
                    ),
                  ),
                  setComponent('checkbox-list'),
                  actions.inputs.patch({
                    options: options.map((item: any) => {
                      return {
                        value: item.value,
                        props: { title: item.label },
                      };
                    }),
                  }),
                )
              : v.pipe(
                  v.any(),
                  setComponent('radio'),
                  actions.inputs.patch({ options: options }),
                ),
            title: field.props()['title'] ?? `选择`,
            injector: field.injector,
            cancelButton: '取消',
          });
          if (result === undefined) {
            return;
          }
          (field.form.control as FieldControl).viewValueChange(result);
          // field.form.control!.updateValue(result);
          // if (item) {
          //   field.props.update((value) => {
          //     return {
          //       ...value,
          //       selectedLabel: item!.label,
          //     };
          //   });
          // }
        };
      },
    }),
  ]),
];
