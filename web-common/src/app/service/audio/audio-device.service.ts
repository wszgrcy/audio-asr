import { inject, Injectable } from '@angular/core';
import { AudioInputService } from './audio-input.service';
import { AudioOutputService } from './audio-output.service';

@Injectable({
  providedIn: 'root',
})
export class AudioDeviceService {
  input = inject(AudioInputService);
  output = inject(AudioOutputService);

  async createAudio(type: 'input' | 'output') {
    return type === 'input' ? this.input.create() : this.output.create();
  }
}
