// AEC I/O worklet: runs in a single 16 kHz context so the mic and the played-back loopback share ONE
// clock (what DTLN-AEC needs). It takes the RAW mic as input, plays Sarah's (Vincent) audio as output,
// and posts BOTH per render quantum as {mic, lpb} PCM16 — sample-aligned — so the server can subtract
// Sarah's voice out of the mic. Post the string "clear" to flush the playback queue (barge-in).
class AecIoProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = [];
    this.offset = 0;
    this.port.onmessage = (e) => {
      if (e.data === "clear") { this.queue = []; this.offset = 0; return; }
      // Float32 samples already resampled to 16 kHz on the main thread.
      this.queue.push(new Float32Array(e.data));
    };
  }
  process(inputs, outputs) {
    const mic = inputs[0] && inputs[0][0];
    const out = outputs[0] && outputs[0][0];
    const n = (out && out.length) || (mic && mic.length) || 128;
    const micPcm = new Int16Array(n);
    const lpbPcm = new Int16Array(n);
    for (let i = 0; i < n; i++) {
      // raw mic -> PCM16
      let m = mic ? mic[i] || 0 : 0;
      if (m > 1) m = 1; else if (m < -1) m = -1;
      micPcm[i] = m < 0 ? m * 0x8000 : m * 0x7fff;
      // loopback (what we play this quantum) -> speakers AND PCM16 reference
      let v = 0;
      const chunk = this.queue[0];
      if (chunk) {
        v = chunk[this.offset++];
        if (this.offset >= chunk.length) { this.queue.shift(); this.offset = 0; }
      }
      if (out) out[i] = v;
      if (v > 1) v = 1; else if (v < -1) v = -1;
      lpbPcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
    }
    this.port.postMessage({ mic: micPcm.buffer, lpb: lpbPcm.buffer }, [micPcm.buffer, lpbPcm.buffer]);
    return true;
  }
}
registerProcessor("aec-io", AecIoProcessor);
