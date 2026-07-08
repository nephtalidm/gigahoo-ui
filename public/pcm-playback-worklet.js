// Playback worklet: the context runs at 24 kHz (the agent's audio rate). The main thread posts
// Int16 ArrayBuffers (agent audio); we queue them and stream out smoothly, emitting silence when
// the buffer is empty (jitter buffer). Posting the string "clear" flushes it (barge-in).
class PcmPlaybackProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = [];
    this.offset = 0;
    this.port.onmessage = (e) => {
      if (e.data === "clear") { this.queue = []; this.offset = 0; return; }
      const i16 = new Int16Array(e.data);
      const f32 = new Float32Array(i16.length);
      for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
      this.queue.push(f32);
    };
  }
  process(_inputs, outputs) {
    const out = outputs[0] && outputs[0][0];
    if (!out) return true;
    for (let i = 0; i < out.length; i++) {
      const chunk = this.queue[0];
      if (!chunk) { out[i] = 0; continue; }
      out[i] = chunk[this.offset++];
      if (this.offset >= chunk.length) { this.queue.shift(); this.offset = 0; }
    }
    return true;
  }
}
registerProcessor("pcm-playback", PcmPlaybackProcessor);
