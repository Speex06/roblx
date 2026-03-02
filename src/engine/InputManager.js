export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Map();
    this.keysPressed = new Set();
    this.keysReleased = new Set();
    this.mouseDelta = { x: 0, y: 0 };
    this.mouseButtons = new Set();
    this.mouseButtonsPressed = new Set();
    this.pointerLocked = false;
    this.scrollDelta = 0;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
    document.addEventListener('wheel', this._onWheel, { passive: false });
    document.addEventListener('contextmenu', this._onContextMenu);
  }

  _onKeyDown(e) {
    // Don't prevent default for Escape, F-keys, etc.
    const gameKeys = ['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyX','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Equal','Minus','NumpadAdd','NumpadSubtract'];
    if (!this.keys.get(e.code)) {
      this.keysPressed.add(e.code);
    }
    this.keys.set(e.code, true);
    if (gameKeys.includes(e.code)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this.keys.set(e.code, false);
    this.keysReleased.add(e.code);
  }

  _onMouseMove(e) {
    // Track mouse delta when pointer locked OR right mouse button held
    if (this.pointerLocked || this.mouseButtons.has(2)) {
      this.mouseDelta.x += e.movementX;
      this.mouseDelta.y += e.movementY;
    }
  }

  _onMouseDown(e) {
    this.mouseButtons.add(e.button);
    this.mouseButtonsPressed.add(e.button);
  }

  _onMouseUp(e) {
    this.mouseButtons.delete(e.button);
  }

  _onPointerLockChange() {
    this.pointerLocked = document.pointerLockElement === this.canvas;
  }

  _onWheel(e) {
    e.preventDefault();
    this.scrollDelta += Math.sign(e.deltaY);
  }

  _onContextMenu(e) {
    e.preventDefault();
  }

  requestPointerLock() {
    this.canvas.requestPointerLock();
  }

  isKeyDown(code) {
    return this.keys.get(code) || false;
  }

  isKeyPressed(code) {
    return this.keysPressed.has(code);
  }

  isMouseButtonDown(button) {
    return this.mouseButtons.has(button);
  }

  isMouseButtonPressed(button) {
    return this.mouseButtonsPressed.has(button);
  }

  getMouseDelta() {
    return { x: this.mouseDelta.x, y: this.mouseDelta.y };
  }

  getScrollDelta() {
    return this.scrollDelta;
  }

  update() {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouseButtonsPressed.clear();
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.scrollDelta = 0;
  }
}
