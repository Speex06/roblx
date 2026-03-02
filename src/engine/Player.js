import * as THREE from 'three';

export class Player {
  constructor() {
    this.position = new THREE.Vector3(0, 30, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.onGround = false;
    this.width = 0.6;
    this.height = 1.8;
    this.eyeHeight = 1.6;
    this.walkSpeed = 5.5;
    this.sprintSpeed = 9;
    this.speed = this.walkSpeed;
    this.jumpSpeed = 7.5;
    this.isSprinting = false;
    this.jumpsLeft = 2;
    this.maxJumps = 2;
  }
}
