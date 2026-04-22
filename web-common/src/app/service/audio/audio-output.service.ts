import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioOutputService {
  async create() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
    });
    return { stream, dispose: () => {}  };
  }
}
