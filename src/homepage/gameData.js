export const GAME_WORLDS = [
  {
    id: 'flat',
    title: 'Flat World',
    description: 'A blank canvas. Build anything you can imagine on an infinite flat plain!',
    players: 1243,
    rating: 94,
    generator: 'flat',
    tags: ['building', 'creative'],
    color1: '#4ade80',
    color2: '#166534',
  },
  {
    id: 'hills',
    title: 'Rolling Hills',
    description: 'Explore procedurally generated terrain with lush rolling green hills and valleys.',
    players: 3891,
    rating: 87,
    generator: 'hills',
    tags: ['exploration', 'nature'],
    color1: '#86efac',
    color2: '#0d9488',
  },
  {
    id: 'city',
    title: 'Block City',
    description: 'A sprawling metropolis made entirely of blocks. Build skyscrapers and explore streets!',
    players: 2156,
    rating: 91,
    generator: 'city',
    tags: ['building', 'urban'],
    color1: '#94a3b8',
    color2: '#475569',
  },
  {
    id: 'island',
    title: 'Island Adventure',
    description: 'A tropical island surrounded by crystal waters. Survive and build your paradise!',
    players: 4502,
    rating: 96,
    generator: 'island',
    tags: ['adventure', 'survival'],
    color1: '#38bdf8',
    color2: '#f59e0b',
  },
  {
    id: 'castle',
    title: 'Castle Grounds',
    description: 'A medieval castle on a hilltop. Defend the realm and expand the fortress!',
    players: 1876,
    rating: 89,
    generator: 'castle',
    tags: ['medieval', 'building'],
    color1: '#a78bfa',
    color2: '#6d28d9',
  },
  {
    id: 'space',
    title: 'Space Station',
    description: 'Build and manage your own space station orbiting a strange alien world.',
    players: 987,
    rating: 85,
    generator: 'space',
    tags: ['sci-fi', 'creative'],
    color1: '#818cf8',
    color2: '#1e1b4b',
  },
];

export const CATEGORIES = [
  {
    id: 'recommended',
    title: 'Recommended For You',
    worldIds: ['hills', 'island', 'flat', 'castle'],
  },
  {
    id: 'popular',
    title: 'Popular Right Now',
    worldIds: ['island', 'hills', 'city', 'castle', 'space', 'flat'],
  },
  {
    id: 'building',
    title: 'Building & Creative',
    worldIds: ['flat', 'city', 'castle', 'space'],
  },
  {
    id: 'adventure',
    title: 'Adventure',
    worldIds: ['island', 'hills', 'castle', 'space'],
  },
];

export function getWorld(id) {
  return GAME_WORLDS.find(w => w.id === id);
}

export function getWorldsForCategory(category) {
  return category.worldIds.map(id => getWorld(id)).filter(Boolean);
}

export function generateThumbnail(world, width = 180, height = 180) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, world.color1);
  grad.addColorStop(1, world.color2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Draw some decorative blocks
  ctx.globalAlpha = 0.15;
  const blockSize = 20;
  for (let i = 0; i < 12; i++) {
    const x = Math.floor((hash(i * 7 + world.id.charCodeAt(0), i * 13) & 0xffff) / 0xffff * (width - blockSize));
    const y = Math.floor((hash(i * 11, i * 3 + world.id.charCodeAt(1)) & 0xffff) / 0xffff * (height - blockSize));
    const size = blockSize + (i % 3) * 10;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, size, size);
  }

  ctx.globalAlpha = 1;
  // Draw title text
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, height - 44, width, 44);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(world.title, 10, height - 18);

  return canvas;
}

function hash(a, b) {
  let h = a * 374761393 + b * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return h ^ (h >> 16);
}
