import { Component, input } from '@angular/core';
import { Color, MergeClassPipe } from '@piying-lib/angular-core';
import { computed } from '@angular/core';

export interface ProgressInfo {
  message?: string;
  value?: number;
  type?: string;
}
@Component({
  selector: 'app-process',
  templateUrl: './component.html',
  imports: [MergeClassPipe],
})
export class ProgressComponent {
  color = input<Color>('primary');
  info = input<ProgressInfo | undefined>();
  progressClass$$ = computed(() => {
    const color = this.color();
    return color ? `progress-${color}` : undefined;
  });
}
