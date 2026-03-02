import * as THREE from 'three';

export class PlayerController {
  constructor(player, inputManager, camera) {
    this.player = player;
    this.input = inputManager;
    this.camera = camera;
    this._moveDir = new THREE.Vector3();
  }

  update(dt) {
    const forward = this.camera.getForwardXZ();
    const right = this.camera.getRightXZ();

    // Sprint
    const wantsSprint = this.input.isKeyDown('ShiftLeft') || this.input.isKeyDown('ShiftRight');
    const isMoving = this.input.isKeyDown('KeyW') || this.input.isKeyDown('KeyS') ||
                     this.input.isKeyDown('KeyA') || this.input.isKeyDown('KeyD');
    this.player.isSprinting = wantsSprint && isMoving;
    this.player.speed = this.player.isSprinting ? this.player.sprintSpeed : this.player.walkSpeed;

    // Movement direction
    this._moveDir.set(0, 0, 0);
    if (this.input.isKeyDown('KeyW')) this._moveDir.add(forward);
    if (this.input.isKeyDown('KeyS')) this._moveDir.sub(forward);
    if (this.input.isKeyDown('KeyD')) this._moveDir.add(right);
    if (this.input.isKeyDown('KeyA')) this._moveDir.sub(right);

    if (this._moveDir.lengthSq() > 0) {
      this._moveDir.normalize();
      this.player.velocity.x = this._moveDir.x * this.player.speed;
      this.player.velocity.z = this._moveDir.z * this.player.speed;
      this.player.rotation = Math.atan2(this._moveDir.x, this._moveDir.z);
    } else {
      // Decelerate smoothly
      this.player.velocity.x *= 0.8;
      this.player.velocity.z *= 0.8;
      if (Math.abs(this.player.velocity.x) < 0.1) this.player.velocity.x = 0;
      if (Math.abs(this.player.velocity.z) < 0.1) this.player.velocity.z = 0;
    }

    // Reset jumps when on ground
    if (this.player.onGround) {
      this.player.jumpsLeft = this.player.maxJumps;
    }

    // Jump / double jump
    if (this.input.isKeyPressed('Space') && this.player.jumpsLeft > 0) {
      // Second jump is slightly weaker
      const jumpPower = this.player.jumpsLeft === this.player.maxJumps
        ? this.player.jumpSpeed
        : this.player.jumpSpeed * 0.8;
      this.player.velocity.y = jumpPower;
      this.player.onGround = false;
      this.player.jumpsLeft--;
    }

    // Camera input — works with pointer lock OR right-click drag
    if (this.input.pointerLocked || this.input.isMouseButtonDown(2)) {
      const mouseDelta = this.input.getMouseDelta();
      this.camera.handleMouseInput(mouseDelta.x, mouseDelta.y);
    }

    // Camera zoom with scroll wheel or +/- keys
    const scroll = this.input.getScrollDelta();
    if (scroll !== 0) this.camera.handleScroll(scroll * 0.5);
    if (this.input.isKeyDown('Equal') || this.input.isKeyDown('NumpadAdd')) {
      this.camera.handleScroll(-0.1);
    }
    if (this.input.isKeyDown('Minus') || this.input.isKeyDown('NumpadSubtract')) {
      this.camera.handleScroll(0.1);
    }
  }
}
