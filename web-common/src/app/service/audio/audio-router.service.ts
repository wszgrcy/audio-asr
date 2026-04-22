import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import {
  AudioDataChildService,
  AudioDataManagerService,
} from './audio-data-manager.service';

@Injectable()
export class AudioDataService {
  readonly #activateRoute = inject(ActivatedRoute);

  readonly id$ = toSignal<string>(
    this.#activateRoute.params.pipe(map((item) => item['id'])),
  );
  dataManager = inject(AudioDataManagerService);
  current$$ = computed<AudioDataChildService>(() => {
    return this.dataManager.getChild(this.id$()!);
  });
}
