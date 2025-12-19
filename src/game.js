import { GAME_WIDTH, GAME_HEIGHT, PLAYER_PRESETS, COLORS, PROJECTILE_STATS } from "./config.js";
import { InputManager } from "./core/input.js";
import { AudioManager } from "./core/audio.js";
import { rectsOverlap, projectileHits } from "./core/collision.js";
import { Level } from "./levels/level.js";
import { LEVELS } from "./levels/levelData.js";
import { Player } from "./entities/player.js";
import { Enemy } from "./entities/enemy.js";
import { ParticleSystem } from "./effects/particleSystem.js";

export class Game {
  constructor(canvas, hud) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hud = hud;
    this.input = new InputManager();
    this.audio = new AudioManager();
    this.level = null;
    this.levelData = null;
    this.particles = new ParticleSystem();
    this.players = [];
    this.enemies = [];
    this.projectiles = [];
    this.state = "menu";
    this.lastFrame = performance.now();
    this.levelIndex = 0;
    this.waveIndex = 0;
    this.waveSpawned = 0;
    this.spawnedEnemies = 0;
    this.spawnTimer = 0;
    this.runQueue = [];
    this.runCursor = 0;
    this.victoryHasNext = false;
    this.onMenuRequested = null;
    this.bindAudioUnlock();
  }

  startLevel(index = 0) {
    const safeIndex = ((index % LEVELS.length) + LEVELS.length) % LEVELS.length;
    this.runQueue = LEVELS.map((_, idx) => idx).slice(safeIndex);
    if (this.runQueue.length === 0) this.runQueue = [safeIndex];
    this.runCursor = 0;
    this.loadLevel(this.runQueue[this.runCursor], false);
    this.state = "playing";
    this.lastFrame = performance.now();
  }

  loadLevel(index, reusePlayers) {
    const safeIndex = ((index % LEVELS.length) + LEVELS.length) % LEVELS.length;
    this.levelIndex = safeIndex;
    this.levelData = LEVELS[safeIndex];
    this.level = new Level(this.levelData);
    this.audio.playTheme(this.levelData.theme ?? "default");
    this.waveIndex = 0;
    this.waveSpawned = 0;
    this.spawnedEnemies = 0;
    this.spawnTimer = 0;
    this.enemies = [];
    this.projectiles = [];
    this.initPlayers(reusePlayers);
  }

  initPlayers(reuseExisting = false) {
    if (reuseExisting && this.players.length === PLAYER_PRESETS.length) {
      this.players.forEach((player, index) => {
        const spawn = this.level.getPlayerSpawn(index);
        player.reset(spawn);
      });
      return;
    }
    this.players = PLAYER_PRESETS.map((preset, index) => {
      const spawn = this.level.getPlayerSpawn(index);
      return new Player(preset, spawn, this.input, this.audio, this.particles);
    });
  }

  bindAudioUnlock() {
    const resume = async () => {
      await this.audio.unlock();
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
  }

  start() {
    this.lastFrame = performance.now();
    const loop = (now) => {
      const delta = now - this.lastFrame;
      this.lastFrame = now;
      this.update(delta, now);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(delta, now) {
    if (this.state === "menu") {
      this.input.nextFrame();
      this.updateHud();
      return;
    }

    if (this.state === "victory") {
      this.handleVictoryInput();
      this.input.nextFrame();
      this.updateHud();
      return;
    }

    if (this.state === "defeated") {
      this.handleDefeatInput();
      this.input.nextFrame();
      this.updateHud();
      return;
    }

    this.spawnTimer += delta;
    this.spawnEnemies(now);

    this.players.forEach((player) => {
      if (player.health > 0) player.update(this.level.platforms, delta, now, this.projectiles);
    });

    this.enemies.forEach((enemy) => enemy.update(this.players, this.level.platforms, delta));

    this.updateProjectiles(delta, now);
    this.handlePlayerEnemyContacts(now);
    this.resolveProjectiles(now);
    this.enemies = this.enemies.filter((enemy) => enemy.health > 0);
    this.particles.update(delta);

    if (this.players.every((player) => player.health <= 0)) {
      this.state = "defeated";
      this.audio.playSfx("hit");
      this.input.nextFrame();
      return;
    }

    if (this.isLevelComplete()) {
      this.victoryHasNext = this.runCursor < this.runQueue.length - 1;
      this.state = "victory";
      this.input.nextFrame();
      return;
    }

    this.input.nextFrame();
    this.updateHud();
  }

  spawnEnemies(now) {
    const wave = this.level.getWave(this.waveIndex);
    if (!wave) return;

    if (this.waveSpawned >= wave.count) {
      if (this.enemies.length === 0) this.advanceWave();
      return;
    }

    if (this.enemies.length >= (wave.simultaneous ?? 3)) return;
    if (this.spawnTimer < (wave.interval ?? 800)) return;

    this.spawnTimer = 0;
    const spawn = this.level.getRandomEnemySpawn();
    const enemy = new Enemy(spawn, wave.enemyModifiers);
    this.enemies.push(enemy);
    this.waveSpawned += 1;
    this.spawnedEnemies += 1;
  }

  advanceWave() {
    this.waveIndex += 1;
    this.waveSpawned = 0;
    this.spawnTimer = 0;
  }

  isLevelComplete() {
    if (!this.level) return false;
    const noMoreWaves = this.waveIndex >= this.level.waves.length;
    return noMoreWaves && this.enemies.length === 0;
  }

  updateProjectiles(delta, now) {
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.update(delta);
      const offscreen =
        projectile.position.x < 0 ||
        projectile.position.x > GAME_WIDTH ||
        projectile.position.y < 0 ||
        projectile.position.y > GAME_HEIGHT;
      return !offscreen && !projectile.isExpired(now);
    });
  }

  handlePlayerEnemyContacts(now) {
    this.enemies.forEach((enemy) => {
      this.players.forEach((player) => {
        if (player.health <= 0) return;
        if (!rectsOverlap(player.hitbox, enemy.hitbox)) return;
        if (player.isDashing()) {
          enemy.takeDamage(1, now);
          this.particles.spawnBurst({
            x: enemy.position.x + enemy.width / 2,
            y: enemy.position.y + enemy.height / 2,
            count: 8,
            speed: 2.2,
            baseHue: player.accent
          });
          enemy.velocity.x += (player.facing || 1) * 3;
          this.audio.playSfx("dash");
        } else {
          player.takeDamage(1, now);
          const direction = Math.sign(player.center().x - enemy.center().x) || 1;
          player.velocity.x += direction * 4;
          player.velocity.y = -4;
          enemy.velocity.x -= direction * 2;
          this.audio.playSfx("hit");
        }
      });
    });
  }

  resolveProjectiles(now) {
    const surviving = [];
    this.projectiles.forEach((projectile) => {
      let consumed = false;
      for (const enemy of this.enemies) {
        if (enemy.health <= 0) continue;
        if (projectileHits(enemy, projectile)) {
          enemy.takeDamage(PROJECTILE_STATS.damage, now);
          this.audio.playSfx("hit");
          this.particles.spawnBurst({
            x: enemy.position.x + enemy.width / 2,
            y: enemy.position.y + enemy.height / 2,
            count: 12,
            speed: 2.4,
            baseHue: COLORS.enemyAccent
          });
          consumed = true;
          break;
        }
      }
      if (!consumed) surviving.push(projectile);
    });
    this.projectiles = surviving;
  }

  render() {
    this.ctx.save();
    const playfield = this.level?.playfieldColor ?? COLORS.playfield;
    this.ctx.fillStyle = playfield;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    if (this.level) {
      this.level.render(this.ctx);
    }
    this.projectiles.forEach((projectile) => projectile.render(this.ctx));
    this.particles.render(this.ctx);
    this.enemies.forEach((enemy) => enemy.render(this.ctx));
    this.players.forEach((player) => {
      if (player.health <= 0) return;
      this.drawPlayerTrail(player);
      this.drawPlayer(player);
    });

    if (this.state === "victory" || this.state === "defeated") {
      this.drawEndBanner();
    }
  }

  drawPlayer(player) {
    const ctx = this.ctx;
    const x = player.position.x;
    const y = player.position.y;
    const w = player.width;
    const h = player.height;
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    ctx.save();

    // elemental aura behind the body
    ctx.globalAlpha = 0.45;
    ctx.shadowColor = player.accent;
    ctx.shadowBlur = player.isDashing() ? 30 : 18;
    ctx.fillStyle = player.accent;
    ctx.beginPath();
    ctx.ellipse(centerX, y + h, w * 0.9, h * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // primary body gradient
    const bodyGradient = ctx.createLinearGradient(x, y - 8, x, y + h + 6);
    bodyGradient.addColorStop(0, player.accent);
    bodyGradient.addColorStop(1, player.color);
    ctx.fillStyle = bodyGradient;
    drawRoundedRect(ctx, x, y, w, h, 8);
    ctx.fill();

    // inner glow for extra depth
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, w);
    innerGradient.addColorStop(0, "rgba(248, 250, 252, 0.55)");
    innerGradient.addColorStop(1, "rgba(248, 250, 252, 0)");
    ctx.fillStyle = innerGradient;
    drawRoundedRect(ctx, x + 4, y + 4, w - 8, h - 8, 6);
    ctx.fill();

    // elemental crest
    this.drawElementCrest(player, centerX, y, w, h);

    // health bar with gradient tint
    const ratio = player.maxHealth ? Math.max(player.health, 0) / player.maxHealth : 0;
    ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
    drawRoundedRect(ctx, x, y - 8, w, 4, 2);
    ctx.fill();
    if (ratio > 0) {
      const barGradient = ctx.createLinearGradient(x, y - 8, x + w, y - 8);
      barGradient.addColorStop(0, player.accent);
      barGradient.addColorStop(1, player.color);
      ctx.fillStyle = barGradient;
      drawRoundedRect(ctx, x, y - 8, w * ratio, 4, 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawPlayerTrail(player) {
    const trail = player.getTrail ? player.getTrail() : [];
    if (!trail?.length) return;
    const ctx = this.ctx;
    trail.forEach((segment, index) => {
      const alpha = Math.max(segment.life / (segment.ttl || 1), 0);
      if (alpha <= 0) return;
      ctx.save();
      ctx.translate(segment.x, segment.y);
      ctx.rotate(segment.facing === -1 ? Math.PI : 0);
      ctx.globalAlpha = alpha * 0.55;
      const width = segment.width * (1 + index * 0.03);
      const height = segment.height * (1 - index * 0.015);
      const gradient = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
      gradient.addColorStop(0, withAlpha(segment.color, 0));
      gradient.addColorStop(0.3, withAlpha(segment.accent, 0.85));
      gradient.addColorStop(0.7, withAlpha(segment.color, 0.65));
      gradient.addColorStop(1, withAlpha(segment.color, 0));
      ctx.fillStyle = gradient;
      drawRoundedRect(ctx, -width / 2, -height / 2, width, height, height / 2.5);
      ctx.fill();
      ctx.restore();
    });
  }

  drawEndBanner() {
    const message = this.state === "victory" ? "Victory!" : "Defeated";
    const hasNext = this.victoryHasNext;
    this.ctx.save();
    this.ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    this.ctx.fillRect(0, this.canvas.height / 2 - 40, this.canvas.width, 80);
    this.ctx.fillStyle = "#f8fafc";
    this.ctx.font = "32px 'Segoe UI', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = "18px 'Segoe UI', sans-serif";
    let sub = "";
    if (this.state === "victory") {
      sub = hasNext ? "Enter: Next arena  |  M: Menu" : "Enter: Menu  |  M: Menu";
    } else {
      sub = "Enter: Retry  |  M: Menu";
    }
    this.ctx.fillText(sub, this.canvas.width / 2, this.canvas.height / 2 + 28);
    this.ctx.restore();
  }

  updateHud() {
    const totalLevels = LEVELS.length;
    const totalWaves = this.level?.waves.length ?? 0;
    const waveNumber = Math.min(this.waveIndex + 1, totalWaves);
    const currentWave = this.level?.getWave(this.waveIndex);
    const pendingCurrent = Math.max((currentWave?.count ?? 0) - this.waveSpawned, 0);
    const futurePending = (this.level?.waves ?? [])
      .slice(this.waveIndex + 1)
      .reduce((acc, wave) => acc + (wave.count ?? 0), 0);
    const queueSize = pendingCurrent + futurePending;

    const status =
      this.state === "victory"
        ? "All threats neutralized"
        : this.state === "defeated"
        ? "A guardian fell"
        : this.level
        ? `Level ${this.levelIndex + 1}/${totalLevels}: ${this.level?.name ?? "Arena"}`
        : "Select an arena to deploy";

    const waveLabel = totalWaves > 0 ? `Wave ${Math.min(waveNumber, totalWaves)}/${totalWaves}` : "Wave -/-";
    this.hud.textContent = `${status} | ${waveLabel} | Active: ${this.enemies.length} | Queue: ${queueSize}`;
  }

  returnToMenu() {
    this.state = "menu";
    this.level = null;
    this.levelData = null;
    this.enemies = [];
    this.projectiles = [];
    this.players = [];
    this.particles = new ParticleSystem();
    this.runQueue = [];
    this.runCursor = 0;
    this.victoryHasNext = false;
    this.audio.playTheme("default");
    this.onMenuRequested?.();
    this.updateHud();
  }

  handleVictoryInput() {
    const confirm = this.input.wasPressed("enter") || this.input.wasPressed("space");
    const menuKey = this.input.wasPressed("keym") || this.input.wasPressed("escape");
    if (this.victoryHasNext && confirm) {
      this.advanceToNextLevel();
      return;
    }
    if (!this.victoryHasNext && confirm) {
      this.returnToMenu();
      return;
    }
    if (menuKey) {
      this.returnToMenu();
    }
  }

  handleDefeatInput() {
    const confirm = this.input.wasPressed("enter") || this.input.wasPressed("space");
    const menuKey = this.input.wasPressed("keym") || this.input.wasPressed("escape");
    if (confirm) {
      this.retryCurrentLevel();
      return;
    }
    if (menuKey) {
      this.returnToMenu();
    }
  }

  advanceToNextLevel() {
    if (!this.victoryHasNext) {
      this.returnToMenu();
      return;
    }
    this.runCursor += 1;
    const nextIndex = this.runQueue[this.runCursor];
    this.loadLevel(nextIndex, true);
    this.state = "playing";
    this.victoryHasNext = this.runCursor < this.runQueue.length - 1;
    this.input.nextFrame();
  }

  retryCurrentLevel() {
    const currentIndex = this.runQueue[this.runCursor] ?? this.levelIndex;
    if (currentIndex == null) {
      this.returnToMenu();
      return;
    }
    this.loadLevel(currentIndex, false);
    this.state = "playing";
    this.input.nextFrame();
  }

  drawElementCrest(player, centerX, topY, width, height) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(248, 250, 252, 0.35)";
    if (player.element === "fire") {
      ctx.fillStyle = player.accent;
      ctx.beginPath();
      ctx.moveTo(centerX, topY - 6);
      ctx.quadraticCurveTo(centerX + width * 0.35, topY + height * 0.2, centerX, topY + height * 0.45);
      ctx.quadraticCurveTo(centerX - width * 0.35, topY + height * 0.2, centerX, topY - 6);
      ctx.fill();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.moveTo(centerX, topY + height * 0.05);
      ctx.lineTo(centerX + width * 0.12, topY + height * 0.28);
      ctx.lineTo(centerX - width * 0.12, topY + height * 0.28);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = player.accent;
      ctx.beginPath();
      ctx.moveTo(centerX, topY - 4);
      ctx.lineTo(centerX + width * 0.12, topY + height * 0.18);
      ctx.lineTo(centerX, topY + height * 0.36);
      ctx.lineTo(centerX - width * 0.12, topY + height * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.beginPath();
      ctx.moveTo(centerX, topY + height * 0.05);
      ctx.lineTo(centerX + width * 0.08, topY + height * 0.2);
      ctx.lineTo(centerX, topY + height * 0.32);
      ctx.lineTo(centerX - width * 0.08, topY + height * 0.2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function withAlpha(hex, alpha) {
  if (!hex) return `rgba(248, 250, 252, ${alpha})`;
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((ch) => ch + ch).join("");
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
