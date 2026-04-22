import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, viewChild } from '@angular/core';

import { PiyingViewGroupBase } from '@piying/view-angular';
import { FieldLogicGroup } from '@piying/view-angular-core';
@Component({
  selector: 'app-union-group',
  templateUrl: './component.html',
  imports: [NgTemplateOutlet],
})
export class UnionGroupFGC extends PiyingViewGroupBase {
  static __version = 2;
  templateRef = viewChild.required('templateRef');

  #activatedIndex$$ = computed(() => {
    const control = this.field$$().form.control as FieldLogicGroup;
    return control.activateIndex$();
  });
  activateChild$$ = computed(() => {
    return this.field$$().children!()[this.#activatedIndex$$()];
  });
}
