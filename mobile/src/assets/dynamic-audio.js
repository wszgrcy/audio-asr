class DynamicAudioProcessor extends AudioWorkletProcessor {
  running = true;
  constructor() {
    super();
    this.buffer = new Float32Array(0);
    this.port.onmessage = (event) => {
      if (event.data.type === 'appendData') {
        const newData = new Float32Array(event.data.data);
        const newBuffer = new Float32Array(this.buffer.length + newData.length);
        newBuffer.set(this.buffer);
        newBuffer.set(newData, this.buffer.length);
        this.buffer = newBuffer;
      } else if (event.data.type === 'SPEECH_STOP') {
        this.running = false;
      }
    };
  }

  // 每次处理音频块（默认 128 帧）
  process(inputs, outputs, parameters) {
    if (!this.running) {
      return false;
    }
    const output = outputs[0];
    const frameCount = output[0].length;

    if (this.buffer.length >= frameCount) {
      output[0].set(this.buffer.slice(0, frameCount));
      this.buffer = this.buffer.slice(frameCount);
    } else {
      output[0].fill(0);
    }

    return true;
  }
}

registerProcessor('dynamic-audio-processor', DynamicAudioProcessor);
