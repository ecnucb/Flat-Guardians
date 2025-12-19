import { Entity } from "./entity.js";
import { PLAYER_STATS, PROJECTILE_STATS, GAME_WIDTH, GAME_HEIGHT } from "../config.js";
import { resolveAgainstPlatforms } from "../core/collision.js";
import { clamp } from "../core/utils.js";
import { Projectile } from "./projectile.js";

export class Player extends Entity {
  constructor(preset, spawn, input, audio, particles) {
    super({ x: spawn.x, y: spawn.y, width: PLAYER_STATS.width, height: PLAYER_STATS.height, color: preset.color });
    this.id = `player-${preset.id}`;
    this.element = preset.id;
    this.accent = preset.accent;
    this.controls = preset.controls;
    this.input = input;
    this.audio = audio;
    this.particles = particles;
    this.health = PLAYER_STATS.maxHealth;
    this.maxHealth = PLAYER_STATS.maxHealth;
    this.facing = 1;
    this.nextDash = 0;
    this.nextShot = 0;
    this.dashTimer = 0;
    this.nextAfterimage = 0;
    this.trail = [];
    this.trailTimer = 0;
  }

  update(platforms, delta, now, projectiles) {
    const deltaFactor = delta / (1000 / 60);
    const wasGrounded = this.onGround;
    this.applyHorizontalInput(deltaFactor);
    this.applyGravity(deltaFactor);
    this.handleJump(wasGrounded);
    this.handleDash(now);
    this.handleShoot(now, projectiles);
    this.dashTimer = Math.max(0, this.dashTimer - delta);

    this.onGround = false;
    this.position.add(this.velocity.clone().scale(deltaFactor));
    this.syncHitbox();
    resolveAgainstPlatforms(this, platforms);

    this.position.x = clamp(this.position.x, 8, GAME_WIDTH - this.width - 8);
    this.position.y = clamp(this.position.y, 0, GAME_HEIGHT - this.height - 4);

    const floorY = GAME_HEIGHT - this.height - 4;
    if (this.position.y >= floorY - 0.5 && this.velocity.y >= 0) {
      this.position.y = floorY;
      this.onGround = true;
      this.velocity.y = 0;
    }

    this.syncHitbox();

    if (this.isDashing() && now >= this.nextAfterimage) {
      this.spawnAfterimage();
      this.nextAfterimage = now + 45;
    }

    this.updateTrail(delta);
  }

  applyHorizontalInput(deltaFactor) {
    let intent = 0;
    if (this.input.isPressed(this.controls.left)) intent -= 1;
    if (this.input.isPressed(this.controls.right)) intent += 1;
    if (intent !== 0) this.facing = intent;

    this.velocity.x += intent * PLAYER_STATS.moveAccel * deltaFactor;
    if (intent === 0) this.velocity.x *= 0.82;
    this.velocity.x = clamp(this.velocity.x, -PLAYER_STATS.maxSpeed, PLAYER_STATS.maxSpeed);
  }

  applyGravity(deltaFactor) {
    this.velocity.y += PLAYER_STATS.gravity * deltaFactor;
    this.velocity.y = Math.min(this.velocity.y, PLAYER_STATS.maxSpeed * 3);
  }

  handleJump(canJump) {
    if (canJump && this.input.wasPressed(this.controls.jump)) {
      this.velocity.y = PLAYER_STATS.jumpVelocity;
      this.onGround = false;
      this.spawnDust();
    }
  }

  handleDash(now) {
    if (this.input.wasPressed(this.controls.dash) && now >= this.nextDash) {
      this.velocity.x = this.facing * PLAYER_STATS.dashBoost;
      this.velocity.y *= 0.35;
      this.nextDash = now + PLAYER_STATS.dashCooldown;
      this.dashTimer = 220;
      this.spawnDash();
      this.audio?.playSfx("dash");
    }
  }

  handleShoot(now, projectiles) {
    if (!this.input.wasPressed(this.controls.shoot) || now < this.nextShot) return;
    const projectile = new Projectile({
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2,
      radius: PROJECTILE_STATS.radius,
      speed: PROJECTILE_STATS.speed,
      direction: this.facing,
      owner: this.id,
      palette: {
        core: this.accent,
        glow: this.color
      }
    });
    projectiles.push(projectile);
    this.audio?.playSfx("pulse");
    this.nextShot = now + PLAYER_STATS.fireCooldown;
  }

  spawnDust() {
    this.particles?.spawnBurst({
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height,
      count: 6,
      speed: 2,
      spread: Math.PI,
      baseHue: this.accent
    });
  }

  spawnDash() {
    const center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };
    this.particles?.spawnDashTrail({
      x: center.x,
      y: center.y,
      direction: this.facing,
      color: this.color,
      accent: this.accent
    });
    this.particles?.spawnTrail({
      x: center.x,
      y: center.y,
      direction: this.facing,
      color: this.accent
    });
  }

  spawnAfterimage() {
    this.particles?.spawnAfterimage({
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2,
      width: this.width * 1.2,
      height: this.height * 0.9,
      color: this.color,
      accent: this.accent
    });
  }

  updateTrail(delta) {
    this.trailTimer = Math.max(this.trailTimer - delta, 0);
    this.trail = this.trail.filter((segment) => {
      segment.life -= delta;
      return segment.life > 0;
    });
    if (this.health <= 0) return;
    const moving = this.velocity.length() > 0.6 || this.isDashing();
    if (!moving || this.trailTimer > 0) return;
    this.trailTimer = this.isDashing() ? 35 : 55;
    const snapshot = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2,
      width: this.width * 1.1,
      height: this.height * 0.85,
      color: this.color,
      accent: this.accent,
      facing: this.facing,
      life: 240,
      ttl: 240
    };
    this.trail.unshift(snapshot);
    if (this.trail.length > 14) this.trail.pop();
  }

  getTrail() {
    return this.trail;
  }

  isDashing() {
    return this.dashTimer > 0;
  }

  reset(spawn) {
    this.position.set(spawn.x, spawn.y);
    this.velocity.set(0, 0);
    this.health = this.maxHealth;
    this.nextDash = 0;
    this.nextShot = 0;
    this.dashTimer = 0;
    this.nextAfterimage = 0;
    this.trail = [];
    this.trailTimer = 0;
    this.syncHitbox();
  }
}
