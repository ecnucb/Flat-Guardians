import { Entity } from "./entity.js";
import { Vector2 } from "../core/vector.js";
import { ENEMY_STATS, GAME_WIDTH, GAME_HEIGHT } from "../config.js";
import { resolveAgainstPlatforms } from "../core/collision.js";
import { clamp } from "../core/utils.js";

export class Enemy extends Entity {
  constructor(spawn, modifiers = {}) {
    super({ x: spawn.x, y: spawn.y, width: ENEMY_STATS.width, height: ENEMY_STATS.height, color: "#facc15" });
    this.accent = "#fde047";
    this.health = modifiers.health ?? 1;
    this.speed = ENEMY_STATS.speed * (modifiers.speedMultiplier ?? 1);
    this.steerForce = ENEMY_STATS.steerForce * (modifiers.steerMultiplier ?? modifiers.speedMultiplier ?? 1);
    this.maxVertical = this.speed * 2.4;
    this.gravity = 0.25 * (modifiers.gravityMultiplier ?? 1);
    this.phase = Math.random() * Math.PI * 2;
    this.currentTarget = null;
    this.retargetDelay = 0;
  }

  update(players, platforms, delta) {
    const deltaFactor = delta / (1000 / 60);
    this.phase += delta * 0.0035;
    this.retargetDelay = Math.max(0, this.retargetDelay - delta);

    const lock = this.acquireTarget(players);
    if (lock) {
      const desiredDirection = Vector2.subtract(lock.point, this.center());
      const distance = desiredDirection.length() || 1;
      const desiredVelocity = desiredDirection.clone().normalize().scale(this.speed);
      const steer = desiredVelocity.subtract(this.velocity.clone());
      this.velocity.x += steer.x * this.steerForce * deltaFactor;
      this.velocity.y += steer.y * this.steerForce * deltaFactor;

      if (distance > ENEMY_STATS.aggroRadius) {
        this.velocity.scale(0.94);
      } else if (distance < 36) {
        this.velocity.scale(0.88);
      }

      // subtle strafing so enemies do not stack perfectly on each other
      const strafe = new Vector2(-desiredDirection.y, desiredDirection.x)
        .normalize()
        .scale(Math.sin(this.phase * 1.7) * 0.45);
      this.velocity.x += strafe.x * deltaFactor;
      this.velocity.y += strafe.y * deltaFactor;
    } else {
      this.velocity.x += (Math.random() - 0.5) * 0.06 * deltaFactor;
    }

    this.velocity.y += this.gravity * deltaFactor;
    this.velocity.x = clamp(this.velocity.x, -this.speed, this.speed);
    this.velocity.y = clamp(this.velocity.y, -this.speed * 2, this.maxVertical);

    this.position.add(this.velocity.clone().scale(deltaFactor));
    this.syncHitbox();
    resolveAgainstPlatforms(this, platforms);
    this.position.x = clamp(this.position.x, 0, GAME_WIDTH - this.width);
    this.position.y = clamp(this.position.y, 0, GAME_HEIGHT - this.height);
    this.syncHitbox();
  }

  acquireTarget(players) {
    const living = players.filter((player) => player && player.health > 0);
    if (!living.length) {
      this.currentTarget = null;
      return null;
    }

    if (this.currentTarget && this.currentTarget.health > 0 && this.retargetDelay > 0) {
      return { player: this.currentTarget, point: this.predictFuture(this.currentTarget) };
    }

    let bestPlayer = null;
    let bestScore = -Infinity;
    const selfCenter = this.center();

    living.forEach((player) => {
      const playerCenter = player.center();
      const distance = Vector2.distance(selfCenter, playerCenter);
      const distanceScore = Math.max(0, ENEMY_STATS.aggroRadius - distance);
      const weaknessScore = (player.maxHealth - player.health) * 110;
      const mobilityScore = Math.max(0, player.velocity.length() - 2) * 18;
      const altitudeScore = playerCenter.y < selfCenter.y ? 40 : 0;
      const score = distanceScore + weaknessScore + mobilityScore + altitudeScore;
      if (score > bestScore) {
        bestScore = score;
        bestPlayer = player;
      }
    });

    if (!bestPlayer) return null;
    this.currentTarget = bestPlayer;
    this.retargetDelay = 800;
    return { player: bestPlayer, point: this.predictFuture(bestPlayer) };
  }

  predictFuture(player) {
    const selfCenter = this.center();
    const targetCenter = player.center();
    const distance = Vector2.distance(selfCenter, targetCenter);
    const lookAhead = clamp(distance / 520, 0.12, 0.6);
    const predicted = targetCenter.clone().add(player.velocity.clone().scale(lookAhead * 32));
    predicted.x = clamp(predicted.x, 0, GAME_WIDTH);
    predicted.y = clamp(predicted.y, 0, GAME_HEIGHT);
    return predicted;
  }

  render(ctx) {
    const x = this.position.x;
    const y = this.position.y;
    const w = this.width;
    const h = this.height;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const bob = Math.sin(this.phase) * 2;

    ctx.save();
    ctx.translate(0, bob);

    const bodyGradient = ctx.createLinearGradient(x, y - 6, x, y + h + 6);
    bodyGradient.addColorStop(0, "#fef3c7");
    bodyGradient.addColorStop(1, "#f97316");

    ctx.shadowColor = this.accent;
    ctx.shadowBlur = 14;
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(cx, y - 4);
    ctx.lineTo(x + w + 6, cy);
    ctx.lineTo(cx, y + h + 8);
    ctx.lineTo(x - 6, cy);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(250, 204, 21, 0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 6, cy);
    ctx.lineTo(x + w - 6, cy);
    ctx.moveTo(cx, y + 4);
    ctx.lineTo(cx, y + h + 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fef9c3";
    ctx.beginPath();
    ctx.arc(cx + 3, cy - 3, w * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
