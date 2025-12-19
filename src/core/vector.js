export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(f) {
    this.x *= f;
    this.y *= f;
    return this;
  }

  length() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const len = this.length() || 1;
    this.x /= len;
    this.y /= len;
    return this;
  }

  limit(max) {
    const len = this.length();
    if (len > max && len > 0) {
      const factor = max / len;
      this.x *= factor;
      this.y *= factor;
    }
    return this;
  }

  static subtract(a, b) {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  static distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
}
