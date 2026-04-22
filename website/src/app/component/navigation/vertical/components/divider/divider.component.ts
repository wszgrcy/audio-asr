import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { NavigationItem } from '../../../navigation.types';

@Component({
  selector: 'app-navigation-divider-item',
  templateUrl: './divider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass],
})
export class NavigationDividerItemComponent {
  @Input() item!: NavigationItem;
}
