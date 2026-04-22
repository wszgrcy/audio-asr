import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PiyingViewGroupBase } from '@piying/view-angular';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'cyia-label-group',
  templateUrl: './component.html',
  standalone: true,
  imports: [
    MatTabsModule,
    NgTemplateOutlet,
    MatTooltipModule,
    MatInputModule,
    FormsModule,
  ],
  styleUrl: './component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelGroupFGC extends PiyingViewGroupBase {}
