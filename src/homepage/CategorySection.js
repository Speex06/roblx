import { el } from '../utils/dom.js';
import { GameGrid } from './GameGrid.js';

export class CategorySection {
  constructor(title, worlds) {
    this.title = title;
    this.worlds = worlds;
  }

  render() {
    const section = el('section', 'category-section');

    const header = el('div', 'category-section__header', {
      children: [
        el('h2', 'category-section__title', { text: this.title }),
        el('a', 'category-section__see-all', { text: 'See All', href: '#' }),
      ],
    });
    section.appendChild(header);

    const grid = new GameGrid(this.worlds);
    section.appendChild(grid.render());

    return section;
  }
}
