import { Component, forwardRef, signal, viewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from '@piying/view-angular';

@Component({
  selector: 'app-title-input',
  templateUrl: './component.html',
  styleUrl: './component.scss',
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TitleInputFCC),
      multi: true,
    },
  ],
})
export class TitleInputFCC extends BaseControl {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  isEdit$ = signal(false);
  oldValue$ = signal('');

  valueChange2() {
    this.isEdit$.set(false);
    this.valueChange(this.value$());
    this.oldValue$.set(this.value$());
  }
  focusChange(value?: boolean, el?: HTMLInputElement) {
    this.isEdit$.set(true);
    this.oldValue$.set(this.value$());
    if (value) {
      el!.focus();
    }
  }
  blurChange() {
    this.isEdit$.set(false);
    this.value$.set(this.oldValue$());
  }
}
