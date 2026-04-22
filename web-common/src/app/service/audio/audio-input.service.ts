import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioInputService {
  async create() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return { stream: stream, dispose: () => {} };
  }
}
