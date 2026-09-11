/**
 * Paisaje sonoro procedural (Web Audio API).
 * Sin archivos externos: ruido filtrado = río/brisa, osciladores = resonancia urbana.
 * Solo se activa tras gesto explícito del usuario.
 */

type SceneId = "prologo" | "rio" | "ferrocarril" | "jardin" | "ciudad" | "radio" | "silencio" | "coro";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = false;
  private volume = 0.6;
  private nodes: {
    riverGain?: GainNode;
    windGain?: GainNode;
    droneGain?: GainNode;
    pulseGain?: GainNode;
    windFilter?: BiquadFilterNode;
    droneOsc?: OscillatorNode;
    pulseOsc?: OscillatorNode;
  } = {};

  private ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // --- río: ruido rosa aproximado → lowpass
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const riverFilter = ctx.createBiquadFilter();
    riverFilter.type = "lowpass";
    riverFilter.frequency.value = 380;
    const riverGain = ctx.createGain();
    riverGain.gain.value = 0.5;
    noise.connect(riverFilter).connect(riverGain).connect(master);
    noise.start();

    // --- brisa: banda de ruido con LFO
    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuf;
    wind.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 900;
    windFilter.Q.value = 1.4;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.08;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain).connect(windFilter.frequency);
    lfo.start();
    wind.connect(windFilter).connect(windGain).connect(master);
    wind.start();

    // --- resonancia grave (espacio interior / ciudad lejana)
    const droneOsc = ctx.createOscillator();
    droneOsc.type = "sine";
    droneOsc.frequency.value = 55;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.03;
    droneOsc.connect(droneGain).connect(master);
    droneOsc.start();

    // --- pulso lejano (ferrocarril / radio / tránsito)
    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = "triangle";
    pulseOsc.frequency.value = 110;
    const pulseFilter = ctx.createBiquadFilter();
    pulseFilter.type = "lowpass";
    pulseFilter.frequency.value = 260;
    const pulseGain = ctx.createGain();
    pulseGain.gain.value = 0;
    const pulseLfo = ctx.createOscillator();
    pulseLfo.frequency.value = 1.6;
    const pulseLfoDepth = ctx.createGain();
    pulseLfoDepth.gain.value = 0.02;
    pulseLfo.connect(pulseLfoDepth).connect(pulseGain.gain);
    pulseLfo.start();
    pulseOsc.connect(pulseFilter).connect(pulseGain).connect(master);
    pulseOsc.start();

    this.ctx = ctx;
    this.master = master;
    this.nodes = { riverGain, windGain, windFilter, droneGain, droneOsc, pulseGain, pulseOsc };
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) {
      this.ensure();
      if (!this.ctx || !this.master) return;
      if (this.ctx.state === "suspended") void this.ctx.resume();
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 1.2);
    } else if (this.ctx && this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);
    }
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.enabled && this.ctx && this.master) {
      this.master.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.3);
    }
  }

  /** Cruza la mezcla según la escena narrativa activa. */
  setScene(scene: SceneId) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const g = (node: GainNode | undefined, v: number) => {
      if (!node) return;
      node.gain.cancelScheduledValues(t);
      node.gain.linearRampToValueAtTime(v, t + 2.5);
    };
    const f = (node: BiquadFilterNode | undefined, v: number) => {
      if (!node) return;
      node.frequency.cancelScheduledValues(t);
      node.frequency.linearRampToValueAtTime(v, t + 2.5);
    };
    const { riverGain, windGain, windFilter, droneGain, pulseGain } = this.nodes;
    switch (scene) {
      case "rio":
        g(riverGain, 0.62); g(windGain, 0.1); g(droneGain, 0.02); g(pulseGain, 0);
        f(windFilter, 750);
        break;
      case "ferrocarril":
        g(riverGain, 0.28); g(windGain, 0.08); g(droneGain, 0.035); g(pulseGain, 0.05);
        f(windFilter, 500);
        break;
      case "jardin":
        g(riverGain, 0.16); g(windGain, 0.2); g(droneGain, 0.015); g(pulseGain, 0);
        f(windFilter, 1500);
        break;
      case "ciudad":
        g(riverGain, 0.12); g(windGain, 0.09); g(droneGain, 0.05); g(pulseGain, 0.03);
        f(windFilter, 420);
        break;
      case "radio":
        g(riverGain, 0.08); g(windGain, 0.07); g(droneGain, 0.06); g(pulseGain, 0.045);
        f(windFilter, 900);
        break;
      case "silencio":
        g(riverGain, 0.05); g(windGain, 0.14); g(droneGain, 0.012); g(pulseGain, 0);
        f(windFilter, 300);
        break;
      case "coro":
        g(riverGain, 0.22); g(windGain, 0.12); g(droneGain, 0.045); g(pulseGain, 0.02);
        f(windFilter, 800);
        break;
      default:
        g(riverGain, 0.4); g(windGain, 0.1); g(droneGain, 0.02); g(pulseGain, 0);
        f(windFilter, 800);
    }
  }
}

export const audio = new AudioEngine();
