import { LEVELS } from "../levels/levelData.js";

export class LevelSelect {
  constructor(containerId, game) {
    this.container = document.getElementById(containerId);
    this.levelsContainer = document.getElementById("levelsContainer");
    this.startBtn = document.getElementById("startLevel");
    this.closeBtn = document.getElementById("closeLevel");
    this.game = game;
    this.selected = 0;
    this.unlocked = new Set(Array.from({ length: LEVELS.length }, (_, idx) => idx));
    this._render();
    this._bind();
  }

  _bind() {
    this.levelsContainer.addEventListener("click", (e) => {
      const card = e.target.closest(".level-card");
      if (!card) return;
      const idx = Number(card.dataset.index);
      if (!this.unlocked.has(idx)) return;
      this.select(idx);
    });

    this.startBtn.addEventListener("click", () => {
      if (!this.unlocked.has(this.selected)) return;
      this.hide();
      this.game.startLevel(this.selected);
    });

    this.closeBtn.addEventListener("click", () => this.hide());
  }

  _render() {
    this.levelsContainer.innerHTML = "";
    LEVELS.forEach((level, idx) => {
      const div = document.createElement("div");
      div.className = `level-card ${this.unlocked.has(idx) ? "" : "locked"}`;
      div.dataset.index = idx;
      div.innerHTML = `<strong>${level.name}</strong><div style='font-size:0.8rem;margin-top:6px;color:rgba(255,255,255,0.65)'>${level.waves.length} waves</div>`;
      this.levelsContainer.appendChild(div);
    });
    this.select(this.selected);
  }

  select(idx) {
    const prev = this.levelsContainer.querySelector('.level-card.selected');
    if (prev) prev.classList.remove('selected');
    const next = this.levelsContainer.querySelector(`.level-card[data-index="${idx}"]`);
    if (next) next.classList.add('selected');
    this.selected = idx;
  }

  show() {
    this.container.classList.remove('hidden');
    this.container.setAttribute('aria-hidden','false');
  }

  hide() {
    this.container.classList.add('hidden');
    this.container.setAttribute('aria-hidden','true');
  }

  unlock(idx) {
    this.unlocked.add(idx);
    this._render();
  }
}
