export class AudioManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private getCtx(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.ctx && this.ctx.state !== 'closed') {
      this.ctx.suspend();
    } else if (enabled && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private tone(freq: number, durationMs: number, type: OscillatorType, vol: number, slideTo?: number) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(slideTo, t + durationMs / 1000);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + durationMs / 1000);
  }

  private noise(durationMs: number, vol: number) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * (durationMs / 1000));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    src.connect(gain).connect(ctx.destination);
    src.start(ctx.currentTime);
  }

  shoot() {
    this.tone(880, 90, 'square', 0.05, 1200);
  }

  hit() {
    this.tone(220, 110, 'sawtooth', 0.08, 80);
  }

  collect() {
    this.tone(1320, 140, 'sine', 0.08, 1800);
  }

  explode() {
    this.noise(180, 0.12);
    this.tone(100, 200, 'sawtooth', 0.12, 40);
  }

  place() {
    this.tone(660, 120, 'square', 0.06, 990);
  }

  gameover() {
    this.tone(220, 350, 'sawtooth', 0.13, 55);
    this.tone(110, 500, 'sine', 0.13, 30);
  }

  victory() {
    this.tone(523, 200, 'square', 0.1, 1046);
    setTimeout(() => this.tone(659, 200, 'square', 0.1, 1318), 100);
    setTimeout(() => this.tone(784, 300, 'square', 0.1, 1568), 250);
  }

  waveStart() {
    this.tone(330, 150, 'square', 0.08, 660);
  }
}
