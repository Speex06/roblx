import { el } from '../utils/dom.js';
import { Sidebar } from './Sidebar.js';
import { TopNav } from './TopNav.js';
import { FeaturedBanner } from './FeaturedBanner.js';
import { CategorySection } from './CategorySection.js';
import { CATEGORIES, getWorldsForCategory, getWorld } from './gameData.js';

export class Homepage {
  constructor(root) {
    this.root = root;
  }

  mount() {
    // Sidebar
    const sidebar = new Sidebar();
    this.root.appendChild(sidebar.render());

    // Top navigation
    const topnav = new TopNav();
    this.root.appendChild(topnav.render());

    // Main content area
    const content = el('main', 'content');

    // Featured banner — the main game
    const featured = new FeaturedBanner(getWorld('island'));
    content.appendChild(featured.render());

    // Category sections
    for (const category of CATEGORIES) {
      const worlds = getWorldsForCategory(category);
      const section = new CategorySection(category.title, worlds);
      content.appendChild(section.render());
    }

    this.root.appendChild(content);

    // ALL play buttons go to the same game
    this.root.addEventListener('click', (e) => {
      const playBtn = e.target.closest('.game-card__play-btn') ||
                      e.target.closest('.featured-banner__play-btn');
      if (playBtn) {
        window.location.href = 'game.html';
      }

      // Also allow clicking the whole game card
      const card = e.target.closest('.game-card');
      if (card && !playBtn) {
        window.location.href = 'game.html';
      }
    });
  }
}
