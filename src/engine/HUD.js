export class HUD {
  constructor(container, player, obbyWorld, physics) {
    this.container = container;
    this.player = player;
    this.world = obbyWorld;
    this.physics = physics;
    this._flashTimeout = null;
    this._build();
  }

  _build() {
    // Back button (above overlay)
    const backBtn = document.createElement('button');
    backBtn.className = 'hud__back-btn';
    backBtn.innerHTML = '&larr; Back';
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
    document.body.appendChild(backBtn);

    // Timer (top center)
    this.timerEl = document.createElement('div');
    this.timerEl.className = 'hud__timer';
    this.timerEl.textContent = '0:00.0';
    this.container.appendChild(this.timerEl);

    // Stats panel (top right)
    const statsPanel = document.createElement('div');
    statsPanel.className = 'hud__stats';

    this.coinsEl = document.createElement('div');
    this.coinsEl.className = 'hud__stat';
    this.coinsEl.innerHTML = '<span class="hud__stat-icon coin-icon"></span> <span class="hud__stat-value">0 / 0</span>';
    statsPanel.appendChild(this.coinsEl);

    this.deathsEl = document.createElement('div');
    this.deathsEl.className = 'hud__stat';
    this.deathsEl.innerHTML = '<span class="hud__stat-icon death-icon"></span> <span class="hud__stat-value">0</span>';
    statsPanel.appendChild(this.deathsEl);

    this.container.appendChild(statsPanel);

    // Flash message (center, for checkpoint/death/finish)
    this.flashEl = document.createElement('div');
    this.flashEl.className = 'hud__flash';
    this.container.appendChild(this.flashEl);

    // Finish overlay (hidden by default)
    this.finishEl = document.createElement('div');
    this.finishEl.className = 'hud__finish';
    this.finishEl.innerHTML = `
      <div class="hud__finish-content">
        <h1>OBBY COMPLETE!</h1>
        <div class="hud__finish-stats">
          <div class="hud__finish-time"></div>
          <div class="hud__finish-coins"></div>
          <div class="hud__finish-deaths"></div>
        </div>
        <button class="hud__finish-btn" onclick="window.location.reload()">Play Again</button>
      </div>
    `;
    this.finishEl.style.display = 'none';
    this.container.appendChild(this.finishEl);
  }

  _formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs.toFixed(1)}`;
  }

  update(gameTime) {
    // Timer
    this.timerEl.textContent = this._formatTime(gameTime);

    // Coins
    const collected = this.world.coins.filter(c => c.collected).length;
    this.coinsEl.querySelector('.hud__stat-value').textContent =
      `${collected} / ${this.world.totalCoins}`;

    // Deaths
    this.deathsEl.querySelector('.hud__stat-value').textContent =
      this.physics.deaths.toString();
  }

  showDeath(deaths) {
    this._showFlash('You died!', '#e74c3c');
  }

  showCheckpoint(index) {
    this._showFlash(`Checkpoint ${index}!`, '#00ff88');
  }

  showFinish() {
    const collected = this.world.coins.filter(c => c.collected).length;
    this.finishEl.style.display = 'flex';
    this.finishEl.querySelector('.hud__finish-time').textContent =
      `Time: ${this.timerEl.textContent}`;
    this.finishEl.querySelector('.hud__finish-coins').textContent =
      `Coins: ${collected} / ${this.world.totalCoins}`;
    this.finishEl.querySelector('.hud__finish-deaths').textContent =
      `Deaths: ${this.physics.deaths}`;
  }

  _showFlash(text, color) {
    this.flashEl.textContent = text;
    this.flashEl.style.color = color;
    this.flashEl.classList.add('visible');
    if (this._flashTimeout) clearTimeout(this._flashTimeout);
    this._flashTimeout = setTimeout(() => {
      this.flashEl.classList.remove('visible');
    }, 1500);
  }
}
