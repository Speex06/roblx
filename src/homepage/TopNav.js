import { el, svg } from '../utils/dom.js';

export class TopNav {
  render() {
    const topnav = el('header', 'topnav');

    // Search
    const search = el('div', 'topnav__search', {
      children: [
        svg(`<svg class="topnav__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`),
        el('input', 'topnav__search-input', {
          type: 'text',
          placeholder: 'Search experiences',
        }),
      ],
    });
    topnav.appendChild(search);

    // Spacer
    topnav.appendChild(el('div', 'topnav__spacer'));

    // Actions
    const actions = el('div', 'topnav__actions');

    // Robux
    actions.appendChild(el('div', 'topnav__robux', {
      children: [
        svg(`<svg class="topnav__robux-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"/></svg>`),
        el('span', null, { text: '5,000' }),
      ],
    }));

    // Notifications
    actions.appendChild(el('button', 'topnav__btn', {
      html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
    }));

    // Settings
    actions.appendChild(el('button', 'topnav__btn', {
      html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    }));

    // Avatar
    actions.appendChild(el('div', 'topnav__avatar', { text: 'B' }));

    topnav.appendChild(actions);
    return topnav;
  }
}
