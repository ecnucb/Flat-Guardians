export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TARGET_FPS = 60;
export const FRAME_DURATION = 1000 / TARGET_FPS;

export const PLAYER_PRESETS = [
  {
    id: "fire",
    color: "#f43f5e",
    accent: "#f97316",
    controls: { left: "keya", right: "keyd", jump: "keyw", dash: "keyk", shoot: "keyj" }
  },
  {
    id: "ice",
    color: "#38bdf8",
    accent: "#22d3ee",
    controls: { left: "arrowleft", right: "arrowright", jump: "arrowup", dash: "period", shoot: "enter" }
  }
];

export const PLAYER_STATS = {
  width: 28,
  height: 28,
  maxSpeed: 5.2,
  moveAccel: 0.45,
  jumpVelocity: -11,
  gravity: 0.45,
  dashBoost: 66,
  dashCooldown: 900,
  fireCooldown: 280,
  maxHealth: 3
};

export const ENEMY_STATS = {
  width: 26,
  height: 26,
  speed: 3.2,
  steerForce: 0.12,
  aggroRadius: 440
};

export const PROJECTILE_STATS = {
  speed: 9,
  radius: 5,
  lifetime: 1800,
  damage: 1
};

export const COLORS = {
  background: "#030712",
  playfield: "#0f172a",
  enemy: "#facc15",
  enemyAccent: "#fde047",
  projectile: "#f8fafc",
  particles: ["#fbbf24", "#f97316", "#38bdf8", "#a855f7"]
};

