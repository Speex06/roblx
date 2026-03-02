import * as THREE from 'three';
import { PLATFORM_TYPES, COLORS } from '../utils/constants.js';
import { AABB } from '../physics/AABB.js';

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.4,
    metalness: opts.metalness ?? 0,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: THREE.DoubleSide,
  });
}

export class ObbyWorld {
  constructor(scene) {
    this.scene = scene;
    this.platforms = [];
    this.coins = [];
    this.decorations = [];
    this.movingPlatforms = [];
    this.spinners = [];
    this.spawnPoint = new THREE.Vector3(0, 2, 0);
    this.checkpoints = [new THREE.Vector3(0, 2, 0)];
    this.totalCoins = 0;

    this._build();
  }

  _addPlatform(x, y, z, w, h, d, color, type = PLATFORM_TYPES.SOLID) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const material = mat(color, type === PLATFORM_TYPES.KILL ? {
      emissive: 0xff0000, emissiveIntensity: 0.3,
    } : type === PLATFORM_TYPES.CHECKPOINT ? {
      emissive: 0x00ff88, emissiveIntensity: 0.5,
    } : type === PLATFORM_TYPES.FINISH ? {
      emissive: 0xffd700, emissiveIntensity: 0.6,
    } : {});

    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const aabb = new AABB(
      x - w / 2, y - h / 2, z - d / 2,
      x + w / 2, y + h / 2, z + d / 2
    );

    const platform = { mesh, aabb, type, basePos: new THREE.Vector3(x, y, z) };
    this.platforms.push(platform);
    return platform;
  }

  _addMovingPlatform(x, y, z, w, h, d, color, axis, range, speed) {
    const plat = this._addPlatform(x, y, z, w, h, d, color, PLATFORM_TYPES.MOVING);
    plat.axis = axis;
    plat.range = range;
    plat.speed = speed;
    plat.time = Math.random() * Math.PI * 2;
    this.movingPlatforms.push(plat);
    return plat;
  }

  _addCoin(x, y, z) {
    const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
    const material = mat(COLORS.GOLD, { emissive: 0xffd700, emissiveIntensity: 0.4, metalness: 0.3 });
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    this.scene.add(mesh);

    const coin = { mesh, collected: false, baseY: y };
    this.coins.push(coin);
    this.totalCoins++;
    return coin;
  }

  _addSpinner(x, y, z, length, height, speed) {
    const geo = new THREE.BoxGeometry(length, height, 1.2);
    const material = mat(COLORS.RED, { emissive: 0xff0000, emissiveIntensity: 0.2 });
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    // Spinner has a kill AABB that updates each frame
    const spinner = {
      mesh,
      speed,
      time: 0,
      getAABB: () => {
        const pos = mesh.position;
        const hw = length / 2;
        const hh = height / 2;
        // Approximate rotated box with a larger AABB
        const r = hw * 0.85;
        return new AABB(pos.x - r, pos.y - hh, pos.z - r, pos.x + r, pos.y + hh, pos.z + r);
      }
    };
    this.spinners.push(spinner);
    return spinner;
  }

  _addSign(x, y, z, text, color = COLORS.WHITE) {
    // Post
    const postGeo = new THREE.BoxGeometry(0.3, 2, 0.3);
    const postMat = mat(COLORS.DARK_GRAY);
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(x, y + 1, z);
    post.castShadow = true;
    this.scene.add(post);

    // Sign board
    const boardGeo = new THREE.BoxGeometry(3, 1.2, 0.15);
    const boardMat = mat(color, { roughness: 0.6 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(x, y + 2.2, z);
    board.castShadow = true;
    this.scene.add(board);

    // Text using canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, 256, 96);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const textGeo = new THREE.PlaneGeometry(2.8, 1.0);
    const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(x, y + 2.2, z + 0.1);
    this.scene.add(textMesh);

    // Back side
    const textMeshBack = textMesh.clone();
    textMeshBack.position.set(x, y + 2.2, z - 0.1);
    textMeshBack.rotation.y = Math.PI;
    this.scene.add(textMeshBack);
  }

  _addWall(x, y, z, w, h, d, color) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.decorations.push(mesh);
  }

  _build() {
    let zPos = 0; // Track z position as we build forward

    // ═══════════════════════════════════════
    // SECTION 1: Spawn Area
    // ═══════════════════════════════════════
    this._addPlatform(0, 0, 0, 12, 1, 12, COLORS.BASEPLATE);
    this._addSign(0, 1, -5, 'OBBY START', COLORS.GREEN);
    this.spawnPoint.set(0, 2, 0);
    this.checkpoints[0] = this.spawnPoint.clone();

    // Side rails on spawn
    this._addWall(-6, 1.5, 0, 0.5, 2, 12, COLORS.DARK_GRAY);
    this._addWall(6, 1.5, 0, 0.5, 2, 12, COLORS.DARK_GRAY);

    this._addCoin(0, 2, 2);
    this._addCoin(-2, 2, 2);
    this._addCoin(2, 2, 2);

    zPos = 10;

    // ═══════════════════════════════════════
    // SECTION 2: Easy Jumps
    // ═══════════════════════════════════════
    const easyColors = [COLORS.BLUE, COLORS.CYAN, COLORS.PURPLE, COLORS.BLUE, COLORS.CYAN];
    for (let i = 0; i < 5; i++) {
      const xOff = (i % 2 === 0) ? -1 : 1;
      this._addPlatform(xOff, 0.5 + i * 0.3, zPos + i * 4, 3, 1, 3, easyColors[i]);
      this._addCoin(xOff, 2.5 + i * 0.3, zPos + i * 4);
    }
    zPos += 24;

    // ═══════════════════════════════════════
    // SECTION 3: Checkpoint 1
    // ═══════════════════════════════════════
    this._addPlatform(0, 2, zPos, 6, 1, 6, COLORS.NEON_GREEN, PLATFORM_TYPES.CHECKPOINT);
    this.checkpoints.push(new THREE.Vector3(0, 4, zPos));
    this._addSign(0, 3, zPos - 2, 'CHECKPOINT 1', COLORS.NEON_GREEN);
    zPos += 10;

    // ═══════════════════════════════════════
    // SECTION 4: Gap Jumps (narrower, bigger gaps)
    // ═══════════════════════════════════════
    const gapColors = [COLORS.ORANGE, COLORS.YELLOW, COLORS.ORANGE, COLORS.YELLOW, COLORS.ORANGE, COLORS.YELLOW];
    for (let i = 0; i < 6; i++) {
      const xOff = Math.sin(i * 1.2) * 2;
      const yOff = 2 + Math.sin(i * 0.8) * 1.5;
      this._addPlatform(xOff, yOff, zPos + i * 5, 2, 0.8, 2, gapColors[i]);
      if (i % 2 === 0) this._addCoin(xOff, yOff + 2, zPos + i * 5);
    }
    zPos += 34;

    // ═══════════════════════════════════════
    // SECTION 5: Kill Brick Section
    // ═══════════════════════════════════════
    // Safe platforms with kill bricks between them
    for (let i = 0; i < 4; i++) {
      // Safe platform
      this._addPlatform(0, 2, zPos + i * 6, 2.5, 0.8, 2.5, COLORS.LIME);
      this._addCoin(0, 4, zPos + i * 6);

      // Kill bricks on sides and between
      if (i < 3) {
        this._addPlatform(-2.5, 2, zPos + i * 6 + 3, 2, 0.5, 2, COLORS.NEON_RED, PLATFORM_TYPES.KILL);
        this._addPlatform(2.5, 2, zPos + i * 6 + 3, 2, 0.5, 2, COLORS.NEON_RED, PLATFORM_TYPES.KILL);
        // Narrow safe path between kills
        this._addPlatform(0, 2, zPos + i * 6 + 3, 1.5, 0.8, 1.5, COLORS.WHITE);
      }
    }
    zPos += 28;

    // ═══════════════════════════════════════
    // SECTION 6: Checkpoint 2
    // ═══════════════════════════════════════
    this._addPlatform(0, 2, zPos, 6, 1, 6, COLORS.NEON_GREEN, PLATFORM_TYPES.CHECKPOINT);
    this.checkpoints.push(new THREE.Vector3(0, 4, zPos));
    this._addSign(0, 3, zPos - 2, 'CHECKPOINT 2', COLORS.NEON_GREEN);
    zPos += 10;

    // ═══════════════════════════════════════
    // SECTION 7: Moving Platforms
    // ═══════════════════════════════════════
    for (let i = 0; i < 4; i++) {
      const axis = i % 2 === 0 ? 'x' : 'y';
      const range = axis === 'x' ? 3 : 1.5;
      const speed = 1.5 + i * 0.3;
      this._addMovingPlatform(0, 3 + i * 0.5, zPos + i * 6, 3, 0.8, 3, COLORS.CYAN, axis, range, speed);
      this._addCoin(0, 5 + i * 0.5, zPos + i * 6);
    }
    zPos += 30;

    // ═══════════════════════════════════════
    // SECTION 8: Narrow Path
    // ═══════════════════════════════════════
    for (let i = 0; i < 8; i++) {
      const xOff = Math.sin(i * 0.7) * 3;
      this._addPlatform(xOff, 4, zPos + i * 3, 1.2, 0.6, 1.2, COLORS.PURPLE);
      if (i % 3 === 0) this._addCoin(xOff, 6, zPos + i * 3);
    }
    zPos += 28;

    // ═══════════════════════════════════════
    // SECTION 9: Checkpoint 3
    // ═══════════════════════════════════════
    this._addPlatform(0, 4, zPos, 6, 1, 6, COLORS.NEON_GREEN, PLATFORM_TYPES.CHECKPOINT);
    this.checkpoints.push(new THREE.Vector3(0, 6, zPos));
    this._addSign(0, 5, zPos - 2, 'CHECKPOINT 3', COLORS.NEON_GREEN);
    zPos += 10;

    // ═══════════════════════════════════════
    // SECTION 10: Spinner Obstacles
    // ═══════════════════════════════════════
    // Wide platforms with spinning kill bars
    for (let i = 0; i < 3; i++) {
      this._addPlatform(0, 4, zPos + i * 10, 6, 1, 6, COLORS.BLUE);
      this._addSpinner(0, 5.8, zPos + i * 10, 5, 0.8, 1.5 + i * 0.5);
      this._addCoin(-2, 6, zPos + i * 10);
      this._addCoin(2, 6, zPos + i * 10);
    }
    zPos += 34;

    // ═══════════════════════════════════════
    // SECTION 11: Final Sprint
    // ═══════════════════════════════════════
    const finalColors = [COLORS.PINK, COLORS.ORANGE, COLORS.YELLOW, COLORS.CYAN, COLORS.PURPLE, COLORS.LIME, COLORS.BLUE, COLORS.PINK];
    for (let i = 0; i < 8; i++) {
      const xOff = Math.sin(i * 1.5) * 2.5;
      const yOff = 5 + Math.sin(i * 0.5) * 2;
      this._addPlatform(xOff, yOff, zPos + i * 4, 1.8, 0.6, 1.8, finalColors[i]);
      if (i % 2 === 0) this._addCoin(xOff, yOff + 2, zPos + i * 4);
    }
    zPos += 36;

    // ═══════════════════════════════════════
    // SECTION 12: Finish Platform
    // ═══════════════════════════════════════
    this._addPlatform(0, 5, zPos, 8, 1, 8, COLORS.GOLD, PLATFORM_TYPES.FINISH);
    this._addSign(0, 6, zPos - 3, 'FINISH!', COLORS.GOLD);
    // Trophy decoration
    const trophyBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 0.4, 16),
      mat(COLORS.GOLD, { metalness: 0.5, emissive: 0xffd700, emissiveIntensity: 0.3 })
    );
    trophyBase.position.set(0, 6.2, zPos);
    trophyBase.castShadow = true;
    this.scene.add(trophyBase);

    const trophyCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.3, 1.0, 16),
      mat(COLORS.GOLD, { metalness: 0.5, emissive: 0xffd700, emissiveIntensity: 0.3 })
    );
    trophyCup.position.set(0, 7.0, zPos);
    trophyCup.castShadow = true;
    this.scene.add(trophyCup);
    this.decorations.push(trophyBase, trophyCup);

    // ═══════════════════════════════════════
    // Ambient decorations
    // ═══════════════════════════════════════
    this._addWorldDecorations();
  }

  _addWorldDecorations() {
    // Ground plane far below (so you see something when falling)
    const groundGeo = new THREE.PlaneGeometry(200, 400);
    const groundMat = mat(0x2a5a3a, { roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -20, 100);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Floating clouds (decorative)
    for (let i = 0; i < 12; i++) {
      const cloudGeo = new THREE.SphereGeometry(2 + Math.random() * 3, 8, 6);
      const cloudMat = mat(0xffffff, { roughness: 0.9, transparent: true, opacity: 0.7 });
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(
        (Math.random() - 0.5) * 80,
        15 + Math.random() * 15,
        Math.random() * 250
      );
      cloud.scale.set(1.5, 0.6, 1);
      this.scene.add(cloud);
      this.decorations.push(cloud);
    }
  }

  update(dt) {
    const time = performance.now() * 0.001;

    // Animate moving platforms
    for (const plat of this.movingPlatforms) {
      plat.time += dt * plat.speed;
      const offset = Math.sin(plat.time) * plat.range;

      if (plat.axis === 'x') {
        plat.mesh.position.x = plat.basePos.x + offset;
      } else if (plat.axis === 'y') {
        plat.mesh.position.y = plat.basePos.y + offset;
      } else {
        plat.mesh.position.z = plat.basePos.z + offset;
      }

      // Update AABB
      const p = plat.mesh.position;
      const geo = plat.mesh.geometry.parameters;
      plat.aabb.minX = p.x - geo.width / 2;
      plat.aabb.maxX = p.x + geo.width / 2;
      plat.aabb.minY = p.y - geo.height / 2;
      plat.aabb.maxY = p.y + geo.height / 2;
      plat.aabb.minZ = p.z - geo.depth / 2;
      plat.aabb.maxZ = p.z + geo.depth / 2;
    }

    // Animate spinners
    for (const spinner of this.spinners) {
      spinner.time += dt * spinner.speed;
      spinner.mesh.rotation.y = spinner.time;
    }

    // Animate coins (spin + bob)
    for (const coin of this.coins) {
      if (coin.collected) continue;
      coin.mesh.rotation.z = time * 2;
      coin.mesh.position.y = coin.baseY + Math.sin(time * 3 + coin.baseY) * 0.15;
    }
  }

  collectCoin(index) {
    const coin = this.coins[index];
    if (!coin || coin.collected) return false;
    coin.collected = true;
    this.scene.remove(coin.mesh);
    coin.mesh.geometry.dispose();
    coin.mesh.material.dispose();
    return true;
  }

  getSpawnPoint() {
    return this.spawnPoint.clone();
  }

  getCheckpoint(index) {
    return this.checkpoints[Math.min(index, this.checkpoints.length - 1)].clone();
  }
}
