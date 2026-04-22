import { Component, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import {
  NavigationItem,
  NavigationComponent,
} from '../../component/navigation';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterOutlet,
    NavigationComponent,
  ],
})
export class NavComponent {
  private breakpointObserver = inject(BreakpointObserver);
  isOpended$ = signal(true);

  list: NavigationItem[] = [
    {
      id: 'dashboards',
      title: '系统管理',
      // subtitle: 'Unique dashboard designs',
      type: 'group',
      icon: 'home',
      children: [
        {
          id: 'dashboards.project',
          title: '账号',
          type: 'basic',
          icon: 'supervisor_account',
          link: '/dashboard/account',
        },
        {
          id: 'dashboards.role',
          title: '权限',
          type: 'basic',
          icon: 'manage_accounts',
          link: '/dashboard/role',
        },
        {
          id: 'dashboards.role-group',
          title: '权限组',
          type: 'basic',
          icon: 'supervisor_account',
          link: '/dashboard/role-group',
        },
        {
          id: 'dashboards.analytics',
          title: '版本',
          type: 'basic',
          icon: 'new_releases',
          link: '/dashboard/version',
        },
        {
          id: 'dashboards.analytics2',
          title: '测试',
          type: 'collapsable',
          icon: 'new_releases',
          children: [
            {
              id: 'dashboards.analytics3',
              title: '测试',
              type: 'basic',
              icon: 'new_releases',
              link: '/a',
            },
          ],
        },
      ],
    },
  ];
}
