import { randRange } from "../core/utils.js";
import { COLORS } from "../config.js";

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawnBurst({ x, y, count = 5, speed = 2, spread = Math.PI * 2, baseHue = COLORS.particles[0] }) {
    for (let i = 0; i < count; i += 1) {
      const angle = randRange(-spread / 2, spread / 2);
      const velocity = {
        x: Math.cos(angle) * speed * randRange(0.6, 1.2),
        y: Math.sin(angle) * speed * randRange(0.6, 1.2)
      };
      const lifetime = randRange(260, 460);
      this.particles.push({
        type: "spark",
        x,
        y,
        vx: velocity.x,
        vy: velocity.y,
        size: randRange(2, 5),
        rotation: randRange(0, Math.PI * 2),
        life: lifetime,
        ttl: lifetime,
        color: baseHue
      });
    }
  }

  spawnTrail({ x, y, direction, color = COLORS.particles[1] }) {
    const hue = color || (direction > 0 ? COLORS.particles[1] : COLORS.particles[2]);
    this.spawnBurst({ x, y, count: 5, speed: 1.8, spread: Math.PI / 2.2, baseHue: hue });
  }

  spawnDashTrail({ x, y, direction, color, accent }) {
    const width = 64;
    this.particles.push({
      type: "dash",
      x,
      y,
      vx: direction * 0.9,
      vy: 0,
      width,
      height: 12,
      color,
      accent,
      life: 220,
      ttl: 220,
      rotation: direction > 0 ? 0 : Math.PI
    });
  }

  spawnAfterimage({ x, y, width, height, color, accent }) {
    this.particles.push({
      type: "afterimage",
      x,
      y,
      width,
      height,
      color,
      accent,
      rotation: randRange(-0.15, 0.15),
      life: 180,
      ttl: 180
    });
  }

  update(delta) {
    const dt = delta / 16;
    this.particles = this.particles.filter((particle) => {
      particle.life -= delta;
      if (particle.life <= 0) return false;

      if (particle.type === "spark") {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= 0.96;
        particle.vy *= 0.96;
      } else if (particle.type === "dash") {
        particle.x += (particle.vx ?? 0) * dt;
        particle.width *= 0.96;
        particle.height *= 0.98;
      } else if (particle.type === "afterimage") {
        particle.y += Math.sin(particle.rotation) * 0.3;
      }
      return particle.life > 0;
    });
  }

  render(ctx) {
    ctx.save();
    this.particles.forEach((particle) => {
      const alpha = particle.ttl ? particle.life / particle.ttl : particle.life / 400;
      ctx.globalAlpha = Math.max(alpha, 0);
      if (particle.type === "dash") {
        this.renderDash(ctx, particle);
      } else if (particle.type === "afterimage") {
        this.renderAfterimage(ctx, particle);
      } else {
        this.renderSpark(ctx, particle);
      }
    });
    ctx.restore();
  }

  renderSpark(ctx, particle) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    const size = particle.size ?? 3;
    ctx.fillStyle = particle.color;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  renderDash(ctx, particle) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation ?? 0);
    const gradient = ctx.createLinearGradient(-particle.width / 2, 0, particle.width / 2, 0);
    gradient.addColorStop(0, withAlpha(particle.color ?? COLORS.particles[0], 0));
    gradient.addColorStop(0.4, withAlpha(particle.accent ?? "#ffffff", 0.7));
    gradient.addColorStop(1, withAlpha(particle.color ?? COLORS.particles[0], 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
    ctx.restore();
  }

  renderAfterimage(ctx, particle) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation || 0);
    const gradient = ctx.createLinearGradient(-particle.width / 2, 0, particle.width / 2, 0);
    gradient.addColorStop(0, withAlpha(particle.color ?? "#ffffff", 0.2));
    gradient.addColorStop(0.5, withAlpha(particle.accent ?? "#ffffff", 0.45));
    gradient.addColorStop(1, withAlpha(particle.color ?? "#ffffff", 0.05));
    ctx.fillStyle = gradient;
    ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
    ctx.restore();
  }
}

function withAlpha(hex, alpha) {
  if (!hex) return `rgba(255,255,255,${alpha})`;
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
