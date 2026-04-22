import { Component, inject, signal, viewChild } from '@angular/core';
import { InsertFieldDirective } from '@piying/view-angular';
import { InitChangeDirective } from './init-change.directive';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular-core';

@Component({
  selector: 'app-scroll-end',
  templateUrl: './component.html',
  imports: [InsertFieldDirective, InitChangeDirective],
  preserveWhitespaces: false,
})
export class ScrollEndWC {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  field = inject(PI_VIEW_FIELD_TOKEN);
  loading$ = signal(true);

  fn = () => {
    this.loading$.set(false);
    const p = Promise.withResolvers();
    this.field().props()['initChange']({ promise: p });
    p.promise.then(() => {
      this.loading$.set(true);
    });
  };
}
