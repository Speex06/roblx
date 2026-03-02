import { el, svg } from '../utils/dom.js';

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>`,
    active: true,
  },
  {
    id: 'discover',
    label: 'Discover',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  },
  {
    id: 'avatar',
    label: 'Avatar Shop',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"/><path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/></svg>`,
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
  },
  'divider',
  {
    id: 'friends',
    label: 'Friends',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  },
  {
    id: 'groups',
    label: 'Groups',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
  },
];

export class Sidebar {
  render() {
    const sidebar = el('aside', 'sidebar');

    // Logo
    const logo = el('div', 'sidebar__logo', {
      children: [
        el('div', 'sidebar__logo-icon', { text: 'R' }),
        el('span', null, { text: 'Roblx' }),
      ],
    });
    sidebar.appendChild(logo);

    // Navigation
    const nav = el('nav', 'sidebar__nav');
    for (const item of NAV_ITEMS) {
      if (item === 'divider') {
        nav.appendChild(el('div', 'sidebar__divider'));
        continue;
      }
      const classes = 'sidebar__item' + (item.active ? ' sidebar__item--active' : '');
      const navItem = el('div', classes, {
        children: [
          svg(item.icon),
          el('span', null, { text: item.label }),
        ],
      });
      nav.appendChild(navItem);
    }
    sidebar.appendChild(nav);

    // Footer with Create button
    const footer = el('div', 'sidebar__footer', {
      children: [
        el('button', 'sidebar__create-btn', {
          children: [
            svg(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 5v14m-7-7h14"/></svg>`),
            el('span', null, { text: 'Create' }),
          ],
        }),
      ],
    });
    sidebar.appendChild(footer);

    return sidebar;
  }
}
