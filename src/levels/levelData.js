export const LEVELS = [
  {
    id: "atrium-cross",
    name: "Atrium Crossfire",
    playfieldColor: "#0b1220",
    platformColor: "rgba(248, 250, 252, 0.12)",
    playerSpawns: [
      { x: 160, y: 360 },
      { x: 760, y: 360 }
    ],
    enemySpawns: [
      { x: 480, y: 120 },
      { x: 120, y: 120 },
      { x: 840, y: 120 },
      { x: 480, y: 440 }
    ],
    platforms: [
      { x: 96, y: 420, width: 320, height: 12 },
      { x: 544, y: 420, width: 320, height: 12 },
      { x: 64, y: 280, width: 200, height: 12 },
      { x: 696, y: 280, width: 200, height: 12 },
      { x: 340, y: 180, width: 280, height: 12 }
    ],
    waves: [
      { count: 6, simultaneous: 3, interval: 900 },
      { count: 8, simultaneous: 4, interval: 750 },
      { count: 10, simultaneous: 5, interval: 650, enemyModifiers: { speedMultiplier: 1.15 } }
    ]
  },
  {
    id: "spire-lanes",
    name: "Spire Lanes",
    playfieldColor: "#06111f",
    platformColor: "rgba(56, 189, 248, 0.15)",
    playerSpawns: [
      { x: 120, y: 400 },
      { x: 820, y: 400 }
    ],
    enemySpawns: [
      { x: 480, y: 60 },
      { x: 120, y: 60 },
      { x: 840, y: 60 },
      { x: 120, y: 300 },
      { x: 840, y: 300 }
    ],
    platforms: [
      { x: 80, y: 460, width: 180, height: 12 },
      { x: 700, y: 460, width: 180, height: 12 },
      { x: 260, y: 340, width: 160, height: 12 },
      { x: 540, y: 340, width: 160, height: 12 },
      { x: 420, y: 220, width: 120, height: 12 },
      { x: 200, y: 140, width: 200, height: 12 },
      { x: 560, y: 140, width: 200, height: 12 }
    ],
    waves: [
      { count: 8, simultaneous: 3, interval: 820 },
      { count: 10, simultaneous: 4, interval: 700 },
      { count: 12, simultaneous: 5, interval: 640, enemyModifiers: { speedMultiplier: 1.2, steerMultiplier: 1.15 } },
      { count: 14, simultaneous: 6, interval: 600, enemyModifiers: { speedMultiplier: 1.25 } }
    ]
  },
  {
    id: "orbital-garden",
    name: "Orbital Garden",
    playfieldColor: "#120c1c",
    platformColor: "rgba(168, 85, 247, 0.18)",
    playerSpawns: [
      { x: 220, y: 420 },
      { x: 700, y: 420 }
    ],
    enemySpawns: [
      { x: 80, y: 220 },
      { x: 880, y: 220 },
      { x: 480, y: 120 },
      { x: 480, y: 420 }
    ],
    platforms: [
      { x: 160, y: 460, width: 220, height: 12 },
      { x: 580, y: 460, width: 220, height: 12 },
      { x: 360, y: 320, width: 240, height: 12 },
      { x: 120, y: 240, width: 180, height: 12 },
      { x: 660, y: 240, width: 180, height: 12 },
      { x: 340, y: 140, width: 280, height: 12 }
    ],
    waves: [
      { count: 10, simultaneous: 4, interval: 780 },
      { count: 12, simultaneous: 5, interval: 640, enemyModifiers: { speedMultiplier: 1.2 } },
      { count: 16, simultaneous: 6, interval: 580, enemyModifiers: { speedMultiplier: 1.35, steerMultiplier: 1.2 } },
      { count: 20, simultaneous: 6, interval: 520, enemyModifiers: { speedMultiplier: 1.4 } }
    ]
  }
];

// Additional themed arenas
LEVELS.push({
  id: "neon-arcade",
  name: "Neon Arcade",
  playfieldColor: "#020617",
  platformColor: "rgba(56,189,248,0.12)",
  playerSpawns: [{ x: 160, y: 360 }, { x: 800, y: 360 }],
  enemySpawns: [{ x: 480, y: 100 }, { x: 240, y: 160 }, { x: 720, y: 160 }],
  platforms: [
    { x: 64, y: 420, width: 260, height: 12 },
    { x: 360, y: 320, width: 240, height: 12 },
    { x: 660, y: 420, width: 240, height: 12 },
    { x: 240, y: 220, width: 160, height: 12 },
    { x: 560, y: 220, width: 160, height: 12 }
  ],
  waves: [
    { count: 8, simultaneous: 3, interval: 700 },
    { count: 10, simultaneous: 4, interval: 650 },
    { count: 14, simultaneous: 5, interval: 600 }
  ],
  theme: "neon"
});

LEVELS.push({
  id: "undersea",
  name: "Undersea Trench",
  playfieldColor: "#012236",
  platformColor: "rgba(3,105,161,0.12)",
  playerSpawns: [{ x: 180, y: 360 }, { x: 760, y: 360 }],
  enemySpawns: [{ x: 480, y: 120 }, { x: 120, y: 120 }, { x: 840, y: 120 }],
  platforms: [
    { x: 100, y: 420, width: 300, height: 12 },
    { x: 560, y: 420, width: 300, height: 12 },
    { x: 320, y: 300, width: 320, height: 12 },
    { x: 200, y: 200, width: 160, height: 12 },
    { x: 600, y: 200, width: 160, height: 12 }
  ],
  waves: [
    { count: 10, simultaneous: 4, interval: 820 },
    { count: 12, simultaneous: 5, interval: 700 },
    { count: 16, simultaneous: 6, interval: 620 }
  ],
  theme: "underwater"
});

LEVELS.push({
  id: "network-grid",
  name: "Network Grid",
  playfieldColor: "#030712",
  platformColor: "rgba(34,197,94,0.14)",
  playerSpawns: [{ x: 150, y: 360 }, { x: 810, y: 360 }],
  enemySpawns: [
    { x: 480, y: 80 },
    { x: 220, y: 140 },
    { x: 740, y: 140 },
    { x: 220, y: 360 },
    { x: 740, y: 360 }
  ],
  platforms: [
    { x: 80, y: 420, width: 200, height: 12 },
    { x: 340, y: 420, width: 180, height: 12 },
    { x: 600, y: 420, width: 180, height: 12 },
    { x: 780, y: 420, width: 180, height: 12 },
    { x: 220, y: 280, width: 160, height: 12 },
    { x: 700, y: 280, width: 160, height: 12 },
    { x: 360, y: 160, width: 200, height: 12 },
    { x: 540, y: 160, width: 200, height: 12 }
  ],
  waves: [
    { count: 12, simultaneous: 4, interval: 760 },
    { count: 14, simultaneous: 5, interval: 660, enemyModifiers: { speedMultiplier: 1.2 } },
    { count: 18, simultaneous: 6, interval: 580, enemyModifiers: { speedMultiplier: 1.3, steerMultiplier: 1.1 } }
  ],
  theme: "network"
});

LEVELS.push({
  id: "canopy-divide",
  name: "Canopy Divide",
  playfieldColor: "#02140b",
  platformColor: "rgba(16,185,129,0.16)",
  playerSpawns: [{ x: 200, y: 380 }, { x: 720, y: 380 }],
  enemySpawns: [
    { x: 120, y: 140 },
    { x: 840, y: 140 },
    { x: 480, y: 80 },
    { x: 300, y: 260 },
    { x: 660, y: 260 }
  ],
  platforms: [
    { x: 100, y: 440, width: 240, height: 12 },
    { x: 640, y: 440, width: 240, height: 12 },
    { x: 320, y: 340, width: 200, height: 12 },
    { x: 520, y: 340, width: 200, height: 12 },
    { x: 200, y: 240, width: 160, height: 12 },
    { x: 680, y: 240, width: 160, height: 12 },
    { x: 360, y: 160, width: 240, height: 12 }
  ],
  waves: [
    { count: 10, simultaneous: 4, interval: 840 },
    { count: 12, simultaneous: 5, interval: 720 },
    { count: 14, simultaneous: 5, interval: 640, enemyModifiers: { speedMultiplier: 1.15 } },
    { count: 18, simultaneous: 6, interval: 560, enemyModifiers: { speedMultiplier: 1.25 } }
  ],
  theme: "natural"
});

LEVELS.push({
  id: "void-spire",
  name: "Void Spire",
  playfieldColor: "#01010a",
  platformColor: "rgba(190,24,93,0.18)",
  playerSpawns: [{ x: 160, y: 400 }, { x: 800, y: 400 }],
  enemySpawns: [
    { x: 480, y: 60 },
    { x: 120, y: 60 },
    { x: 840, y: 60 },
    { x: 300, y: 200 },
    { x: 660, y: 200 }
  ],
  platforms: [
    { x: 80, y: 460, width: 220, height: 12 },
    { x: 360, y: 360, width: 220, height: 12 },
    { x: 640, y: 460, width: 220, height: 12 },
    { x: 500, y: 260, width: 220, height: 12 },
    { x: 220, y: 200, width: 160, height: 12 },
    { x: 700, y: 200, width: 160, height: 12 },
    { x: 360, y: 120, width: 240, height: 12 }
  ],
  waves: [
    { count: 12, simultaneous: 4, interval: 780 },
    { count: 14, simultaneous: 5, interval: 660 },
    { count: 18, simultaneous: 6, interval: 580, enemyModifiers: { speedMultiplier: 1.3 } },
    { count: 22, simultaneous: 7, interval: 520, enemyModifiers: { speedMultiplier: 1.4, steerMultiplier: 1.2 } }
  ],
  theme: "space"
});
