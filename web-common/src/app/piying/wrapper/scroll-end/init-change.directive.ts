import { Directive, input } from '@angular/core';

@Directive({
  selector: '[initChange]',
})
export class InitChangeDirective {
  initChange = input.required<() => any>();

  ngOnInit(): void {
    this.initChange()();
  }
}
