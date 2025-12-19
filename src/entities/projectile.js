import { Vector2 } from "../core/vector.js";
import { PROJECTILE_STATS } from "../config.js";

export class Projectile {
  constructor({ x, y, radius, speed, direction, owner, palette }) {
    this.position = new Vector2(x, y);
    this.radius = radius;
    this.speed = speed;
    this.direction = new Vector2(direction, 0).normalize();
    this.velocity = this.direction.clone().scale(this.speed);
    this.owner = owner;
    this.palette = palette ?? { core: "#f8fafc", glow: "#94a3b8" };
    this.color = this.palette.core;
    this.spawnTime = performance.now();
  }

  update(delta) {
    const frameScale = delta / (1000 / 60);
    this.position.add(this.velocity.clone().scale(frameScale));
  }

  isExpired(now) {
    return now - this.spawnTime > PROJECTILE_STATS.lifetime;
  }

  render(ctx) {
    ctx.save();
    const gradient = ctx.createRadialGradient(
      this.position.x,
      this.position.y,
      this.radius * 0.2,
      this.position.x,
      this.position.y,
      this.radius * 1.6
    );
    gradient.addColorStop(0, this.palette.core);
    gradient.addColorStop(1, this.palette.glow);
    ctx.shadowColor = this.palette.core;
    ctx.shadowBlur = 10;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = this.palette.core;
    ctx.stroke();
    ctx.restore();
  }
}
