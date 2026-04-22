import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PiyingViewGroupBase } from '@piying/view-angular';
import { NgTemplateOutlet } from '@angular/common';
@Component({
  selector: 'app-array-repeat',
  templateUrl: './array-repeat.component.html',
  imports: [MatIconModule, NgTemplateOutlet],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayRepeatFAC extends PiyingViewGroupBase {
  defaultLength = input<number>();
  initPrefix = input<(index: number | undefined) => any>();
  minLength = input<number>();

  ngOnInit(): void {
    const addLength = Math.max(
      0,
      (this.defaultLength() || 0) -
        (this.field$$().form.control!.value || []).length,
    );

    for (let i = 0; i < addLength; i++) {
      this.field$$().action.set(this.initPrefix()?.(i), i);
    }
  }
  remove(index: number) {
    this.field$$().action.remove(index);
  }
  add() {
    this.field$$().action.set(this.initPrefix()?.(undefined));
  }
}
