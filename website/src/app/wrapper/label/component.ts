import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { MatTooltipModule } from '@angular/material/tooltip';
import {
  InsertFieldDirective,
  PI_VIEW_FIELD_TOKEN,
} from '@piying/view-angular';

@Component({
  selector: 'wrapper-label',
  templateUrl: './component.html',
  standalone: true,
  imports: [MatTooltipModule, InsertFieldDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelWrapper {
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
  props$$ = computed(() => this.field$$().props());
}
