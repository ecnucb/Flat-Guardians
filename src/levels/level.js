import { GAME_WIDTH, GAME_HEIGHT } from "../config.js";

export class Level {
  constructor(config) {
    this.name = config.name ?? "Arena";
    this.platforms = config.platforms;
    this.playerSpawns = config.playerSpawns;
    this.enemySpawns = config.enemySpawns;
    this.waves = config.waves ?? [];
    this.playfieldColor = config.playfieldColor;
    this.platformColor = config.platformColor ?? "rgba(148, 163, 184, 0.2)";
    this.bounds = { x: 0, y: 0, width: GAME_WIDTH, height: GAME_HEIGHT };
  }

  getPlayerSpawn(index) {
    return this.playerSpawns[index % this.playerSpawns.length];
  }

  getRandomEnemySpawn() {
    return this.enemySpawns[Math.floor(Math.random() * this.enemySpawns.length)];
  }

  getWave(index) {
    return this.waves[index] ?? null;
  }

  render(ctx) {
    ctx.save();
    ctx.fillStyle = this.platformColor;
    this.platforms.forEach((platform) => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    ctx.restore();
  }
}
