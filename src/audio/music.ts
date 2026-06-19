/**
 * GameAudio — procedural music & SFX system for "Holders vs Jeets".
 *
 * No external audio files. Everything is synthesized with the Web Audio API
 * using oscillators, gain envelopes, and a scheduler pattern.
 *
 * Lifetime / API:
 *   const audio = gameAudio;
 *   audio.startMusic('battle');   // looping background track
 *   audio.stopMusic();
 *   audio.playSfx('shoot');        // one-shot
 *   audio.setVolume(0.6);          // 0..1 master
 *   audio.toggleMute();
 *   if (audio.isMuted) { ... }
 *   audio.stopAll();               // stop music + sfx
 *
 * The AudioContext is created lazily on first use so the browser's autoplay
 * policy is satisfied (audio must start from a user gesture).
 */

export type MusicTrack = 'menu' | 'battle' | 'boss' | 'victory' | 'gameover';

export type SfxType =
  | 'shoot'
  | 'hit'
  | 'explosion'
  | 'collect'
  | 'place'
  | 'jeet_death'
  | 'wave_start'
  | 'button';

// ---------- Note helpers ----------

/** 12-TET note name -> frequency. A4 (440Hz) is the reference. */
const NOTE_FREQ: Record<string, number> = {};
(() => {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // Midi note number for A4 = 69
  for (let midi = 12; midi <= 120; midi++) {
    const octave = Math.floor(midi / 12) - 1;
    const name = names[midi % 12] + octave;
    NOTE_FREQ[name] = 440 * Math.pow(2, (midi - 69) / 12);
  }
})();

function note(name: string): number {
  const f = NOTE_FREQ[name];
  if (f === undefined) throw new Error(`Unknown note: ${name}`);
  return f;
}

// ---------- Track definitions ----------
//
// Each track is described as a sequence of "steps". A step may rest (null),
// play a single note, or play a chord (array of note names). Each step has a
// duration in beats and a velocity (0..1). The scheduler walks the pattern
// repeatedly until the track is stopped.

interface TrackStep {
  /** note names; null = rest, single string = mono note, array = chord */
  notes: string[] | null;
  /** beats duration of this step (1 = quarter note) */
  dur: number;
  /** 0..1 velocity */
  vel: number;
}

interface TrackConfig {
  /** beats per minute */
  bpm: number;
  /** oscillator waveform for the lead voice */
  leadWave: OscillatorType;
  /** oscillator waveform for the bass voice */
  bassWave: OscillatorType;
  /** ratio of bass note to root lead note (e.g. play bass two octaves below) */
  bassOctave: number;
  /** steps of the pattern; loops indefinitely */
  steps: TrackStep[];
  /** peak gain of the music bus for this track (0..1) */
  gain: number;
  /** if true, a soft noise/percussion layer is added on each beat */
  perc: boolean;
  /** sustain time of each note in seconds (envelope) */
  sustain: number;
}

// Pre-built patterns ----------------------------------------------------------

const MENU_TRACK: TrackConfig = {
  bpm: 72,
  leadWave: 'triangle',
  bassWave: 'sine',
  bassOctave: 0.25, // two octaves down
  gain: 0.18,
  perc: false,
  sustain: 1.4,
  steps: [
    // Calm Am9 arpeggio drifting up & down — a chill crypto lobby.
    { notes: ['A3', 'C4', 'E4', 'G4'], dur: 1, vel: 0.6 },
    { notes: ['A3', 'C4', 'E4', 'A4'], dur: 1, vel: 0.55 },
    { notes: ['B3', 'D4', 'F4', 'A4'], dur: 1, vel: 0.6 }, // G/B iv
    { notes: ['E3', 'G3', 'B3', 'D4'], dur: 1, vel: 0.55 }, // Em
    { notes: ['F3', 'A3', 'C4', 'E4'], dur: 1, vel: 0.6 }, // F
    { notes: ['C3', 'E3', 'G3', 'C4'], dur: 1, vel: 0.55 }, // C
    { notes: ['D3', 'F3', 'A3', 'C4'], dur: 1, vel: 0.6 }, // Dm
    { notes: ['A2', 'E3', 'A3', 'C4'], dur: 1, vel: 0.5 }, // Am resolve
  ],
};

const BATTLE_TRACK: TrackConfig = {
  bpm: 132,
  leadWave: 'square',
  bassWave: 'sawtooth',
  bassOctave: 0.25,
  gain: 0.16,
  perc: true,
  sustain: 0.18,
  steps: [
    // Driving i - VI - VII - VII in A minor with a galloping rhythm.
    { notes: ['A3'], dur: 0.5, vel: 0.7 },
    { notes: ['A4'], dur: 0.5, vel: 0.55 },
    { notes: ['E4'], dur: 0.5, vel: 0.65 },
    { notes: ['A4'], dur: 0.5, vel: 0.7 },
    { notes: ['F4'], dur: 0.5, vel: 0.65 }, // F
    { notes: ['A4'], dur: 0.5, vel: 0.55 },
    { notes: ['C5'], dur: 0.5, vel: 0.6 },
    { notes: ['A4'], dur: 0.5, vel: 0.55 },
    { notes: ['G4'], dur: 0.5, vel: 0.65 }, // G
    { notes: ['B4'], dur: 0.5, vel: 0.55 },
    { notes: ['D5'], dur: 0.5, vel: 0.6 },
    { notes: ['B4'], dur: 0.5, vel: 0.55 },
    { notes: ['G4'], dur: 0.5, vel: 0.65 }, // G again
    { notes: ['B4'], dur: 0.5, vel: 0.55 },
    { notes: ['E4'], dur: 0.5, vel: 0.6 },
    { notes: ['A4'], dur: 0.5, vel: 0.7 },
  ],
};

const BOSS_TRACK: TrackConfig = {
  bpm: 96,
  leadWave: 'sawtooth',
  bassWave: 'square',
  bassOctave: 0.25,
  gain: 0.2,
  perc: true,
  sustain: 0.35,
  steps: [
    // Low, dissonant tritone-laden riff in C / D# (ominous).
    { notes: ['C3', 'C4'], dur: 0.75, vel: 0.8 },
    { notes: ['D#3', 'D#4'], dur: 0.75, vel: 0.75 }, // tritone
    { notes: ['C3', 'C4'], dur: 0.75, vel: 0.8 },
    { notes: ['G2', 'G3'], dur: 0.75, vel: 0.7 },
    { notes: ['C3', 'C4'], dur: 0.75, vel: 0.8 },
    { notes: ['D#3', 'D#4'], dur: 0.75, vel: 0.75 },
    { notes: ['F#3', 'F#4'], dur: 0.75, vel: 0.85 }, // another tritone
    { notes: ['G2', 'G3'], dur: 0.75, vel: 0.7 },
  ],
};

const VICTORY_TRACK: TrackConfig = {
  bpm: 110,
  leadWave: 'triangle',
  bassWave: 'sine',
  bassOctave: 0.5,
  gain: 0.2,
  perc: true,
  sustain: 0.4,
  steps: [
    // C major ascending fanfare: I - IV - V - I with rising melody.
    { notes: ['C4', 'E4'], dur: 0.5, vel: 0.7 },
    { notes: ['G4'], dur: 0.5, vel: 0.7 },
    { notes: ['C5'], dur: 1, vel: 0.85 },
    { notes: ['F4', 'A4'], dur: 0.5, vel: 0.7 }, // IV
    { notes: ['C5'], dur: 0.5, vel: 0.75 },
    { notes: ['F5'], dur: 1, vel: 0.9 },
    { notes: ['G4', 'B4'], dur: 0.5, vel: 0.7 }, // V
    { notes: ['D5'], dur: 0.5, vel: 0.75 },
    { notes: ['G5'], dur: 1, vel: 0.9 },
    { notes: ['C5', 'E5'], dur: 0.5, vel: 0.8 }, // I
    { notes: ['G5'], dur: 0.5, vel: 0.85 },
    { notes: ['C6'], dur: 1.5, vel: 1.0 },
  ],
};

const GAMEOVER_TRACK: TrackConfig = {
  bpm: 60,
  leadWave: 'sine',
  bassWave: 'triangle',
  bassOctave: 0.5,
  gain: 0.18,
  perc: false,
  sustain: 1.6,
  steps: [
    // Descending A minor: A -> F -> D -> A (lower octave) — a somber cadence.
    { notes: ['A4', 'C5', 'E5'], dur: 1.5, vel: 0.7 },
    { notes: ['F4', 'A4', 'C5'], dur: 1.5, vel: 0.65 },
    { notes: ['D4', 'F4', 'A4'], dur: 1.5, vel: 0.6 },
    { notes: ['A3', 'C4', 'E4'], dur: 1.5, vel: 0.55 },
    { notes: ['A2', 'E3', 'A3'], dur: 2, vel: 0.5 },
  ],
};

const TRACKS: Record<MusicTrack, TrackConfig> = {
  menu: MENU_TRACK,
  battle: BATTLE_TRACK,
  boss: BOSS_TRACK,
  victory: VICTORY_TRACK,
  gameover: GAMEOVER_TRACK,
};

// ---------- GameAudio ----------

export class GameAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private volume = 0.7;
  private muted = false;

  // Current music state
  private currentTrack: MusicTrack | null = null;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private stepIndex = 0;
  private activeMusicVoices: { osc: OscillatorNode; gain: GainNode }[] = [];

  // For the percussion noise layer
  private noiseBuffer: AudioBuffer | null = null;

  // ------------------------------------------------------------------ context

  /**
   * Lazily create the AudioContext. Must be called from a user gesture
   * (e.g. a click that starts the game / music) to satisfy autoplay rules.
   */
  private ensureContext(): AudioContext {
    if (this.ctx) {
      // Some browsers suspend the context after inactivity; resume on demand.
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    const Ctor: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(ctx.destination);

    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 1;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = 0.9;
    this.sfxGain.connect(this.masterGain);

    // Pre-render a short white-noise buffer for explosions/percussion.
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;

    return ctx;
  }

  // --------------------------------------------------------------------- music

  startMusic(track: MusicTrack): void {
    const ctx = this.ensureContext();
    if (this.currentTrack === track) return;
    this.stopMusicInternal();

    const cfg = TRACKS[track];
    this.currentTrack = track;
    if (this.musicGain) this.musicGain.gain.value = cfg.gain;

    this.stepIndex = 0;
    this.nextNoteTime = ctx.currentTime + 0.1;

    // 25ms lookahead scheduler — standard Web Audio pattern.
    const lookahead = 0.025;
    this.schedulerTimer = setInterval(() => this.scheduler(), lookahead * 1000);
  }

  stopMusic(): void {
    this.stopMusicInternal();
  }

  private stopMusicInternal(): void {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    const now = this.ctx ? this.ctx.currentTime : 0;
    for (const v of this.activeMusicVoices) {
      try {
        v.gain.gain.cancelScheduledValues(now);
        v.gain.gain.setValueAtTime(v.gain.gain.value, now);
        v.gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
        v.osc.stop(now + 0.18);
      } catch {
        /* already stopped */
      }
    }
    this.activeMusicVoices = [];
    this.currentTrack = null;
  }

  /**
   * Look-ahead scheduler: schedules any notes whose start time falls within
   * the next ~0.2s window, advancing the step cursor through the pattern.
   */
  private scheduler(): void {
    if (!this.ctx || !this.currentTrack) return;
    const cfg = TRACKS[this.currentTrack];
    const ctx = this.ctx;
    const secondsPerBeat = 60 / cfg.bpm;
    const scheduleAhead = 0.2;

    while (this.nextNoteTime < ctx.currentTime + scheduleAhead) {
      const step = cfg.steps[this.stepIndex % cfg.steps.length];
      this.scheduleStep(cfg, step, this.nextNoteTime);
      this.nextNoteTime += step.dur * secondsPerBeat;
      this.stepIndex++;
    }
  }

  private scheduleStep(cfg: TrackConfig, step: TrackStep, time: number): void {
    if (!this.ctx || !this.musicGain) return;
    const ctx = this.ctx;
    const out = this.musicGain;

    if (step.notes && step.notes.length > 0) {
      // Lead voice plays the top note (or all notes as a chord).
      for (const name of step.notes) {
        const freq = note(name);
        this.voice({
          ctx,
          out,
          freq,
          wave: cfg.leadWave,
          gain: step.vel * 0.5,
          attack: 0.01,
          sustain: cfg.sustain,
          release: 0.18,
          time,
        });
      }
      // Bass voice plays the lowest note an octave (or two) down.
      const lowest = step.notes.reduce((acc, name) => {
        const f = note(name);
        return f < acc ? f : acc;
      }, Infinity);
      if (Number.isFinite(lowest)) {
        this.voice({
          ctx,
          out,
          freq: lowest * cfg.bassOctave,
          wave: cfg.bassWave,
          gain: step.vel * 0.55,
          attack: 0.005,
          sustain: cfg.sustain * 0.9,
          release: 0.12,
          time,
        });
      }
    }

    // Simple percussion on the downbeat for percussive tracks.
    if (cfg.perc && (this.stepIndex % 2 === 0)) {
      this.kick(ctx, out, time, step.vel * 0.6);
    }
  }

  /** Play a single enveloped oscillator voice. */
  private voice(args: {
    ctx: AudioContext;
    out: AudioNode;
    freq: number;
    wave: OscillatorType;
    gain: number;
    attack: number;
    sustain: number;
    release: number;
    time: number;
  }): void {
    const { ctx, out, freq, wave, gain, attack, sustain, release, time } = args;
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.value = freq;

    const g = ctx.createGain();
    const peak = Math.max(0.0001, gain);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(peak, time + attack);
    g.gain.setValueAtTime(peak, time + attack + sustain);
    g.gain.linearRampToValueAtTime(0.0001, time + attack + sustain + release);

    osc.connect(g);
    g.connect(out);
    osc.start(time);
    osc.stop(time + attack + sustain + release + 0.05);

    // Track so we can stop abruptly if the track changes.
    const rec = { osc, gain: g };
    this.activeMusicVoices.push(rec);
    osc.onended = () => {
      const i = this.activeMusicVoices.indexOf(rec);
      if (i >= 0) this.activeMusicVoices.splice(i, 1);
    };
  }

  /** Short kick-drum-ish thump using a pitch-swept sine + noise click. */
  private kick(
    ctx: AudioContext,
    out: AudioNode,
    time: number,
    vel: number,
  ): void {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    const g = ctx.createGain();
    const peak = Math.max(0.0001, vel);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(peak, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  // ---------------------------------------------------------------------- sfx

  playSfx(type: SfxType): void {
    const ctx = this.ensureContext();
    if (!this.sfxGain) return;
    const t = ctx.currentTime + 0.01;
    switch (type) {
      case 'shoot':
        this.burstSweep(ctx, this.sfxGain, 'sine', 800, 200, 0.1, 0.4);
        break;
      case 'hit':
        this.burstSweep(ctx, this.sfxGain, 'square', 150, 140, 0.05, 0.5);
        break;
      case 'explosion':
        this.explosion(ctx, this.sfxGain, t, 0.5);
        break;
      case 'collect':
        this.burstSweep(ctx, this.sfxGain, 'sine', 600, 600, 0.06, 0.35, t);
        this.burstSweep(ctx, this.sfxGain, 'sine', 900, 900, 0.08, 0.3, t + 0.06);
        break;
      case 'place':
        this.burstSweep(ctx, this.sfxGain, 'triangle', 200, 180, 0.1, 0.5);
        break;
      case 'jeet_death':
        this.burstSweep(ctx, this.sfxGain, 'sawtooth', 400, 100, 0.2, 0.4);
        break;
      case 'wave_start':
        this.burstSweep(ctx, this.sfxGain, 'square', 440, 440, 0.1, 0.4, t);
        this.burstSweep(ctx, this.sfxGain, 'square', 660, 660, 0.12, 0.4, t + 0.12);
        break;
      case 'button':
        this.burstSweep(ctx, this.sfxGain, 'sine', 1000, 1000, 0.03, 0.3);
        break;
    }
  }

  /** Quick enveloped oscillator burst, optional frequency sweep. */
  private burstSweep(
    ctx: AudioContext,
    out: AudioNode,
    wave: OscillatorType,
    fromFreq: number,
    toFreq: number,
    dur: number,
    gain: number,
    startTime?: number,
  ): void {
    const t = startTime ?? ctx.currentTime + 0.005;
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(fromFreq, t);
    if (toFreq !== fromFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, toFreq),
        t + dur,
      );
    }
    const g = ctx.createGain();
    const peak = Math.max(0.0001, gain);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Explosion: filtered noise burst + low sine sweep down. */
  private explosion(
    ctx: AudioContext,
    out: AudioNode,
    t: number,
    gain: number,
  ): void {
    if (!this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'lowpass';
    bp.frequency.setValueAtTime(1800, t);
    bp.frequency.exponentialRampToValueAtTime(120, t + 0.4);
    const g = ctx.createGain();
    const peak = Math.max(0.0001, gain);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    src.connect(bp);
    bp.connect(g);
    g.connect(out);
    src.start(t);
    src.stop(t + 0.5);

    // Low sine thump underneath.
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.linearRampToValueAtTime(peak * 0.7, t + 0.005);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.connect(og);
    og.connect(out);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // -------------------------------------------------------------------- volume

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      const target = this.muted ? 0 : this.volume;
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(target, now + 0.05);
    }
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      const target = this.muted ? 0 : this.volume;
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(target, now + 0.05);
    }
  }

  get isMuted(): boolean {
    return this.muted;
  }

  stopAll(): void {
    this.stopMusicInternal();
    // SFX are short-lived and self-terminate; no persistent SFX to kill.
  }
}

// Export a singleton instance for easy import across the app.
export const gameAudio = new GameAudio();
