import { Game } from "./game.js";
import { LevelSelect } from "./ui/levelSelect.js";

const canvas = document.getElementById("gameCanvas");
const hud = document.getElementById("hud");

const game = new Game(canvas, hud);
window.flatGuardians = game;

const selector = new LevelSelect('levelSelect', game);
game.onMenuRequested = () => selector.show();
// show on load so user can pick
selector.show();

game.start();
