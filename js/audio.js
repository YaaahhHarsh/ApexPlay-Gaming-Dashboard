

class SoundFx {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('apexplay_audio_muted') === 'true';
  }

  init() {
    if (!this.ctx && typeof window.AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('apexplay_audio_muted', this.muted);
    return this.muted;
  }

  playBlip(freq = 440, type = 'sine', duration = 0.05, gainVal = 0.04) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      
    }
  }

  hover() {
    this.playBlip(587.33, 'sine', 0.04, 0.02); 
  }

  click() {
    this.playBlip(880, 'triangle', 0.06, 0.04); 
  }

  tab() {
    this.playBlip(659.25, 'sine', 0.08, 0.03); 
  }

  launch() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }

  achievement() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; 
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBlip(freq, 'sine', 0.18, 0.05);
        }, idx * 70);
      });
    } catch (e) {}
  }

  levelUp() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBlip(freq, 'triangle', 0.25, 0.06);
        }, idx * 90);
      });
    } catch (e) {}
  }
}

window.soundFx = new SoundFx();
