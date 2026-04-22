import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PiyingViewGroupBase } from '@piying/view-angular';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { PurePipe } from '@cyia/ngx-common/pipe';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'cyia-remote-search-group',
  templateUrl: './component.html',
  standalone: true,
  imports: [
    MatTabsModule,
    NgTemplateOutlet,
    MatTooltipModule,
    MatInputModule,
    FormsModule,
    PurePipe,
    MatButtonModule,
  ],
  styleUrl: './component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoteSearchGroupFGC extends PiyingViewGroupBase {
  searchContent$ = signal('');
  #lazySubject = new Subject<string>();
  groupChange = output<Record<string, any>>();
  canHidden = (content: string, key?: any[]) => {
    if (!key || !content) {
      return false;
    }
    return !key.join('.').includes(content);
  };

  valueChange(event: any) {
    this.#lazySubject.next(event);
  }
  ngOnInit(): void {
    this.#lazySubject.pipe(debounceTime(200)).subscribe((value) => {
      this.searchContent$.set(value);
    });
  }
  search() {
    this.groupChange.emit(this.field$$().form.control?.value);
  }
}
