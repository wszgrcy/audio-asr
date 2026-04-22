import {
  Component,
  computed,
  forwardRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  PI_INPUT_OPTIONS_TOKEN,
  PiyingView,
  PiyingViewGroupBase,
} from '@piying/view-angular';

import { MatIconModule } from '@angular/material/icon';
import { SelectorlessOutlet } from '@cyia/ngx-common/directive';
import * as v from 'valibot';
import { actions, formConfig } from '@piying/view-angular-core';
import { PurePipe } from '@cyia/ngx-common/pipe';
export interface CheckboxOption {
  value: any;
  inputs?: any;
  props?: any;
}
const Empty_Array: any[] = [];
@Component({
  selector: 'app-checkbox-list',
  templateUrl: './component.html',
  imports: [
    FormsModule,
    MatIconModule,
    MatIconModule,
    SelectorlessOutlet,
    PurePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxListFCC),
      multi: true,
    },
  ],
})
export class CheckboxListFCC extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  readonly PiyingView = PiyingView;
  options = input<CheckboxOption[]>();
  #parentPyOptions = inject(PI_INPUT_OPTIONS_TOKEN, { optional: true });

  templateSchema$$ = computed(() => {
    return this.field$$().form.control!.config$().groupValueSchema!;
  });
  schemaItemFn = (template: any, input: CheckboxOption) => {
    return v.pipe(
      v.optional(template),
      formConfig({
        transformer: {
          toModel(value, control) {
            return value ? input.value : undefined;
          },
          toView(value, control) {
            return !!value;
          },
        },
      }),
      actions.inputs.patch(input.inputs ?? {}),
      actions.props.patch(input.props ?? {}),
    );
  };
  schemaOptions$$ = (template: any, input: CheckboxOption, value: any[]) => {
    return {
      schema: template,
      options: this.#parentPyOptions!(),
      selectorless: true,
      model: value.includes(input.value),
    };
  };
  value$$ = computed<any[]>(() => {
    return this.field$$().form.control!.value$$() ?? Empty_Array;
  });
  modelOutput = (booleanValue: any) => {
    return {
      modelChange: (value: any) => {
        const list = this.value$$().slice();
        if (value) {
          this.field$$().action.set(value);
        } else {
          const index = list.findIndex((item) => item === booleanValue);
          this.field$$().action.remove(index);
        }
      },
    };
  };
}
