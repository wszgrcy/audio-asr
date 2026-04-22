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
  selector: 'app-edit-group',
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
export class EditGroupFGC extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  newKey$$ = viewChild<SelectorlessOutlet<PiyingView>>('newKey');
  newValue$$ = viewChild<SelectorlessOutlet<PiyingView>>('newValue');
  PiyingView = PiyingView;
  defaultValue = input<(index: number) => any>();
  showKey = input(false);
  layout = input<'row' | 'columen'>('row');
  disableAdd = input(false);
  disableRemove = input(false);
  newKey$ = signal(undefined);
  newValue$ = signal(undefined);
  parentPyOptions = inject(PI_INPUT_OPTIONS_TOKEN, { optional: true });
  wrapperClass$$ = computed(() => {
    return this.layout() === 'row' ? 'flex gap-2' : 'flex flex-col gap-2';
  });
  keySchema$$ = computed(() => {
    return this.field$$().form.control!.config$().groupKeySchema;
  });
  schemaOptions$$ = (define: any) => {
    return {
      schema: define,
      options: {
        ...this.parentPyOptions!(),
        context: {
          ...this.parentPyOptions!().context,
          key$: this.newKey$,
          value$: this.newValue$,
          parent: this.parentPyOptions!().context,
          parentField: this.field$$(),
        },
      },
      selectorless: true,
    };
  };
  addNew() {
    if (this.keySchema$$()) {
      const keyF = this.newKey$$()!;
      const valueF = this.newValue$$()!;
      this.field$$().action.set(this.newValue$(), this.newKey$());
      keyF.componentInstance!.form$$()!.root.reset();
      valueF.componentInstance!.form$$()!.root.reset();
    } else {
      this.field$$().action.set(this.newValue$());
      const valueF = this.newValue$$()!;
      valueF.componentInstance!.form$$()!.root.reset();
    }
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
