import { el } from '../utils/dom.js';
import { GameCard } from './GameCard.js';

export class GameGrid {
  constructor(worlds) {
    this.worlds = worlds;
  }

  render() {
    const grid = el('div', 'game-grid');
    for (const world of this.worlds) {
      const card = new GameCard(world);
      grid.appendChild(card.render());
    }
    return grid;
  }
}
