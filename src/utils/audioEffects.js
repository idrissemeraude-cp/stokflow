// Moteur Audio Synthétique Web Audio API pour Caisse POS
// 100% natif, zéro fichier externe, fonctionne hors-ligne, zéro latence

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('stockflow_audio_enabled') !== 'false';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  toggleAudio() {
    this.enabled = !this.enabled;
    localStorage.setItem('stockflow_audio_enabled', this.enabled ? 'true' : 'false');
    if (this.enabled) {
      this.playClickBeep();
    }
    return this.enabled;
  }

  // 1. Bip de Scan Laser Code-barres (Net et ultra-satisfaisant)
  playBarcodeBeep() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, this.ctx.currentTime); // Note A6
      osc.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Ignorer si audio bloqué par le navigateur
    }
  }

  // 2. Carillon d'Encaissement Réussi (Cha-ching / Caisse enregistreuse)
  playCashChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      const notes = [
        { freq: 523.25, delay: 0, dur: 0.15 },    // C5
        { freq: 659.25, delay: 0.08, dur: 0.18 }, // E5
        { freq: 783.99, delay: 0.16, dur: 0.20 }, // G5
        { freq: 1046.50, delay: 0.24, dur: 0.40 } // C6
      ];

      notes.forEach(({ freq, delay, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.22, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });
    } catch {
      // Audio error safe
    }
  }

  // 3. Avertissement / Stock Bas / Erreur
  playWarningBeep() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Audio error safe
    }
  }

  // 4. Micro-clic tactile pour boutons POS
  playClickBeep() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // Audio error safe
    }
  }
}

export const audioFX = new SoundEngine();
