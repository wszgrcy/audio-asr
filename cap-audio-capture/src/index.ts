import { registerPlugin } from '@capacitor/core';

import type { AudioCapturePlugin } from './definitions';

const AudioCapture = registerPlugin<AudioCapturePlugin>('AudioCapture', {
  web: () => import('./web').then((m) => new m.AudioCaptureWeb()),
});

export * from './definitions';
export { AudioCapture };
