import { inject, Injectable, resource } from '@angular/core';
import { ListService } from './list.service';
import { AsrService } from './asr.service';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  appService = inject(ListService);
  asrService = inject(AsrService);
  lastDevice = resource({
    params: () => {
      return this.appService.update$();
    },
    loader: async () => {
      return this.asrService.findDevice();
    },
  });
}
