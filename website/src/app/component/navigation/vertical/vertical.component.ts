import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  NavigationItem,
  NavigationMode,
  NavigationPosition,
} from '../navigation.types';
import { NavigationBasicItemComponent } from '../vertical/components/basic/basic.component';
import { NavigationCollapsableItemComponent } from '../vertical/components/collapsable/collapsable.component';
import { NavigationDividerItemComponent } from '../vertical/components/divider/divider.component';
import { NavigationGroupItemComponent } from '../vertical/components/group/group.component';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './vertical.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NavigationBasicItemComponent,
    NavigationCollapsableItemComponent,
    NavigationDividerItemComponent,
    NavigationGroupItemComponent,
  ],
})
export class NavigationComponent {
  @Input() autoCollapse: boolean = true;

  @Input() navigation: NavigationItem[] = [];

  @Output() readonly modeChanged: EventEmitter<NavigationMode> =
    new EventEmitter<NavigationMode>();
  @Output() readonly openedChanged: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output()
  readonly positionChanged: EventEmitter<NavigationPosition> =
    new EventEmitter<NavigationPosition>();

  onCollapsableItemCollapsed: ReplaySubject<NavigationItem> =
    new ReplaySubject<NavigationItem>(1);
  onCollapsableItemExpanded: ReplaySubject<NavigationItem> =
    new ReplaySubject<NavigationItem>(1);
  onRefreshed: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

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
