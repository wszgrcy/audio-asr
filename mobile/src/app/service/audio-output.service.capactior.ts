import { AudioCapture } from 'cap-audio-capture';
import { Injectable } from '@angular/core';
function convertAudioDataToInt16AndFloat32(data: number[]): Float32Array {
  const uint8 = new Uint8Array(data);
  const numSamples = uint8.length / 2;
  const int16Data = new Int16Array(numSamples);
  const view = new DataView(uint8.buffer, uint8.byteOffset, uint8.byteLength);
  for (let i = 0; i < numSamples; i++) {
    int16Data[i] = view.getInt16(i * 2, true);
  }
  const float32Data = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    float32Data[i] = int16Data[i] / 32768.0;
  }

  return float32Data;
}
@Injectable({
  providedIn: 'root',
})
export class AudioOutputCapactiorService {
  async create() {
    let disposeable = await AudioCapture.addListener('audioData', (data) => {
      let bf = convertAudioDataToInt16AndFloat32(data.data);
      workletNode.port.postMessage(
        {
          type: 'appendData',
          data: bf.buffer,
        },
        [bf.buffer],
      );
    });

    const audioCtx = new AudioContext({ sampleRate: 16000 });
    await AudioCapture.start();
    await audioCtx.audioWorklet.addModule('./assets/dynamic-audio.js');
    const workletNode = new AudioWorkletNode(
      audioCtx,
      'dynamic-audio-processor',
      {
        channelCount: 1,
        channelCountMode: 'explicit',
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1],
      },
    );

    const dest = audioCtx.createMediaStreamDestination();
    workletNode.connect(dest);

    return {
      stream: dest.stream,
      dispose: () => {
        disposeable.remove();
        AudioCapture.stop();
        workletNode.port.postMessage({
          type: 'SPEECH_STOP',
        });
      },
    };
  }
}
