import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControl } from '@piying/view-angular';

@Component({
  selector: 'cyia-label',
  templateUrl: 'component.html',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabelFCC),
      multi: true,
    },
  ],
})
// 只用来显示的
export class LabelFCC extends BaseControl {
  /** ---输入--- */
  /** @title 标签 */
  label = input<string>();
  /** @title 标签映射 */
  labelMap = input<Record<string, any>>();
  /** ---输出--- */
  display$$ = computed(() => {
    const value = this.label() ?? this.value$();
    const map = this.labelMap();
    return map ? map[value] : value;
  });
}
