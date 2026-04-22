import { Plugin } from '@capacitor/core';

export interface AudioCapturePlugin extends Plugin{
  echo(options: { value: string }): Promise<{ value: string }>;

  start(options?: {}): Promise<void>;
  stop(options?: {}): Promise<void>;
}

export interface AudioDataEvent {
  data: number[];
}