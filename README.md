# Flat Guardians

Flat Guardians is a minimalist 2D arena platformer inspired by Flat Heroes and the cooperative spirit of classic "Forest Fireboy & Watergirl" adventures. Two geometric guardians share a single keyboard, chaining high jumps, long-range dashes, and energy pulses to cleanse every wave of rogue shapes across eight handcrafted arenas that span five distinct visual/audio themes.

## 🎮 Controls

| Action | Player 1 (Fire) | Player 2 (Ice) |
| --- | --- | --- |
| Move | `A` / `D` | `←` / `→` |
| Jump | `W` | `↑` |
| Dash (contact damage + burst mobility) | `K` | `.` |
| Pulse Shot | `J` | `Enter` |

> **Tips**
> - Dashes now travel ~3× farther and cancel some downward momentum, so you can bridge gaps or combo into enemies mid-air.
> - Jump height was increased (stronger impulse, lighter gravity), and the arena floor counts as solid ground—tap jump as soon as you land anywhere.
> - Guardians can only fall if **both** players are defeated, so revive momentum while your partner clutches the wave.

(Controller/Gamepad support is not required for this assignment but can be added via the Gamepad API.)

## ✨ Features

- **HTML5 Canvas @ 60fps** with requestAnimationFrame, camera-friendly transforms, and explicit clear/draw per frame.
- **ES modules + ES6 classes** for `Game`, `Player`, `Enemy`, `Projectile`, `Level`, `ParticleSystem`, `AudioManager`, etc.
- **Reactive enemy steering** that homes toward the nearest guardian with steering modifiers per wave.
- **Precise collisions** using custom AABB checks for players, platforms, enemies, and projectile impacts.
- **Campaign-style progression + level select:** eight handcrafted arenas (Atrium Crossfire, Spire Lanes, Orbital Garden, Neon Arcade, Undersea Trench, Network Grid, Canopy Divide, Void Spire) with independent palettes, multi-wave spawn scripts, escalating enemy modifiers, and a glassmorphism level selector so you can jump to any unlocked layout.
- **Fail states:** victory arrives once every wave in every arena is cleared; defeat only triggers if **both** guardians are eliminated.
- **Local co-op** on a single keyboard with separated bindings (WASD + arrows/Enter/Shift).
- **Stylized visuals** (solid neon palette, particle trails, dash bursts) and **Web Audio-powered, theme-aware music/SFX** without external engines.

## 🕹️ Game Flow

1. **Arena Rotation** – Clear three arenas back-to-back. Each arena chooses a distinct platform layout, color palette, and wave script.
2. **Wave System** – Every wave specifies total enemies, simultaneous spawns, spawn interval, and optional modifiers (speed, steering, gravity). Later waves spawn faster, more aggressive foes.
3. **Combat Loop** – Use long dashes to break through enemy packs, finish with pulse shots, and juggle foes off platforms. Dashing through an enemy damages it instantly.
4. **Win/Lose Conditions** – You win after the final Orbital Garden wave is empty. The run only ends if both guardians lose all health; otherwise the surviving player can finish the fight while the KO’d friend awaits the next level reset.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+

### Install & Run

```bash
npm install
npm start
```

The `start` script launches a zero-config `http-server` on port `4173`. Open `http://localhost:4173` to play.

### Tests

A lightweight smoke test validates the math helpers and level data:

```bash
npm run test
```

## 🔊 Audio

Sound is generated procedurally with the Web Audio API: each level theme spawns its own oscillator stack (neon saw leads, underwater sine pads, crunchy network squares, organic triangles, spacious detuned drones) while dash/shoot/impact cues use short synthesized pulses. No external audio assets are required.

## 🎨 Themes

Each arena advertises a theme tag and the level selector highlights it visually:

- **Neon Arcade** – electric blues and pinks with crisp saw-based arps.
- **Undersea Trench** – deep cyan gradients with undulating sine pads.
- **Network Grid** – circuitry greens and quantized square-wave bleeps.
- **Canopy Divide** – lush midnight greens with calm triangle harmonies.
- **Void Spire** – cosmic magentas and detuned drones for outer-space tension.

## 📖 Gameplay Notes

- **Jumps & Floor Handling** – Guardians can launch from floating platforms or the arena floor. Holding jump before landing will not buffer; tap after contact for a clean takeoff.
- **Dash Mastery** – Dashes now use a `dashBoost` of `150`, so expect dramatic travel distance. Combine jump → dash → pulse to traverse the full arena or to burst down waves quickly.
- **Enemy Durability** – Enemies are one-hit kills by default, but later waves may tweak modifiers to keep the pressure up.
- **HUD Readout** – The HUD shows current level, wave, active enemies, and queued spawns so you can plan strengths and dashes between waves.

## 📁 Structure

```
.
├── index.html          # Canvas + HUD + control legend
├── styles.css          # Minimal UI and neon background
├── src/
│   ├── main.js         # Entry point
│   ├── game.js         # Core loop & orchestration
│   ├── config.js       # Tunable constants
│   ├── core/           # Input, audio, math, collisions
│   ├── entities/       # Player, Enemy, Projectile
│   ├── effects/        # Particle system
│   └── levels/
│       ├── level.js    # Level rendering helpers
│       └── levelData.js# Multiple arena + wave configs
├── tests/
│   └── smoke.test.js   # Node-based sanity checks
├── package.json        # Scripts + dev server dependency
└── package-lock.json
```

## 🤖 AI Assistance

- An AI coding assistant generated the initial HTML5/Canvas game scaffold, including module layout, entity stubs, and configuration structure.
- The same assistant iterated on these files to document controls, systems, and setup instructions.
- This README (and its updates) was outlined and refined with AI help to keep the project notes consistent with the evolving codebase.

## 📜 License & Credits

Released under the MIT license. Built only with standard web APIs (Canvas 2D + Web Audio). Gameplay concept inspired by Flat Heroes (Parallel Circles / Deck13) and the cooperative spirit of Fireboy & Watergirl.
