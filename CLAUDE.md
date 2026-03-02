# Roblx - Roblox-Inspired Web Game Platform

## Project Overview
A Roblox-inspired web game platform with a homepage for game discovery and a playable 3D Obby (obstacle course) game built with Three.js. The game features colorful smooth-plastic platforms, collectible coins, checkpoints, kill bricks, moving platforms, spinning obstacles, and a timer/score HUD.

## Tech Stack
- **Build tool:** Vite 6.1 (ES modules)
- **3D engine:** Three.js 0.172
- **Language:** Vanilla JavaScript (no framework)
- **Styling:** Plain CSS (modular, imported via `styles/main.css`)

## Commands
- `npm run dev` — Start Vite dev server (port 3000)
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Project Structure
```
index.html          — Homepage entry (game browser UI)
game.html           — Game entry (3D obby game)
src/
  main.js           — Homepage JS entry
  game-main.js      — Game JS entry
  engine/           — Core game engine
    Engine.js         — Three.js scene, renderer, game loop
    PlayerController.js — Movement, camera input, sprint/jump
    InputManager.js   — Keyboard/mouse capture (right-click drag for camera)
    ThirdPersonCamera.js — Camera follow with spherical coords
    CharacterModel.js — Roblox-style blocky character mesh
    Player.js         — Player state (position, velocity, dimensions)
    HUD.js            — Timer, coins, deaths, flash messages, finish overlay
  world/
    ObbyWorld.js      — Level builder: platforms, coins, spinners, moving platforms (largest file)
  physics/
    Physics.js        — Gravity, AABB collision, kill zones, checkpoints, coins, finish detection
    AABB.js           — Axis-Aligned Bounding Box (minX, minY, minZ, maxX, maxY, maxZ)
  homepage/           — Homepage UI components (Sidebar, TopNav, GameCard, etc.)
  utils/
    constants.js      — GRAVITY, COLORS, PLATFORM_TYPES
    dom.js            — DOM element creation helper
    math.js           — Vector/angle utilities
styles/               — Modular CSS (variables, reset, layout, components, game-view, hud)
```

## Architecture Notes

### Two-page Vite app
- `index.html` + `src/main.js` = Homepage (game browser)
- `game.html` + `src/game-main.js` = 3D Game (obby)
- Both entries configured in `vite.config.js` via `rollupOptions.input`

### Game engine flow
`game-main.js` → `Engine.init()` → creates `ObbyWorld`, `Player`, `Physics`, `PlayerController`, `HUD` → runs `requestAnimationFrame` loop

### Camera controls
- Right-click drag to rotate camera (no pointer lock required)
- Scroll wheel to zoom in/out
- Pointer lock is attempted on click but game works without it

### Collision system
- Platform-based AABB collision (not voxel grid)
- Each axis (X, Y, Z) resolved independently in `Physics._resolveAxis()`
- Kill bricks and spinner AABBs checked separately in `_checkKillZones()`

### Critical: AABB constructor order
`new AABB(minX, minY, minZ, maxX, maxY, maxZ)` — this argument order has caused bugs before. Always double-check when creating AABBs.

### ObbyWorld sections (12 total)
Spawn area → Easy jumps → Checkpoint 1 → Gap jumps → Kill bricks → Checkpoint 2 → Moving platforms → Narrow path → Checkpoint 3 → Spinners → Final sprint → Finish

## Code Conventions
- ES module imports throughout (`import`/`export`)
- Three.js materials use `MeshStandardMaterial` with `DoubleSide` for the Roblox smooth-plastic look
- Colors defined as hex constants in `constants.js`
- No TypeScript, no JSDoc — keep it simple
- CSS is component-scoped by file (e.g., `sidebar.css`, `hud.css`)
