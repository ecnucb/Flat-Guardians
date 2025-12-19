import assert from "assert";
import { rectsOverlap, resolveAgainstPlatforms } from "../src/core/collision.js";
import { Vector2 } from "../src/core/vector.js";
import { PLAYER_STATS, PROJECTILE_STATS } from "../src/config.js";
import { LEVELS } from "../src/levels/levelData.js";

const assertStrict = assert.strict || assert;

(() => {
  assertStrict(rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 }), "Rectangles should overlap");
  assertStrict(!rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 }), "Rectangles should not overlap");

  const entity = {
    position: new Vector2(100, 130),
    velocity: new Vector2(0, 5),
    width: PLAYER_STATS.width,
    height: PLAYER_STATS.height,
    hitbox: { x: 100, y: 130, width: PLAYER_STATS.width, height: PLAYER_STATS.height },
    onGround: false,
    syncHitbox() {
      this.hitbox.x = this.position.x;
      this.hitbox.y = this.position.y;
    }
  };

  const platform = { x: 80, y: 140, width: 200, height: 12 };
  resolveAgainstPlatforms(entity, [platform]);
  assertStrict(entity.onGround, "Entity should rest on platform after resolve");

  assertStrict(Array.isArray(LEVELS) && LEVELS.length >= 3, "Should expose multiple level layouts");
  assertStrict(LEVELS.every((level) => Array.isArray(level.platforms) && level.platforms.length >= 4), "Levels need platform data");
  assertStrict(LEVELS.every((level) => Array.isArray(level.waves) && level.waves.length >= 3), "Levels need multi-wave scripts");
  assertStrict(PLAYER_STATS.maxHealth >= 3, "Players should have at least three health points");
  assertStrict(PROJECTILE_STATS.speed > 0 && PROJECTILE_STATS.lifetime > 1000, "Projectiles need lifetime and speed");

  console.log("Smoke test passed ✅");
})();
