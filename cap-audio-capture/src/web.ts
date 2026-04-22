import { ListenerCallback, PluginListenerHandle, WebPlugin } from '@capacitor/core';

import type { AudioCapturePlugin } from './definitions';

export class AudioCaptureWeb extends WebPlugin implements AudioCapturePlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async start(options?: {}): Promise<void> {
    console.log('START', options);
  }

  async stop(options?: {}): Promise<void> {
    console.log('STOP', options);
  }
  async addListener(_eventName: string, _listenerFunc: ListenerCallback): Promise<PluginListenerHandle> {
    return { remove: async () => undefined } as PluginListenerHandle
  }
}
