import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationItem } from '../../../navigation.types';
import { NavigationBasicItemComponent } from '../../../vertical/components/basic/basic.component';
import { NavigationCollapsableItemComponent } from '../../../vertical/components/collapsable/collapsable.component';
import { NavigationDividerItemComponent } from '../../../vertical/components/divider/divider.component';

@Component({
  selector: 'app-navigation-group-item',
  templateUrl: './group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    MatIconModule,
    NavigationBasicItemComponent,
    NavigationCollapsableItemComponent,
    NavigationDividerItemComponent,
    forwardRef(() => NavigationGroupItemComponent),
  ],
})
export class NavigationGroupItemComponent {
  @Input() autoCollapse!: boolean;
  @Input() item!: NavigationItem;

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
