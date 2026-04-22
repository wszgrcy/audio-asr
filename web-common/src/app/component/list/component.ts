import { Component, input, output, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MergeClassPipe } from '@piying-lib/angular-core';
import { PurePipe } from '@cyia/ngx-common/pipe';
import { formatTime } from '@@ref/web-common/src/util/format-time';
@Component({
  selector: 'left-list',
  templateUrl: './component.html',
  imports: [RouterLink, RouterLinkActive, MergeClassPipe, PurePipe],
})
export class LeftListNFCC {
  static __version = 2;
  templateRef = viewChild.required('templateRef');
  list = input<{ label: string; source: string; id: string; data: any }[]>();
  enableDelete = input(false);
  itemDelete = output<any>();
  itemDelete1(event: PointerEvent, item: any) {
    event.stopPropagation();
    this.itemDelete.emit(item);
  }
  formatTime = formatTime;
}
