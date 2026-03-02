import { Engine } from './engine/Engine.js';

const canvas = document.getElementById('game-canvas');
const loadingScreen = document.getElementById('loading-screen');
const loadingFill = loadingScreen.querySelector('.loading-bar__fill');

document.title = 'Roblx - Obby';

// Show loading progress
function setProgress(pct) {
  loadingFill.style.width = pct + '%';
}

setProgress(10);

// Small delay to let the loading screen render
requestAnimationFrame(() => {
  setProgress(30);

  const engine = new Engine(canvas);

  setProgress(60);

  engine.start(() => {
    setProgress(100);
    setTimeout(() => {
      loadingScreen.classList.add('done');
      setTimeout(() => loadingScreen.remove(), 600);
    }, 300);
  });
});
