// Mic capture worklet: the context runs at 16 kHz, so each frame is already the rate the voice
// agent wants. Convert mono Float32 -> PCM16 and post it to the main thread (which sends it on the
// WebSocket). Emits no audio (silent output), so wiring it to a zero-gain sink just keeps it pulled.
class PcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch && ch.length) {
      const pcm = new Int16Array(ch.length);
      for (let i = 0; i < ch.length; i++) {
        const s = Math.max(-1, Math.min(1, ch[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(pcm.buffer, [pcm.buffer]);
    }
    return true;
  }
}
registerProcessor("pcm-capture", PcmCaptureProcessor);
