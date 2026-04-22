import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  update$ = signal(0);
  updateList() {
    this.update$.update((a) => a + 1);
  }
}
