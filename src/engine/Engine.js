import * as THREE from 'three';
import { InputManager } from './InputManager.js';
import { Player } from './Player.js';
import { PlayerController } from './PlayerController.js';
import { ThirdPersonCamera } from './ThirdPersonCamera.js';
import { CharacterModel } from './CharacterModel.js';
import { HUD } from './HUD.js';
import { ObbyWorld } from '../world/ObbyWorld.js';
import { Physics } from '../physics/Physics.js';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    // Bright Roblox-style sky
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.003);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Initialize subsystems
    this.inputManager = new InputManager(canvas);
    this.obbyWorld = new ObbyWorld(this.scene);
    this.player = new Player();
    this.characterModel = new CharacterModel(this.scene);
    this.thirdPersonCamera = new ThirdPersonCamera(this.player);
    this.playerController = new PlayerController(this.player, this.inputManager, this.thirdPersonCamera);
    this.physics = new Physics(this.player, this.obbyWorld);
    this.hud = new HUD(document.getElementById('hud'), this.player, this.obbyWorld, this.physics);

    // Wire up physics callbacks
    this.physics.onDeath = (deaths) => this.hud.showDeath(deaths);
    this.physics.onCheckpoint = (index) => this.hud.showCheckpoint(index);
    this.physics.onFinish = () => this.hud.showFinish();

    this._setupLighting();
    this._setupPointerLock();

    // Timer
    this.gameTime = 0;
    this.gameStarted = false;

    window.addEventListener('resize', () => this._onResize());
  }

  _setupLighting() {
    // Bright ambient for Roblox feel
    const ambient = new THREE.AmbientLight(0xc4d8f0, 0.7);
    this.scene.add(ambient);

    // Sun with shadows
    const sun = new THREE.DirectionalLight(0xfff8e8, 1.4);
    sun.position.set(60, 100, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 400;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    sun.shadow.bias = -0.001;
    this.scene.add(sun);

    // Hemisphere for sky/ground blending
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x4a8a4a, 0.4);
    this.scene.add(hemi);

    // Fill light
    const fill = new THREE.DirectionalLight(0xd4e4ff, 0.3);
    fill.position.set(-40, 30, -30);
    this.scene.add(fill);
  }

  _setupPointerLock() {
    const overlay = document.getElementById('pointer-lock-overlay');

    overlay.addEventListener('click', (e) => {
      if (e.target.closest('.hud__back-btn')) return;
      overlay.classList.add('hidden');
      if (!this.gameStarted) {
        this.gameStarted = true;
        this.gameTime = 0;
      }
      try { this.canvas.requestPointerLock(); } catch(err) { /* ok */ }
    });

    this.canvas.addEventListener('click', (e) => {
      if (e.target.closest('.hud__back-btn')) return;
      if (!document.pointerLockElement) {
        try { this.canvas.requestPointerLock(); } catch(err) { /* ok */ }
      }
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.canvas) {
        overlay.classList.add('hidden');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !document.pointerLockElement) {
        overlay.classList.remove('hidden');
      }
    });

    document.addEventListener('pointerlockerror', () => {
      overlay.classList.add('hidden');
    });
  }

  _onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.thirdPersonCamera.onResize();
  }

  start(onReady) {
    const spawn = this.obbyWorld.getSpawnPoint();
    this.player.position.copy(spawn);

    if (onReady) onReady();

    this.renderer.setAnimationLoop(() => this._update());
  }

  _update() {
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.gameStarted && !this.physics.finished) {
      this.gameTime += dt;
    }

    this.playerController.update(dt);
    this.physics.update(dt);
    this.obbyWorld.update(dt);
    this.characterModel.update(this.player);
    this.thirdPersonCamera.update(dt);
    this.hud.update(this.gameTime);

    this.renderer.render(this.scene, this.thirdPersonCamera.camera);
    this.inputManager.update();
  }
}
