import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  IsActiveMatchOptions,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { NavigationItem, SubsetMatchOptions } from '../../../navigation.types';

@Component({
  selector: 'app-navigation-basic-item',
  templateUrl: './basic.component.html',
  standalone: true,
  imports: [
    NgClass,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    NgTemplateOutlet,
    MatIconModule,
  ],
})
export class NavigationBasicItemComponent {
  @Input() item!: NavigationItem;
  isActiveMatchOptions!: IsActiveMatchOptions;
  ngOnInit(): void {
    this.isActiveMatchOptions =
      this.item.activateMatchOptions ?? SubsetMatchOptions;
  }
}
