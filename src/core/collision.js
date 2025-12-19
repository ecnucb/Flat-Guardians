export const rectsOverlap = (a, b) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

export const pointInRect = (x, y, rect) =>
  x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;

export function resolveAgainstPlatforms(entity, platforms) {
  for (const platform of platforms) {
    if (!rectsOverlap(entity.hitbox, platform)) continue;
    const overlapX =
      entity.hitbox.x + entity.hitbox.width / 2 < platform.x + platform.width / 2
        ? entity.hitbox.x + entity.hitbox.width - platform.x
        : platform.x + platform.width - entity.hitbox.x;
    const overlapY =
      entity.hitbox.y + entity.hitbox.height / 2 < platform.y + platform.height / 2
        ? entity.hitbox.y + entity.hitbox.height - platform.y
        : platform.y + platform.height - entity.hitbox.y;

    if (overlapX < overlapY) {
      entity.position.x += entity.hitbox.x + entity.hitbox.width / 2 < platform.x + platform.width / 2 ? -overlapX : overlapX;
      entity.velocity.x = 0;
    } else {
      entity.position.y += entity.hitbox.y + entity.hitbox.height / 2 < platform.y + platform.height / 2 ? -overlapY : overlapY;
      entity.velocity.y = 0;
      entity.onGround = entity.position.y + entity.hitbox.height <= platform.y + 1;
    }
    entity.syncHitbox();
  }
}

export function projectileHits(entity, projectile) {
  const circleX = projectile.position.x;
  const circleY = projectile.position.y;
  const rect = entity.hitbox;
  const testX = clamp(circleX, rect.x, rect.x + rect.width);
  const testY = clamp(circleY, rect.y, rect.y + rect.height);
  const distX = circleX - testX;
  const distY = circleY - testY;
  return distX * distX + distY * distY <= projectile.radius * projectile.radius;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
