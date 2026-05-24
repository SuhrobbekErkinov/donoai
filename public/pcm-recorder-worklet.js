// Captures mono mic audio and emits 16-bit PCM chunks to the main thread.
// The AudioContext is created at 16 kHz, so frames here are already 16 kHz —
// exactly what the Gemini Live API expects (audio/pcm;rate=16000).
class PCMRecorder extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._target = 2048; // ~128 ms at 16 kHz — balances latency vs. WS overhead
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      for (let i = 0; i < channel.length; i++) this._buffer.push(channel[i]);
      if (this._buffer.length >= this._target) {
        const frames = this._buffer.splice(0, this._buffer.length);
        const pcm = new Int16Array(frames.length);
        for (let i = 0; i < frames.length; i++) {
          const s = Math.max(-1, Math.min(1, frames[i]));
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        this.port.postMessage(pcm.buffer, [pcm.buffer]);
      }
    }
    return true;
  }
}

registerProcessor("pcm-recorder", PCMRecorder);
