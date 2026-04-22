import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import {
  InsertFieldDirective,
  PI_VIEW_FIELD_TOKEN,
} from '@piying/view-angular';
@Component({
  selector: 'form-wrapper',
  templateUrl: './component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './component.scss',
  imports: [InsertFieldDirective],
})
export class FormWrapper {
  submited = output<any>();
  field$$ = inject(PI_VIEW_FIELD_TOKEN);
}
