import {
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import {
  PiyingViewGroupBase,
  PiyingView,
  PI_INPUT_OPTIONS_TOKEN,
  AttributesDirective,
  EventsDirective,
} from '@piying/view-angular';
import { MatIconModule } from '@angular/material/icon';
import { SelectorlessOutlet } from '@cyia/ngx-common/directive';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurePipe } from '@cyia/ngx-common/pipe';
import {
  CssPrefixPipe,
  MergeClassPipe,
} from '@piying-lib/angular-daisyui/pipe';
@Component({
  selector: 'app-union-array',
  templateUrl: './component.html',
  imports: [
    MatIconModule,
    SelectorlessOutlet,
    NgTemplateOutlet,
    FormsModule,
    PurePipe,
    MergeClassPipe,
    CssPrefixPipe,
    AttributesDirective,
    EventsDirective,
  ],
})
export class UnionArrayFGC extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  PiyingView = PiyingView;
  defaultValue = input<(index: number) => any>();
  showKey = input(false);
  layout = input<'row' | 'columen'>('row');
  addPosition = input<'top' | 'bottom' | undefined>();
  disableRemove = input(false);
  newValue$ = signal(undefined);

  addDefine = input();
  schemaOptions$$ = computed(() => {
    return {
      schema:
        this.addDefine() ??
        this.field$$().form.control!.config$().groupValueSchema,
      options: {
        ...this.parentPyOptions!(),
        context: {
          ...this.parentPyOptions!().context,
          field: this.field$$(),
          submit: (value: any) => {
            this.field$$().action.set(value);
          },
        },
      },
      selectorless: true,
    };
  });

  parentPyOptions = inject(PI_INPUT_OPTIONS_TOKEN, { optional: true });
  wrapperClass$$ = computed(() => {
    return this.layout() === 'row' ? 'flex gap-2' : 'flex flex-col gap-2';
  });
  keySchema$$ = computed(() => {
    return this.field$$().form.control!.config$().groupKeySchema;
  });

  addNew() {
    // this.field$$().action.set(this.newValue$());
    // const valueF = this.newValue$$()!;
    // valueF.componentInstance!.form$$()!.root.reset();
  }

  removeItem(key: string) {
    this.field$$().action.remove(key);
  }
  modelOutput = (input: WritableSignal<any>) => {
    return {
      modelChange: (value: any) => {
        input.set(value);
      },
    };
  };
}
