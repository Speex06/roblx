import { el, svg, formatNumber } from '../utils/dom.js';
import { generateThumbnail } from './gameData.js';

export class GameCard {
  constructor(world) {
    this.world = world;
  }

  render() {
    const card = el('div', 'game-card');
    card.dataset.worldId = this.world.id;

    // Thumbnail
    const thumbnail = el('div', 'game-card__thumbnail', {
      children: [
        generateThumbnail(this.world),
        el('div', 'game-card__overlay', {
          children: [
            el('button', 'game-card__play-btn', {
              html: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
            }),
          ],
        }),
      ],
    });
    card.appendChild(thumbnail);

    // Info
    const info = el('div', 'game-card__info', {
      children: [
        el('h3', 'game-card__title', { text: this.world.title }),
        el('div', 'game-card__meta', {
          children: [
            el('span', 'game-card__players', {
              children: [
                el('span', 'green-dot'),
                document.createTextNode(' ' + formatNumber(this.world.players) + ' playing'),
              ],
            }),
            el('span', null, { text: this.world.rating + '%' }),
          ],
        }),
      ],
    });
    card.appendChild(info);

    return card;
  }
}
