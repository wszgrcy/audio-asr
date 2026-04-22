import { Component, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InsertFieldDirective } from '@piying/view-angular';
import { PI_VIEW_FIELD_TOKEN } from '@piying/view-angular-core';
import { QueryBuilderService } from '@project/define/web';

@Component({
  selector: 'app-ref-wrapper',
  templateUrl: './component.html',
  imports: [FormsModule, InsertFieldDirective],
})
export class RefWrapper {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  #field$$ = inject(PI_VIEW_FIELD_TOKEN);
  #qb = inject(QueryBuilderService);
  valueChange(value: any) {
    const field = this.#field$$();
    if (value) {
      this.#qb.addField(field);
    } else {
      this.#qb.removeField(field);
    }
  }
  ngOnDestroy(): void {
    const field = this.#field$$();
    this.#qb.removeField(field);
  }
}
