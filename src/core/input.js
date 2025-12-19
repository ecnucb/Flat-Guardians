export class InputManager {
  constructor() {
    this.keyStates = new Map();
    this.bindings = [];
    this.justPressed = new Map();
    window.addEventListener("keydown", (event) => this.setKey(event, true));
    window.addEventListener("keyup", (event) => this.setKey(event, false));
  }

  setKey(event, pressed) {
    const code = event.code.toLowerCase();
    if (pressed) {
      if (!this.keyStates.get(code)) {
        this.justPressed.set(code, true);
      }
      event.preventDefault();
    }
    this.keyStates.set(code, pressed);
  }

  register(binding) {
    this.bindings.push(binding);
  }

  isPressed(key) {
    return this.keyStates.get(key.toLowerCase()) ?? false;
  }

  wasPressed(key) {
    return this.justPressed.get(key.toLowerCase()) ?? false;
  }

  nextFrame() {
    this.justPressed.clear();
  }
}
