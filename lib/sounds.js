// Dramatic sound effects using Web Audio API
class SoundEffects {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  }

  playMove() {
    if (!this.enabled) return;
    const ctx = this.init();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.2);
    osc.stop(now + 0.2);
  }

  playCapture() {
    if (!this.enabled) return;
    const ctx = this.init();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.value = 220;
    gain.gain.value = 0.15;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.3);
    osc.stop(now + 0.3);
  }

  playGameOver() {
    if (!this.enabled) return;
    const ctx = this.init();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 220;
    gain.gain.value = 0.15;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 1.5);
    osc.frequency.exponentialRampToValueAtTime(110, now + 1.5);
    osc.stop(now + 1.5);
  }

  playWin() {
    if (!this.enabled) return;
    const ctx = this.init();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
    osc.stop(now + 0.8);
  }

  playNumber() {
    if (!this.enabled) return;
    const ctx = this.init();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.value = 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.1);
    osc.stop(now + 0.1);
  }

  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
}

export const sounds = new SoundEffects();