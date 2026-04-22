import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { MatTooltipModule } from '@angular/material/tooltip';
import { PurePipe } from '@cyia/ngx-common/pipe';
import { from, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import {
  PI_VIEW_FIELD_TOKEN,
  InsertFieldDirective,
} from '@piying/view-angular';

@Component({
  selector: 'tooltip-wrapper',
  templateUrl: './component.html',
  standalone: true,
  imports: [MatTooltipModule, PurePipe, AsyncPipe, InsertFieldDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipWrapper {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
  tooltipType = input<'value' | 'tooltip' | 'title' | undefined>();
  tooltipContent = (...args: any) => {
    if (this.tooltipType() === 'value') {
      return Promise.resolve(this.field$$().form.control?.value);
    }
    if (this.tooltipType() === 'tooltip') {
      return Promise.resolve(this.props$$()['tooltip']);
    }
    // 这个算临时解决添加实体用的,因为options的返回不一定是labelvalue
    if (this.tooltipType() === 'title') {
      return from(
        Array.isArray(this.props$$()['options']!)
          ? Promise.resolve(this.props$$()['options']!)
          : this.props$$()['options']! || [],
      ).pipe(
        map((list) => {
          return (
            ((list as any[]).find(
              (item: any) => item.value === this.field$$().form.control?.value,
            )?.label as any) || ''
          );
        }),
      );
    }
    return Promise.resolve(
      this.props$$()['description'] ?? this.props$$()['placeholder'],
    );
  };
}
