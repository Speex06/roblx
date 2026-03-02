import { el, formatNumber } from '../utils/dom.js';

export class FeaturedBanner {
  constructor(world) {
    this.world = world;
  }

  render() {
    const banner = el('div', 'featured-banner');
    banner.dataset.worldId = this.world.id;

    // Background with gradient + decorative blocks
    const bg = el('div', 'featured-banner__bg');

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    // Draw gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 300);
    grad.addColorStop(0, this.world.color1);
    grad.addColorStop(1, this.world.color2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 300);
    // Draw decorative blocks
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 30; i++) {
      const x = (i * 73 + this.world.id.charCodeAt(0) * 17) % 800;
      const y = (i * 47 + this.world.id.charCodeAt(1) * 23) % 300;
      const size = 20 + (i % 4) * 15;
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, size, size);
    }
    bg.style.backgroundImage = `url(${canvas.toDataURL()})`;
    bg.style.backgroundSize = 'cover';
    banner.appendChild(bg);

    // Gradient overlay
    banner.appendChild(el('div', 'featured-banner__gradient'));

    // Content
    const content = el('div', 'featured-banner__content', {
      children: [
        el('div', 'featured-banner__tag', { text: 'FEATURED' }),
        el('h1', 'featured-banner__title', { text: this.world.title }),
        el('p', 'featured-banner__desc', { text: this.world.description }),
        el('button', 'featured-banner__play-btn', {
          children: [
            document.createTextNode('Play Now'),
          ],
        }),
        el('div', 'featured-banner__meta', {
          children: [
            el('span', null, { text: formatNumber(this.world.players) + ' playing' }),
            el('span', null, { text: this.world.rating + '% rating' }),
          ],
        }),
      ],
    });
    banner.appendChild(content);

    return banner;
  }
}
