import { Component, viewChild } from '@angular/core';
import {
  AttributesDirective,
  InsertFieldDirective,
  EventsDirective,
} from '@piying/view-angular';
@Component({
  selector: 'app-form',
  templateUrl: './component.html',
  imports: [AttributesDirective, InsertFieldDirective, EventsDirective],
})
export class FormWC {
  static __version = 2;
  templateRef = viewChild.required('templateRef');

  onSubmit($event: Event): boolean {
    return ($event?.target as HTMLFormElement | null)?.method === 'dialog';
  }
}
