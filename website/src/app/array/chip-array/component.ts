import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PurePipe } from '@cyia/ngx-common/pipe';
import { PiyingViewGroupBase } from '@piying/view-angular';
import { NgTemplateOutlet } from '@angular/common';
@Component({
  selector: 'chip-array',
  templateUrl: './component.html',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    PurePipe,
    NgTemplateOutlet,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './component.scss',
})
export class ChipFAC extends PiyingViewGroupBase {
  defaultLength = input<number>();
  initPrefix = input<(index: number | undefined) => any>();
  chipLabel = input.required<(index: number) => string>();
  label = input<string>();
  minLength = input<number>(0);

  activate$ = signal(0);

  ngOnInit(): void {
    // todo 这里的默认添加应该改成变更时检查?,有时候初始化并不会传入?
    const addLength = Math.max(
      0,
      (this.defaultLength() || 0) -
        (this.field$$().form.control!.value || []).length,
    );

    for (let i = 0; i < addLength; i++) {
      this.field$$().action.set(this.initPrefix()?.(i), i);
    }
  }

  addNewChip() {
    const index = this.field$$().children!().length;
    this.field$$().action.set(this.initPrefix()?.(index), index);
    this.switch(index);
  }
  remove(index: number) {
    if (this.activate$() >= index) {
      this.activate$.update((a) => a - 1);
    }
    this.field$$().action.remove(index);
  }
  switch(index: number) {
    this.activate$.set(index);
  }
}
