import { Vector2 } from "../core/vector.js";

export class Entity {
  constructor({ x, y, width, height, color }) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2();
    this.width = width;
    this.height = height;
    this.color = color;
    this.hitbox = { x, y, width, height };
    this.onGround = false;
    this.health = 1;
    this.invulnerableUntil = 0;
  }

  center() {
    return new Vector2(this.position.x + this.width / 2, this.position.y + this.height / 2);
  }

  syncHitbox() {
    this.hitbox.x = this.position.x;
    this.hitbox.y = this.position.y;
    this.hitbox.width = this.width;
    this.hitbox.height = this.height;
  }

  takeDamage(amount, now) {
    if (now < this.invulnerableUntil) return false;
    this.health -= amount;
    this.invulnerableUntil = now + 350;
    return this.health <= 0;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
