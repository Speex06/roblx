import { GRAVITY, PLATFORM_TYPES } from '../utils/constants.js';
import { AABB } from './AABB.js';

export class Physics {
  constructor(player, obbyWorld) {
    this.player = player;
    this.world = obbyWorld;
    this.currentCheckpoint = 0;
    this.deaths = 0;
    this.onDeath = null; // callback
    this.onCheckpoint = null; // callback
    this.onFinish = null; // callback
    this.finished = false;
  }

  update(dt) {
    if (this.finished) return;

    const player = this.player;

    // Apply gravity
    player.velocity.y += GRAVITY * dt;

    // Resolve each axis independently
    player.onGround = false;

    const platforms = this.world.platforms;

    // X axis
    player.position.x += this._resolveAxis('x', player.velocity.x * dt, platforms);
    // Y axis
    player.position.y += this._resolveAxis('y', player.velocity.y * dt, platforms);
    // Z axis
    player.position.z += this._resolveAxis('z', player.velocity.z * dt, platforms);

    // Check kill bricks and spinners
    this._checkKillZones();

    // Check checkpoints
    this._checkCheckpoints();

    // Check coin collection
    this._checkCoins();

    // Check finish
    this._checkFinish();

    // Void death
    if (player.position.y < -30) {
      this._die();
    }
  }

  _resolveAxis(axis, displacement, platforms) {
    if (displacement === 0) return 0;

    const player = this.player;
    const hw = player.width / 2;

    // Create AABB at proposed position
    let aabb;
    if (axis === 'x') {
      aabb = new AABB(
        player.position.x + displacement - hw,
        player.position.y,
        player.position.z - hw,
        player.position.x + displacement + hw,
        player.position.y + player.height,
        player.position.z + hw
      );
    } else if (axis === 'y') {
      aabb = new AABB(
        player.position.x - hw,
        player.position.y + displacement,
        player.position.z - hw,
        player.position.x + hw,
        player.position.y + displacement + player.height,
        player.position.z + hw
      );
    } else {
      aabb = new AABB(
        player.position.x - hw,
        player.position.y,
        player.position.z + displacement - hw,
        player.position.x + hw,
        player.position.y + player.height,
        player.position.z + displacement + hw
      );
    }

    let resolved = displacement;

    for (const plat of platforms) {
      // Only collide with solid-type platforms (not kill bricks)
      if (plat.type === PLATFORM_TYPES.KILL) continue;

      if (!aabb.intersects(plat.aabb)) continue;

      if (axis === 'x') {
        if (displacement > 0) {
          resolved = Math.min(resolved, plat.aabb.minX - (player.position.x + hw));
        } else {
          resolved = Math.max(resolved, plat.aabb.maxX - (player.position.x - hw));
        }
        player.velocity.x = 0;
      } else if (axis === 'y') {
        if (displacement > 0) {
          resolved = Math.min(resolved, plat.aabb.minY - (player.position.y + player.height));
        } else {
          resolved = Math.max(resolved, plat.aabb.maxY - player.position.y);
          player.onGround = true;
        }
        player.velocity.y = 0;
      } else {
        if (displacement > 0) {
          resolved = Math.min(resolved, plat.aabb.minZ - (player.position.z + hw));
        } else {
          resolved = Math.max(resolved, plat.aabb.maxZ - (player.position.z - hw));
        }
        player.velocity.z = 0;
      }
    }

    if (Math.abs(resolved) < 0.001) resolved = 0;
    return resolved;
  }

  _checkKillZones() {
    const playerAABB = AABB.fromPlayer(this.player);

    // Kill platforms
    for (const plat of this.world.platforms) {
      if (plat.type !== PLATFORM_TYPES.KILL) continue;
      if (playerAABB.intersects(plat.aabb)) {
        this._die();
        return;
      }
    }

    // Spinners
    for (const spinner of this.world.spinners) {
      const spinnerAABB = spinner.getAABB();
      if (playerAABB.intersects(spinnerAABB)) {
        this._die();
        return;
      }
    }
  }

  _checkCheckpoints() {
    const playerAABB = AABB.fromPlayer(this.player);

    for (const plat of this.world.platforms) {
      if (plat.type !== PLATFORM_TYPES.CHECKPOINT) continue;
      if (!playerAABB.intersects(plat.aabb)) continue;

      // Find which checkpoint this is
      const checkpoints = this.world.checkpoints;
      for (let i = this.currentCheckpoint + 1; i < checkpoints.length; i++) {
        const cp = checkpoints[i];
        const platPos = plat.mesh.position;
        if (Math.abs(cp.x - platPos.x) < 4 && Math.abs(cp.z - platPos.z) < 4) {
          this.currentCheckpoint = i;
          if (this.onCheckpoint) this.onCheckpoint(i);
          break;
        }
      }
    }
  }

  _checkCoins() {
    const player = this.player;

    for (let i = 0; i < this.world.coins.length; i++) {
      const coin = this.world.coins[i];
      if (coin.collected) continue;

      const dx = player.position.x - coin.mesh.position.x;
      const dy = (player.position.y + player.height / 2) - coin.mesh.position.y;
      const dz = player.position.z - coin.mesh.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 1.5) {
        this.world.collectCoin(i);
      }
    }
  }

  _checkFinish() {
    const playerAABB = AABB.fromPlayer(this.player);

    for (const plat of this.world.platforms) {
      if (plat.type !== PLATFORM_TYPES.FINISH) continue;
      if (playerAABB.intersects(plat.aabb)) {
        this.finished = true;
        if (this.onFinish) this.onFinish();
        return;
      }
    }
  }

  _die() {
    this.deaths++;
    const cp = this.world.getCheckpoint(this.currentCheckpoint);
    this.player.position.copy(cp);
    this.player.velocity.set(0, 0, 0);
    this.player.onGround = false;
    if (this.onDeath) this.onDeath(this.deaths);
  }
}
