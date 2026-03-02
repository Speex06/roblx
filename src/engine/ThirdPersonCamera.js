import * as THREE from 'three';
import { clamp, lerp } from '../utils/math.js';

export class ThirdPersonCamera {
  constructor(player) {
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    this.player = player;
    this.distance = 6;
    this.minDistance = 2;
    this.maxDistance = 18;
    this.theta = Math.PI; // Start looking at the player from behind
    this.phi = Math.PI / 4.5;
    this.phiMin = 0.1;
    this.phiMax = Math.PI / 2.2;
    this.sensitivity = 0.002;
    this.smoothing = 0.12;
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this._offset = new THREE.Vector3();
    this._desiredPos = new THREE.Vector3();
  }

  handleMouseInput(dx, dy) {
    this.theta -= dx * this.sensitivity;
    this.phi = clamp(this.phi - dy * this.sensitivity, this.phiMin, this.phiMax);
  }

  handleScroll(delta) {
    this.distance = clamp(this.distance + delta * 0.8, this.minDistance, this.maxDistance);
  }

  update(dt) {
    const target = new THREE.Vector3().copy(this.player.position);
    target.y += this.player.eyeHeight * 0.8;

    this._offset.set(
      this.distance * Math.sin(this.phi) * Math.sin(this.theta),
      this.distance * Math.cos(this.phi),
      this.distance * Math.sin(this.phi) * Math.cos(this.theta)
    );

    this._desiredPos.copy(target).add(this._offset);

    // Smooth camera follow
    const smoothFactor = 1 - Math.pow(1 - this.smoothing, 60 * dt);
    this.currentPosition.lerp(this._desiredPos, smoothFactor);
    this.currentLookAt.lerp(target, smoothFactor * 1.5);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }

  getForwardXZ() {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    return forward;
  }

  getRightXZ() {
    const forward = this.getForwardXZ();
    return new THREE.Vector3(-forward.z, 0, forward.x);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
