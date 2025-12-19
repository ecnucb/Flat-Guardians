const ATTACK_MS = 12;

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.themeNodes = [];
    this.pendingTheme = "default";
  }

  ensureContext() {
    if (this.ctx) return;
    const AudioContextImpl = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextImpl();
  }

  ensureMusicBus() {
    if (!this.ctx || this.musicGain) return;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.16;
    this.musicGain.connect(this.ctx.destination);
  }

  async unlock() {
    this.ensureContext();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
    this.ensureMusicBus();
    this.playTheme(this.pendingTheme);
  }

  playTheme(theme = "default") {
    this.pendingTheme = theme;
    this.ensureContext();
    if (!this.ctx || this.ctx.state !== "running") return;
    this.ensureMusicBus();
    this.stopThemeNodes();
    const recipe = THEME_GENERATORS[theme] || THEME_GENERATORS.default;
    this.themeNodes = recipe(this.ctx, this.musicGain);
  }

  stopThemeNodes() {
    if (!this.themeNodes?.length) return;
    const stopTime = (this.ctx?.currentTime ?? 0) + 0.05;
    this.themeNodes.forEach((node) => {
      try {
        node.stop(stopTime);
      } catch (err) {
        // already stopped
      }
      try {
        node.disconnect();
      } catch (err) {
        // ignore
      }
    });
    this.themeNodes = [];
  }

  playSfx(kind = "pulse") {
    if (!this.ctx) return;
    const duration = kind === "dash" ? 0.18 : kind === "hit" ? 0.32 : 0.22;
    const freqStart = kind === "dash" ? 660 : kind === "hit" ? 180 : 420;
    const freqEnd = kind === "dash" ? 440 : kind === "hit" ? 90 : 360;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = kind === "hit" ? "square" : "sawtooth";
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
    const attackEnd = this.ctx.currentTime + ATTACK_MS / 1000;
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, attackEnd);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration + 0.05);
  }
}

const THEME_GENERATORS = {
  default: (ctx, bus) => createStack(ctx, bus, [
    { type: "triangle", frequency: 220, gain: 0.07 },
    { type: "triangle", frequency: 330, gain: 0.05 }
  ]),
  neon: (ctx, bus) => createStack(ctx, bus, [
    { type: "sawtooth", frequency: 440, gain: 0.05 },
    { type: "sawtooth", frequency: 880, gain: 0.03 },
    { type: "triangle", frequency: 660, gain: 0.04 }
  ]),
  underwater: (ctx, bus) => createStack(ctx, bus, [
    { type: "sine", frequency: 110, gain: 0.08 },
    { type: "sine", frequency: 220, gain: 0.05, detune: 12 },
    { type: "triangle", frequency: 330, gain: 0.03 }
  ]),
  network: (ctx, bus) => createStack(ctx, bus, [
    { type: "square", frequency: 260, gain: 0.05 },
    { type: "square", frequency: 520, gain: 0.04 },
    { type: "sawtooth", frequency: 155, gain: 0.03 }
  ]),
  natural: (ctx, bus) => createStack(ctx, bus, [
    { type: "sine", frequency: 196, gain: 0.06 },
    { type: "triangle", frequency: 294, gain: 0.05 },
    { type: "sine", frequency: 392, gain: 0.04 }
  ]),
  space: (ctx, bus) => createStack(ctx, bus, [
    { type: "triangle", frequency: 180, gain: 0.05 },
    { type: "sawtooth", frequency: 360, gain: 0.04, detune: 8 },
    { type: "triangle", frequency: 720, gain: 0.025 }
  ])
};

function createStack(ctx, bus, layers) {
  return layers.map((layer) => spawnTone(ctx, bus, layer));
}

function spawnTone(ctx, bus, layer) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = layer.type || "sine";
  osc.frequency.value = layer.frequency || 220;
  osc.detune.value = layer.detune || 0;
  gainNode.gain.value = layer.gain ?? 0.04;
  osc.connect(gainNode).connect(bus);
  osc.start();
  return osc;
}
