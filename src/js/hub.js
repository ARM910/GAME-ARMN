/* GAME ARMN — hub layer: dashboard home, ranking with portraits, avatar picker, X-O chat, shortcuts.
   Runs after index.html's own scripts. It only reads through the small bridges (window.armnApp, window.armnOnlineApi)
   and never touches the online game logic itself. */
(function () {
'use strict';
if (!window.armnApp || !window.armnOnlineApi) { console.warn('hub: bridge missing'); return; }

const D = document, $ = (s, r = D) => r.querySelector(s), $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
const APP = window.armnApp, API = window.armnOnlineApi;
const lang = () => (D.documentElement.lang === 'en' ? 'en' : 'ar');
const T = (a, e) => (lang() === 'en' ? e : a);
const esc = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem('armnhub:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('armnhub:' + k, JSON.stringify(v)); } catch (e) {} }
};
const user = () => { try { return APP.me(); } catch (e) { return null; } };
let uidN = 0;

/* ============================================================
   ICONS — vivid gradient art instead of plain emoji
   ============================================================ */
const UI = {
  home: ['#8be4ff', '#2f8bff', '<path d="M12 3 2.5 11.2c-.4.4-.1 1 .4 1H5v7.3c0 .8.6 1.5 1.5 1.5H10v-5.5h4V21h3.5c.9 0 1.5-.7 1.5-1.5v-7.3h2.1c.5 0 .8-.6.4-1z" fill="url(#§)"/>'],
  trophy: ['#ffe27a', '#ff9d1c', '<path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="url(#§)"/><path d="M7 4.5H4v1A3.5 3.5 0 0 0 7.5 9M17 4.5h3v1A3.5 3.5 0 0 1 16.5 9" fill="none" stroke="url(#§)" stroke-width="1.8" stroke-linecap="round"/><path d="M10.8 13h2.4v3h2.3a1 1 0 0 1 1 1v1.5H7.5V17a1 1 0 0 1 1-1h2.3z" fill="url(#§)"/><rect x="6" y="19" width="12" height="2.2" rx="1.1" fill="url(#§)"/>'],
  users: ['#9ff0ff', '#4a7dff', '<circle cx="9" cy="8" r="3.6" fill="url(#§)"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z" fill="url(#§)"/><circle cx="17" cy="9" r="2.8" fill="url(#§)" opacity=".75"/><path d="M16.5 14.2c3 .2 5 2.2 5 5.8h-4.2c0-2.2-.5-4.2-.8-5.8z" fill="url(#§)" opacity=".75"/>'],
  gamepad: ['#d7a8ff', '#6d5bff', '<path d="M7.5 6h9A5.5 5.5 0 0 1 22 11.5v2.2c0 2-1.3 3.3-3 3.3-1.2 0-2-.6-2.8-1.8l-.5-.7H8.300l-.5.7C7 16.400 6.200 17 5 17c-1.700 0-3-1.300-3-3.300v-2.200A5.500 5.500 0 0 1 7.500 6z" fill="url(#§)"/><path d="M7 9.200v4.200M4.900 11.300h4.200" stroke="#0a1840" stroke-width="1.700" stroke-linecap="round"/><circle cx="16" cy="10.300" r="1.150" fill="#0a1840"/><circle cx="18.600" cy="12.500" r="1.150" fill="#0a1840"/>'],
  bell: ['#9be7ff', '#3d8bff', '<path d="M12 2.500a6 6 0 0 0-6 6v3.600c0 .8-.3 1.500-.8 2.100L3.600 16c-.5.600-.1 1.500.7 1.500h15.400c.8 0 1.200-.9.700-1.500l-1.600-1.800a3.200 3.200 0 0 1-.8-2.100V8.500a6 6 0 0 0-6-6z" fill="url(#§)"/><path d="M9.500 19.500a2.600 2.600 0 0 0 5 0z" fill="url(#§)"/>'],
  gear: ['#b9d4ff', '#5d86e8', '<path d="M10.300 2.500h3.400l.5 2.400 1.700.7 2.100-1.300 2.400 2.400-1.300 2.100.7 1.700 2.400.5v3.400l-2.400.5-.7 1.700 1.300 2.100-2.400 2.400-2.100-1.300-1.700.7-.5 2.400h-3.400l-.5-2.400-1.700-.7-2.100 1.300-2.400-2.400 1.300-2.100-.7-1.700-2.400-.5v-3.400l2.400-.5.7-1.700-1.300-2.100 2.400-2.400 2.100 1.300 1.700-.7z" fill="url(#§)"/><circle cx="12" cy="12" r="3.200" fill="#0a1840"/>'],
  coin: ['#fff08a', '#ffa21a', '<circle cx="12" cy="12" r="9.500" fill="url(#§)"/><circle cx="12" cy="12" r="6.800" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.300"/><path d="M12 7.400l1.500 3.100 3.400.5-2.500 2.400.6 3.400-3-1.600-3 1.600.6-3.400L7.100 11l3.400-.5z" fill="#b86a00" opacity=".85"/>'],
  crown: ['#ffe680', '#ff9a1f', '<path d="M3 8l4.500 4L12 5l4.500 7L21 8l-1.800 11H4.800z" fill="url(#§)"/><rect x="5" y="19.500" width="14" height="2.100" rx="1" fill="url(#§)"/><circle cx="3" cy="8" r="1.400" fill="url(#§)"/><circle cx="21" cy="8" r="1.400" fill="url(#§)"/><circle cx="12" cy="4.600" r="1.500" fill="url(#§)"/>'],
  bag: ['#ffb2e0', '#ff4fa3', '<path d="M5 8h14l1 12.500H4z" fill="url(#§)"/><path d="M8.500 8V6.500a3.500 3.500 0 0 1 7 0V8" fill="none" stroke="url(#§)" stroke-width="1.800" stroke-linecap="round"/><path d="M9 12.500a3 3 0 0 0 6 0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.500" stroke-linecap="round"/>'],
  help: ['#b2c8ff', '#6a7dff', '<circle cx="12" cy="12" r="9.500" fill="url(#§)"/><path d="M9.300 9.700a2.800 2.800 0 1 1 4.300 2.300c-.9.600-1.600 1.100-1.600 2.100M12 16.700v.1" fill="none" stroke="#0a1840" stroke-width="2.100" stroke-linecap="round"/>'],
  logout: ['#ffc2c2', '#ff6a6a', '<path d="M10 3.500H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h4" fill="none" stroke="url(#§)" stroke-width="2" stroke-linecap="round"/><path d="M15 7.500 19.500 12 15 16.500M19 12H9.500" fill="none" stroke="url(#§)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'],
  user: ['#9ff0ff', '#3d8bff', '<circle cx="12" cy="8" r="4.200" fill="url(#§)"/><path d="M4 21c0-4.200 3.600-7 8-7s8 2.800 8 7z" fill="url(#§)"/>'],
  image: ['#8ef0d0', '#2f9dff', '<rect x="2.500" y="4" width="19" height="16" rx="3" fill="url(#§)"/><circle cx="8.500" cy="9.500" r="1.800" fill="#0a1840"/><path d="m3 17 5-5 4 4 3-3 6 5v1.500H3z" fill="#0a1840" opacity=".55"/>'],
  bolt: ['#a6ffb0', '#16d27a', '<path d="M13.500 2 4.500 13.500h6L9.500 22l10-12.500h-6.200z" fill="url(#§)"/>'],
  globe: ['#a9f0ff', '#4a7dff', '<circle cx="12" cy="12" r="9.500" fill="url(#§)"/><path d="M2.500 12h19M12 2.500c3.200 3 3.200 16 0 19M12 2.500c-3.200 3-3.200 16 0 19M4.500 7.500h15M4.500 16.500h15" fill="none" stroke="#0a1840" stroke-opacity=".5" stroke-width="1.200"/>'],
  send: ['#8be4ff', '#2f8bff', '<path d="M21.500 3 3 10.500l6.600 2.700L12 20.500z" fill="url(#§)"/><path d="m9.600 13.200 11-10" stroke="#0a1840" stroke-opacity=".45" stroke-width="1.300" fill="none"/>'],
  chat: ['#9ff0ff', '#3d8bff', '<path d="M4 4.500h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" fill="url(#§)"/><circle cx="8" cy="11" r="1.200" fill="#0a1840"/><circle cx="12" cy="11" r="1.200" fill="#0a1840"/><circle cx="16" cy="11" r="1.200" fill="#0a1840"/>'],
  camera: ['#ffffff', '#b8dcff', '<path d="M8.500 4.500h7l1.500 2H20a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.500a2 2 0 0 1 2-2h3z" fill="url(#§)"/><circle cx="12" cy="13" r="3.600" fill="#0a1840"/><circle cx="12" cy="13" r="1.600" fill="#2f8bff"/>'],
  close: ['#dbe8ff', '#9db4e8', '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="url(#§)" stroke-width="2.400" stroke-linecap="round"/>'],
  check: ['#aaffd0', '#1fdc8a', '<path d="M4.500 12.500 9.500 17.500 19.500 6.500" fill="none" stroke="url(#§)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'],
  plus: ['#aaffd0', '#1fdc8a', '<path d="M12 5v14M5 12h14" fill="none" stroke="url(#§)" stroke-width="2.600" stroke-linecap="round"/>'],
  sound: ['#9be7ff', '#3d8bff', '<path d="M3 9.500v5h3.500L12 19V5L6.500 9.500z" fill="url(#§)"/><path d="M15.500 8.500a5 5 0 0 1 0 7M18 6a8.500 8.500 0 0 1 0 12" fill="none" stroke="url(#§)" stroke-width="1.800" stroke-linecap="round"/>'],
  mute: ['#b4c2e6', '#6d7fae', '<path d="M3 9.500v5h3.500L12 19V5L6.500 9.500z" fill="url(#§)"/><path d="m16 9.500 5 5M21 9.500l-5 5" fill="none" stroke="url(#§)" stroke-width="2" stroke-linecap="round"/>'],
  dice: ['#ffd0f0', '#ff58b4', '<rect x="3" y="3" width="18" height="18" rx="4.500" fill="url(#§)"/><circle cx="8.500" cy="8.500" r="1.600" fill="#0a1840"/><circle cx="15.500" cy="8.500" r="1.600" fill="#0a1840"/><circle cx="12" cy="12" r="1.600" fill="#0a1840"/><circle cx="8.500" cy="15.500" r="1.600" fill="#0a1840"/><circle cx="15.500" cy="15.500" r="1.600" fill="#0a1840"/>'],
  play: ['#aaffd0', '#16d27a', '<path d="M7 4.500v15l13-7.500z" fill="url(#§)"/>'],
  star: ['#fff08a', '#ffa21a', '<path d="m12 2.800 2.800 5.900 6.400.9-4.700 4.500 1.200 6.400L12 17.400l-5.700 3.100 1.200-6.400-4.700-4.500 6.400-.9z" fill="url(#§)"/>'],
  wifi: ['#9bffc9', '#1fdc8a', '<path d="M2.500 9a14 14 0 0 1 19 0M5.500 12.500a9.500 9.500 0 0 1 13 0M8.500 16a5 5 0 0 1 7 0" fill="none" stroke="url(#§)" stroke-width="2.200" stroke-linecap="round"/><circle cx="12" cy="19.300" r="1.600" fill="url(#§)"/>'],
  chev: ['#dbe8ff', '#9db4e8', '<path d="M9 5l7 7-7 7" fill="none" stroke="url(#§)" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/>'],
  expand: ['#dbe8ff', '#9db4e8', '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="url(#§)" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/>'],
  lang: ['#b2f0ff', '#4a7dff', '<circle cx="12" cy="12" r="9.500" fill="none" stroke="url(#§)" stroke-width="1.900"/><path d="M3 12h18M12 3c2.800 2.800 2.800 15.200 0 18M12 3c-2.800 2.800-2.800 15.200 0 18" fill="none" stroke="url(#§)" stroke-width="1.500"/>'],
  key: ['#ffe27a', '#ff9d1c', '<circle cx="8" cy="12" r="4.500" fill="url(#§)"/><circle cx="8" cy="12" r="1.700" fill="#0a1840"/><path d="M12 12h9v3M17 12v3" fill="none" stroke="url(#§)" stroke-width="2.200" stroke-linecap="round"/>'],
  info: ['#b2c8ff', '#6a7dff', '<circle cx="12" cy="12" r="9.500" fill="url(#§)"/><path d="M12 11v5.500M12 7.600v.1" stroke="#0a1840" stroke-width="2.300" stroke-linecap="round"/>']
};
function ic(name, cls) {
  const d = UI[name]; if (!d) return '';
  const id = 'hi' + (++uidN);
  return '<svg class="ic ic-' + name + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + d[0] + '"/><stop offset="1" stop-color="' + d[1] + '"/></linearGradient></defs>' + d[2].replace(/§/g, id) + '</svg>';
}

/* Game cover art (64×64, glowing, one per game) */
const GF = '<filter id="g§" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.500" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
const bgd = (c1, c2) => '<linearGradient id="a§" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient>';
const GA = {
  xo: '<defs>' + bgd('#1b4dff', '#7a22ff') + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><path d="M32 8v48M8 32h48" stroke="#fff" stroke-opacity=".14" stroke-width="2"/><g filter="url(#g§)" stroke-linecap="round" fill="none" stroke-width="6.500"><path d="M13 13l17 17M30 13 13 30" stroke="#46d4ff"/><circle cx="44" cy="44" r="10" stroke="#ff4aa8"/></g>',
  snake: '<defs>' + bgd('#10b36d', '#04402e') + '<linearGradient id="b§" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2ff6e"/><stop offset="1" stop-color="#34d66a"/></linearGradient>' + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><path d="M12 49C22 57 37 53 35 43 33 33 14 35 18 25 22 15 40 17 47 21" fill="none" stroke="url(#b§)" stroke-width="9" stroke-linecap="round" filter="url(#g§)"/><circle cx="48" cy="21" r="6.500" fill="#e9ff8f"/><circle cx="50" cy="18.500" r="1.800" fill="#0a2a1c"/><circle cx="50" cy="23.500" r="1.800" fill="#0a2a1c"/><path d="M54 21h6M58 21l2-2M58 21l2 2" stroke="#ff5a6a" stroke-width="1.600" stroke-linecap="round"/><circle cx="51" cy="48" r="6" fill="#ff4a5e"/><path d="M51 42c0-3 2-4.500 4-4.500" stroke="#7dff9a" stroke-width="2" fill="none" stroke-linecap="round"/>',
  maze: '<defs>' + bgd('#7b4dff', '#2a1480') + '<linearGradient id="b§" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff29a"/><stop offset="1" stop-color="#ffa21a"/></linearGradient>' + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><path d="M10 10h44v44H10zM10 24h24M34 24v16M22 40h32M22 40v-8M44 10v14M54 30H44" fill="none" stroke="#dcd0ff" stroke-width="3.200" stroke-linecap="round" stroke-linejoin="round"/><path d="M47 38l6 7-6 9-6-9z" fill="url(#b§)" filter="url(#g§)"/><circle cx="17" cy="17" r="3.800" fill="#46d4ff" filter="url(#g§)"/>',
  orbit: '<defs>' + bgd('#0b2a8a', '#2a0f6b') + '<radialGradient id="b§" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff5a36"/></radialGradient>' + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><circle cx="12" cy="14" r="1.200" fill="#fff"/><circle cx="52" cy="48" r="1.200" fill="#fff"/><circle cx="46" cy="10" r="1" fill="#fff"/><circle cx="32" cy="34" r="22" fill="none" stroke="#fff" stroke-opacity=".28" stroke-dasharray="2 4" stroke-width="1.600"/><circle cx="32" cy="34" r="12.500" fill="url(#b§)"/><ellipse cx="32" cy="34" rx="19" ry="5.500" transform="rotate(-20 32 34)" fill="none" stroke="#ffe9a8" stroke-width="2.600" opacity=".9"/><circle cx="51" cy="21" r="4.500" fill="#9ee6ff" filter="url(#g§)"/><path d="M12 48l1.200 2.600 2.800.3-2.100 1.900.6 2.800L12 54.200 9.500 55.600l.6-2.800L8 50.900l2.800-.3z" fill="#ffe27a"/>',
  bricks: '<defs>' + bgd('#0b64f0', '#0a1d6b') + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><g><rect x="8" y="10" width="14" height="6" rx="2" fill="#ff5a6a"/><rect x="25" y="10" width="14" height="6" rx="2" fill="#ffb02e"/><rect x="42" y="10" width="14" height="6" rx="2" fill="#7dff9a"/><rect x="8" y="19" width="14" height="6" rx="2" fill="#ffb02e"/><rect x="25" y="19" width="14" height="6" rx="2" fill="#46d4ff"/><rect x="42" y="19" width="14" height="6" rx="2" fill="#ff4aa8"/></g><circle cx="38" cy="40" r="3.600" fill="#fff" filter="url(#g§)"/><rect x="20" y="52" width="24" height="5.500" rx="2.700" fill="#46d4ff" filter="url(#g§)"/>',
  runner: '<defs>' + bgd('#ff8a3d', '#d41f6a') + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><path d="M6 24h14M4 32h12M8 40h12" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/><g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#g§)"><circle cx="40" cy="15" r="5" fill="#fff"/><path d="M37 23l-4 13M34 28l-6 5M35 27l8 4M33 36l9 7-2 10M33 36l-9 6-9 2"/></g>',
  t2048: '<defs>' + bgd('#ffa21a', '#ff4a36') + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><g font-family="system-ui,Arial,sans-serif" font-weight="800" text-anchor="middle"><rect x="7" y="7" width="23" height="23" rx="6" fill="#fff" fill-opacity=".92"/><text x="18.500" y="25" font-size="17" fill="#e8741a">2</text><rect x="34" y="7" width="23" height="23" rx="6" fill="#ffe9a8"/><text x="45.500" y="25" font-size="17" fill="#c25a00">4</text><rect x="7" y="34" width="23" height="23" rx="6" fill="#ffd05a"/><text x="18.500" y="52" font-size="17" fill="#8a4200">8</text><rect x="34" y="34" width="23" height="23" rx="6" fill="#fff"/><text x="45.500" y="50.500" font-size="11" fill="#ff3a24">2048</text></g>',
  memory: '<defs>' + bgd('#ff4fa3', '#6a2bff') + '<linearGradient id="b§" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff29a"/><stop offset="1" stop-color="#ffa21a"/></linearGradient>' + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><g transform="rotate(-10 20 32)"><rect x="8" y="14" width="24" height="34" rx="5" fill="#2a1a7a" stroke="#fff" stroke-width="2"/><path d="M14 22h12M14 28h12M14 34h12" stroke="#ff8ad0" stroke-width="2.200" stroke-linecap="round"/></g><g transform="rotate(9 44 34)"><rect x="32" y="16" width="25" height="35" rx="5" fill="#fff"/><path d="m44.500 25 2.400 5 5.500.8-4 3.900.9 5.500-4.800-2.600-4.800 2.600.9-5.500-4-3.900 5.500-.8z" fill="url(#b§)"/></g>',
  blocks: '<defs>' + bgd('#2f7bff', '#0a2a8c') + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><g filter="url(#g§)"><g fill="#ff4aa8"><rect x="8" y="9" width="11" height="11" rx="2.500"/><rect x="21" y="9" width="11" height="11" rx="2.500"/><rect x="34" y="9" width="11" height="11" rx="2.500"/><rect x="21" y="22" width="11" height="11" rx="2.500"/></g><g fill="#ffb02e"><rect x="8" y="35" width="11" height="11" rx="2.500"/><rect x="8" y="48" width="11" height="11" rx="2.500" opacity="0"/><rect x="21" y="48" width="11" height="9" rx="2.500"/><rect x="8" y="48" width="11" height="9" rx="2.500"/></g><g fill="#46f0d0"><rect x="49" y="12" width="9" height="11" rx="2.500"/><rect x="49" y="25" width="9" height="11" rx="2.500"/><rect x="49" y="38" width="9" height="11" rx="2.500"/></g><rect x="36" y="48" width="11" height="9" rx="2.500" fill="#7dff9a"/></g>',
  flip: '<defs>' + bgd('#7a4dff', '#12b8ff') + GF + '</defs><rect width="64" height="64" rx="16" fill="url(#a§)"/><circle cx="32" cy="32" r="21" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2" stroke-dasharray="3 5"/><g fill="none" stroke="#fff" stroke-width="5.500" stroke-linecap="round" stroke-linejoin="round" filter="url(#g§)"><path d="M20 38V16M12 24l8-8 8 8"/><path d="M44 26v22M36 40l8 8 8-8"/></g><circle cx="32" cy="32" r="5.500" fill="#ffe27a" filter="url(#g§)"/>'
};
function art(id, cls) {
  const a = GA[id] || GA.xo, k = 'ga' + (++uidN);
  return '<svg class="gart ' + (cls || '') + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' + a.replace(/§/g, k) + '</svg>';
}
const GCOL = { xo: '#35c2ff', snake: '#4cf0a0', maze: '#b28cff', orbit: '#ffb347', bricks: '#3dd0ff', runner: '#ff7a5c', t2048: '#ffb02e', memory: '#ff6fb5', blocks: '#5b8cff', flip: '#8a7bff' };
const GNAME = { xo: ['إكس-أو', 'X-O'], snake: ['الدودة', 'Snake'], maze: ['المتاهة', 'Maze'], orbit: ['مدار', 'Orbit'], bricks: ['الطوب', 'Bricks'], runner: ['العداء', 'Runner'], t2048: ['2048', '2048'], memory: ['الذاكرة', 'Memory'], blocks: ['المكعبات', 'Blocks'], flip: ['قلب الجاذبية', 'Gravity Flip'] };
const gName = id => { const n = GNAME[id]; return n ? T(n[0], n[1]) : id; };

/* ============================================================
   Players: levels, avatars
   ============================================================ */
const lvInfo = tot => {
  tot = Math.max(0, tot | 0);
  const l = 1 + Math.floor(Math.sqrt(tot / 25)), a = 25 * (l - 1) * (l - 1), b = 25 * l * l;
  return { lvl: l, cur: tot - a, need: b - a, pct: Math.min(100, Math.round(((tot - a) / (b - a)) * 100)) };
};
const TITLES = [[3000, 'أسطورة', 'Legend'], [1000, 'محترف', 'Pro'], [200, 'لاعب', 'Player'], [0, 'مبتدئ', 'Rookie']];
const titleOf = tot => { const r = TITLES.find(x => tot >= x[0]); return T(r[1], r[2]); };
const autoAv = name => { let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 15; };
const isInt = v => v !== null && v !== undefined && v !== '' && Number.isInteger(+v);
const avHtml = i => window.armnAvatarHtml ? window.armnAvatarHtml(isInt(i) ? +i : 0) : '';
window.armnRankAvatar = (name, av) => avHtml(isInt(av) ? +av : autoAv(name));
const FRAMES = ['none', 'gold', 'cyan', 'pink', 'green'];
const framesAvail = () => { const u = user(); return FRAMES.concat(u && u.own && Array.isArray(u.own.frames) ? u.own.frames : []); };

/* ============================================================
   Sheets (dialogs / bottom sheets)
   ============================================================ */
let sheetEl = null;
function closeSheet() {
  if (!sheetEl) return;
  const el = sheetEl; sheetEl = null; el.classList.remove('on');
  D.documentElement.classList.remove('hb-lock');
  setTimeout(() => el.remove(), 220);
}
function sheet(title, content, cls) {
  closeSheet();
  const el = D.createElement('div'); el.className = 'hb-sheet ' + (cls || '');
  el.innerHTML = '<div class="hb-sh-card" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><header class="hb-sh-head"><h3>' + title + '</h3><button class="hb-x" type="button" aria-label="' + T('إغلاق', 'Close') + '">' + ic('close') + '</button></header><div class="hb-sh-body"></div></div>';
  const body = $('.hb-sh-body', el);
  if (typeof content === 'string') body.innerHTML = content; else if (content) body.appendChild(content);
  el.addEventListener('click', e => { if (e.target === el) closeSheet(); });
  $('.hb-x', el).addEventListener('click', closeSheet);
  D.body.appendChild(el); sheetEl = el;
  D.documentElement.classList.add('hb-lock');
  requestAnimationFrame(() => el.classList.add('on'));
  return body;
}
addEventListener('keydown', e => { if (e.key === 'Escape' && sheetEl) { e.stopPropagation(); closeSheet(); } }, true);

/* ============================================================
   Notifications (history of in-app toasts)
   ============================================================ */
let notes = LS.get('notes', []), unseen = LS.get('unseen', 0);
window.armnOnSay = m => {
  if (!m) return;
  notes.unshift({ m: String(m).slice(0, 120), t: Date.now() }); notes = notes.slice(0, 15);
  unseen = Math.min(99, unseen + 1); LS.set('notes', notes); LS.set('unseen', unseen); paintBell();
};
function paintBell() { $$('.js-bell-dot').forEach(b => { b.hidden = !unseen; b.textContent = unseen > 9 ? '9+' : unseen; }); }
function openNotes() {
  unseen = 0; LS.set('unseen', 0); paintBell();
  const ago = t => { const s = (Date.now() - t) / 1000; return s < 90 ? T('الآن', 'now') : s < 3600 ? Math.round(s / 60) + T(' د', ' m') : s < 86400 ? Math.round(s / 3600) + T(' س', ' h') : Math.round(s / 86400) + T(' ي', ' d'); };
  sheet(T('الإشعارات', 'Notifications'), notes.length ? '<ul class="hb-notes">' + notes.map(n => '<li><span>' + esc(n.m) + '</span><small>' + ago(n.t) + '</small></li>').join('') + '</ul>' : '<p class="hb-empty">' + T('لا توجد إشعارات بعد. هداياك ونقاطك ستظهر هنا.', 'Nothing yet. Gifts and coins will show up here.') + '</p>', 'small');
}

/* ============================================================
   Navigation helpers
   ============================================================ */
const GIDS = ['xo', 'snake', 'maze', 'orbit', 'bricks', 'runner', 't2048', 'memory', 'blocks', 'flip'];
const curHash = () => (location.hash || '').replace('#', '');
const onHome = () => !D.documentElement.classList.contains('imm');
function openGame(id) { location.hash = '#' + id; }
function needLogin(msg) {
  if (APP.loggedIn) return false;
  APP.say(msg || T('سجّل دخولك أولاً', 'Log in first')); APP.auth('in'); return true;
}
function gotoOnline(mode) {
  if (needLogin(T('سجّل دخولك أولاً للعب أونلاين', 'Log in first to play online'))) return;
  location.hash = '#xo';
  setTimeout(() => {
    const o = $('#xoOnlineOpen'); if (o) o.click();
    setTimeout(() => {
      if (mode === 'create') { const b = $('#xoCreateRoom'); if (b) b.click(); }
      else if (mode === 'join') { const i = $('#xoRoomCode'); if (i) i.focus(); }
    }, 140);
  }, 140);
}
function randomGame() {
  const last = LS.get('recent', [])[0];
  const pool = GIDS.filter(g => g !== last);
  const g = pool[Math.floor(Math.random() * pool.length)];
  APP.say(T('اخترنا لك: ', 'Picked for you: ') + gName(g)); openGame(g);
}
function scrollTo(sel) { const el = $(sel); if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
function recordRecent() {
  const h = curHash(); if (!GIDS.includes(h)) return;
  const r = LS.get('recent', []).filter(x => x !== h); r.unshift(h); LS.set('recent', r.slice(0, 4));
}

/* ============================================================
   RANKING — avatars next to every score
   ============================================================ */
const RB = { cache: {}, avc: {}, frc: {} };
const BADN = ['__proto__', 'constructor', 'prototype', 'hasownproperty', 'tostring'];
const validName = n => /^[a-z0-9_]{3,16}$/.test(n) && !BADN.includes(n);
const dbGet = (p, q) => API.db('GET', p, undefined, { auth: false, q });

/* ============================================================
   SOCIAL — presence (green / red / yellow) + friend requests
   Firebase paths: social/presence/<user>, social/req/<to>/<from>, social/friends/<me>/<friend>
   ============================================================ */
const SOC = {
  me: () => (APP.loggedIn && APP.name && validName(APP.name)) ? APP.name : null,
  last: 0, lastN: 0,
  async beat(off) {
    const me = SOC.me(); if (!me) return;
    const body = off ? { t: 0, s: 'o' } : { t: { '.sv': 'timestamp' }, s: GIDS.includes(curHash()) ? 'p' : 'o' };
    try { await API.db('PUT', 'social/presence/' + me, body, { ka: !!off }); } catch (e) {}
  },
  status(p) { if (!p || !+p.t || Date.now() - +p.t > 100000) return 'off'; return p.s === 'p' ? 'play' : 'on'; },
  async presence(names) {
    const out = {};
    await Promise.all(names.map(async n => { try { out[n] = SOC.status(await dbGet('social/presence/' + n)); } catch (e) { out[n] = 'off'; } }));
    return out;
  },
  async incoming() {
    const me = SOC.me(); if (!me) return [];
    const d = await API.db('GET', 'social/req/' + me);
    return Object.entries(d || {}).filter(([k, v]) => validName(k) && v && v.st !== 'accepted').map(([k, v]) => ({ name: k, t: +v.t || 0 }));
  },
  async cloudFriends() {
    const me = SOC.me(); if (!me) return [];
    const d = await API.db('GET', 'social/friends/' + me);
    return Object.keys(d || {}).filter(validName);
  },
  addLocal(n) { const f = LS.get('friends', []); if (!f.includes(n)) { f.push(n); LS.set('friends', f); } },
  /* sender side: look at my pending requests, finish accepted ones, drop declined ones */
  async resolvePending() {
    const me = SOC.me(); if (!me) return;
    let pend = LS.get('fpend', []); if (!pend.length) return;
    for (const n of pend.slice()) {
      try {
        const v = await API.db('GET', 'social/req/' + n + '/' + me);
        if (v && v.st === 'accepted') {
          try { await API.db('PUT', 'social/friends/' + me + '/' + n, true); } catch (e) {}
          SOC.addLocal(n); pend = pend.filter(x => x !== n); LS.set('fpend', pend);
          try { await API.db('DELETE', 'social/req/' + n + '/' + me); } catch (e) {}
          APP.say(T('قبل ' + n + ' طلب صداقتك 🎉', n + ' accepted your friend request 🎉'));
        } else if (v === null) {
          pend = pend.filter(x => x !== n); LS.set('fpend', pend);
          APP.say(T('لم يوافق ' + n + ' على طلبك', n + ' did not accept your request'));
        }
      } catch (e) {}
    }
  },
  /* merge my cloud friend list into the local one; upload old local-only friends */
  async syncFriends() {
    const me = SOC.me(); if (!me) return;
    try {
      const cloud = await SOC.cloudFriends();
      cloud.forEach(SOC.addLocal);
      for (const n of LS.get('friends', [])) if (!cloud.includes(n)) { try { await API.db('PUT', 'social/friends/' + me + '/' + n, true); } catch (e) { break; } }
    } catch (e) {}
  },
  async send(n) {
    const me = SOC.me(); if (!me) throw { code: 'login' };
    const inc = await SOC.incoming().catch(() => []);
    if (inc.some(x => x.name === n)) { await SOC.accept(n); return 'accepted'; }
    await API.db('PUT', 'social/req/' + n + '/' + me, { t: { '.sv': 'timestamp' }, st: 'pending' });
    const p = LS.get('fpend', []); if (!p.includes(n)) { p.push(n); LS.set('fpend', p); }
    return 'sent';
  },
  async accept(n) {
    const me = SOC.me(); if (!me) return;
    await API.db('PUT', 'social/friends/' + me + '/' + n, true);
    try { await API.db('PATCH', 'social/req/' + me + '/' + n, { st: 'accepted' }); } catch (e) {}
    SOC.addLocal(n);
  },
  async decline(n) { const me = SOC.me(); if (!me) return; try { await API.db('DELETE', 'social/req/' + me + '/' + n); } catch (e) {} },
  async remove(n) {
    const me = SOC.me();
    LS.set('friends', LS.get('friends', []).filter(x => x !== n));
    LS.set('fpend', LS.get('fpend', []).filter(x => x !== n));
    if (!me) return;
    try { await API.db('DELETE', 'social/friends/' + me + '/' + n); } catch (e) {}
    try { await API.db('DELETE', 'social/req/' + n + '/' + me); } catch (e) {}
  },
  async tick() {
    if (!SOC.me()) return;
    SOC.beat();
    if (Date.now() - SOC.last < 55000) return; SOC.last = Date.now();
    try { await SOC.resolvePending(); const n = (await SOC.incoming()).length; if (n > SOC.lastN) APP.say(T('وصلك طلب صداقة جديد 👋 — افتح التصنيف ← أصدقائي', 'New friend request 👋 — open Ranking → Friends')); SOC.lastN = n; } catch (e) {}
  },
  start() {
    if (SOC.on) return; SOC.on = true;
    setTimeout(() => SOC.tick(), 2500);
    setInterval(() => SOC.tick(), 25000);
    addEventListener('hashchange', () => SOC.beat());
    D.addEventListener('visibilitychange', () => { if (!D.hidden) SOC.tick(); });
    addEventListener('pagehide', () => SOC.beat(true));
  }
};
async function resolveAv(rows) {
  const frOk = x => (window.armnFrameOk ? window.armnFrameOk(x) : '');
  await Promise.all(rows.map(async r => {
    if (r.fr !== undefined && isInt(r.av)) { r.av = +r.av; r.fr = frOk(r.fr); RB.avc[r.name] = r.av; RB.frc[r.name] = r.fr; return; }
    if (r.name in RB.avc && r.name in RB.frc) { r.av = isInt(r.av) ? +r.av : RB.avc[r.name]; if (r.fr === undefined) r.fr = RB.frc[r.name]; return; }
    if (!validName(r.name)) { RB.avc[r.name] = null; RB.frc[r.name] = ''; r.av = isInt(r.av) ? +r.av : null; r.fr = r.fr || ''; return; }
    let v = null; try { v = await dbGet('lb/points/' + r.name); } catch (e) {}
    RB.avc[r.name] = v && isInt(v.av) ? +v.av : null; RB.frc[r.name] = frOk(v && v.fr);
    r.av = isInt(r.av) ? +r.av : RB.avc[r.name]; if (r.fr === undefined) r.fr = RB.frc[r.name];
  }));
}
async function fetchBoard(kind) {
  const c = RB.cache[kind]; if (c && Date.now() - c.t < 45000) return c.rows;
  let rows = [];
  if (kind === 'points') {
    const d = await dbGet('lb/points', 'orderBy=%22pts%22&limitToLast=20');
    rows = Object.entries(d || {}).filter(([k, v]) => validName(k) && v && Number.isFinite(+v.pts) && +v.pts > 0).map(([k, v]) => ({ name: k, score: Math.min(1e9, +v.pts), av: isInt(v.av) ? +v.av : null, fr: window.armnFrameOk ? window.armnFrameOk(v.fr) : '' }));
  } else if (kind === 'online') {
    let d; try { d = await dbGet('lb/online_xo', 'orderBy=%22wins%22&limitToLast=40'); } catch (e) { d = await dbGet('lb/online_xo'); }
    const g = new Map();
    Object.entries(d || {}).forEach(([k, v]) => {
      if (!v || !Number.isFinite(+v.wins) || +v.wins <= 0) return;
      const name = String(v.name || k).slice(0, 24), o = g.get(name) || { score: 0, av: null };
      o.score += +v.wins; if (isInt(v.av)) o.av = +v.av; g.set(name, o);
    });
    rows = [...g].map(([name, o]) => ({ name, score: o.score, av: o.av }));
  } else {
    const low = kind === 'memory';
    const d = await dbGet('lb/games/' + kind, 'orderBy=%22s%22&' + (low ? 'limitToFirst' : 'limitToLast') + '=20');
    rows = Object.entries(d || {}).filter(([k, v]) => validName(k) && v && Number.isFinite(+v.s) && +v.s > 0).map(([k, v]) => ({ name: k, score: +v.s, av: isInt(v.av) ? +v.av : null, low }));
  }
  rows.sort((a, b) => (kind === 'memory' ? a.score - b.score : b.score - a.score));
  rows = rows.slice(0, 10);
  await resolveAv(rows);
  RB.cache[kind] = { t: Date.now(), rows };
  return rows;
}
async function fetchFriends() {
  const names = LS.get('friends', []), pend = LS.get('fpend', []).filter(n => !names.includes(n)), rows = [];
  await Promise.all(names.concat(pend).map(async n => {
    const pending = pend.includes(n);
    try { const v = await dbGet('lb/points/' + n); if (v && Number.isFinite(+v.pts)) rows.push({ name: n, score: +v.pts, av: isInt(v.av) ? +v.av : null, fr: window.armnFrameOk ? window.armnFrameOk(v.fr) : '', friend: true, pending }); else rows.push({ name: n, score: 0, av: null, friend: true, pending }); }
    catch (e) { rows.push({ name: n, score: 0, av: null, friend: true, pending }); }
  }));
  const u = user();
  if (u && APP.name) rows.push({ name: APP.name, score: u.tot | 0, av: isInt(u.avatar) ? +u.avatar : 0, fr: u.fr || '', st: 'on' });
  await resolveAv(rows);
  rows.sort((a, b) => (a.pending ? 1 : 0) - (b.pending ? 1 : 0) || b.score - a.score);
  return rows;
}
const unitOf = k => (k === 'online' ? T('فوز', 'wins') : k === 'memory' ? T('حركة', 'moves') : '');
const avWrap = r => { const a = '<span class="rk-av">' + window.armnRankAvatar(r.name, r.av) + '</span>'; return r.fr && r.fr !== 'none' ? '<span class="rk-avr ring fr-' + r.fr + '">' + a + '</span>' : a; };
function rowsHtml(rows, kind, opts) {
  opts = opts || {};
  const myName = APP.name, lim = opts.limit || 10;
  return rows.slice(0, lim).map((r, i) => {
    const STL = { on: T('متصل', 'Online'), off: T('غير متصل', 'Offline'), play: T('يلعب الآن', 'Playing'), wait: T('بانتظار الموافقة', 'Awaiting approval') };
    const sk = kind === 'friends' ? (r.pending ? 'wait' : r.st) : '';
    const dot = sk ? '<i class="pdot ' + sk + '" title="' + STL[sk] + '"></i>' : '';
    const lv = kind === 'points' || kind === 'friends' ? '<small class="rk-lv">' + (r.pending ? '' : 'Lv ' + lvInfo(r.score).lvl + ' · ') + '<span class="rk-st-t">' + (sk ? STL[sk] : '') + '</span></small>' : '';
    const rm = r.friend && r.name !== myName ? '<button class="rk-rm" type="button" data-rm="' + esc(r.name) + '" aria-label="' + T('إزالة', 'Remove') + '">' + ic('close') + '</button>' : '';
    const st = kind === 'maze' ? ic('star', 'rk-st') : '';
    return '<div class="rk-row r' + (i + 1) + (r.name === myName ? ' me' : '') + (r.pending ? ' pend' : '') + '"><span class="rk-n">' + (r.pending ? '⏳' : i + 1) + '</span>' + avWrap(r) + '<span class="rk-nm"><b>' + dot + esc(r.name) + '</b>' + lv + '</span><span class="rk-sc">' + st + (r.pending ? '' : r.score) + (unitOf(kind) ? ' <small>' + unitOf(kind) + '</small>' : '') + '</span>' + rm + '</div>';
  }).join('');
}
const skeleton = n => Array.from({ length: n }, () => '<div class="rk-row sk"><span class="rk-n"></span><span class="rk-av"></span><span class="rk-nm"><b></b></span><span class="rk-sc"></span></div>').join('');

function mountRank(host, o) {
  o = o || {};
  const st = { kind: o.kind || 'points', busy: 0 };
  const tabs = [['points', T('أعلى اللاعبين', 'Top players')], ['friends', T('أصدقائي', 'Friends')], ['online', T('X-O أونلاين', 'X-O online')]];
  host.innerHTML = '<div class="rk"><div class="rk-tabs" role="tablist"></div>' + (o.chips ? '<div class="rk-chips" role="tablist"></div>' : '') + '<div class="rk-head"><span>#</span><span>' + T('اللاعب', 'Player') + '</span><span class="rk-h-sc"></span></div><div class="rk-list" aria-live="polite"></div><div class="rk-foot"></div></div>';
  const tabsEl = $('.rk-tabs', host), chipsEl = $('.rk-chips', host), list = $('.rk-list', host), foot = $('.rk-foot', host), hsc = $('.rk-h-sc', host);
  const draw = () => {
    tabsEl.innerHTML = tabs.map(t => '<button type="button" role="tab" data-k="' + t[0] + '" aria-selected="' + (st.kind === t[0]) + '" class="' + (st.kind === t[0] ? 'on' : '') + '">' + t[1] + '</button>').join('');
    if (chipsEl) chipsEl.innerHTML = GIDS.map(g => '<button type="button" role="tab" data-k="' + g + '" aria-selected="' + (st.kind === g) + '" class="' + (st.kind === g ? 'on' : '') + '">' + art(g, 'chip-art') + '<span>' + gName(g) + '</span></button>').join('');
    hsc.textContent = st.kind === 'online' ? T('الانتصارات', 'Wins') : st.kind === 'points' || st.kind === 'friends' ? T('النقاط', 'Points') : st.kind === 'maze' ? T('النجوم', 'Stars') : st.kind === 'memory' ? T('الحركات', 'Moves') : T('أفضل نتيجة', 'Best');
  };
  async function load() {
    const my = ++st.busy; draw();
    clearInterval(st.tm);
    if (st.kind === 'friends') st.tm = setInterval(() => { if (!D.body.contains(host) || st.kind !== 'friends') { clearInterval(st.tm); return; } if (!D.hidden) loadFriends(st.busy, true).catch(() => {}); }, 20000);
    list.innerHTML = skeleton(o.limit || 10); foot.innerHTML = '';
    try {
      if (st.kind === 'friends') { await loadFriends(my); return; }
      const rows = await fetchBoard(st.kind); if (my !== st.busy) return;
      list.innerHTML = rows.length ? rowsHtml(rows, st.kind, o) : '<p class="hb-empty">' + T('لا توجد نتائج بعد — كن الأول!', 'No scores yet — be the first!') + '</p>';
      if (st.kind === 'points') myRankFoot(rows);
      if (o.more) foot.innerHTML = '<button type="button" class="hb-btn ghost block" data-act="rank">' + T('عرض التصنيف الكامل', 'Open full ranking') + ' ' + ic('chev', 'flipx') + '</button>';
    } catch (e) {
      if (my !== st.busy) return;
      list.innerHTML = '<p class="hb-empty">' + T('تعذّر تحميل التصنيف. تحقق من الاتصال.', 'Could not load the ranking. Check your connection.') + '</p><button type="button" class="hb-btn ghost block" data-retry>' + T('إعادة المحاولة', 'Retry') + '</button>';
    }
  }
  function myRankFoot(rows) {
    const u = user(); if (!u || !APP.name) { foot.innerHTML = '<p class="rk-note">' + T('سجّل دخولك لتظهر صورتك ونتيجتك في التصنيف', 'Log in to show your portrait and score here') + '</p>'; return; }
    if (rows.some(r => r.name === APP.name)) return;
    foot.innerHTML = '<div class="rk-row me out"><span class="rk-n">…</span><span class="rk-av">' + window.armnRankAvatar(APP.name, u.avatar) + '</span><span class="rk-nm"><b>' + esc(APP.name) + '</b><small class="rk-lv">Lv ' + lvInfo(u.tot | 0).lvl + '</small></span><span class="rk-sc">' + (u.tot | 0) + '</span></div>';
  }
  async function loadFriends(my, silent) {
    if (!silent || !$('.rk-add', foot)) foot.innerHTML = '<div class="rk-add"><input type="text" dir="ltr" maxlength="16" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="' + T('اسم صديقك (a-z, 0-9, _)', 'Friend username (a-z, 0-9, _)') + '" aria-label="' + T('اسم الصديق', 'Friend username') + '"><button type="button" class="hb-btn primary" data-addf>' + ic('plus') + ' ' + T('إضافة', 'Add') + '</button></div><p class="rk-note rk-msg" role="status">' + T('يصله طلب صداقة ويجب أن يوافق عليه.', 'They get a friend request and must approve it.') + '</p><div class="rk-legend"><span><i class="pdot on"></i>' + T('متصل', 'Online') + '</span><span><i class="pdot play"></i>' + T('يلعب', 'Playing') + '</span><span><i class="pdot off"></i>' + T('غير متصل', 'Offline') + '</span></div>';
    let reqs = [];
    if (SOC.me()) { await SOC.syncFriends(); await SOC.resolvePending(); try { reqs = await SOC.incoming(); SOC.lastN = reqs.length; } catch (e) {} }
    const names = LS.get('friends', []), pend = LS.get('fpend', []);
    const rows = await fetchFriends(); if (my !== st.busy) return;
    const pres = await SOC.presence(names); if (my !== st.busy) return;
    rows.forEach(r => { if (r.friend && !r.pending) r.st = pres[r.name] || 'off'; });
    await resolveAv(reqs.map(q => { q.av = null; return q; }));
    const reqHtml = reqs.length ? '<div class="rk-reqh">' + T('طلبات الصداقة (' + reqs.length + ')', 'Friend requests (' + reqs.length + ')') + '</div>' + reqs.map(q => '<div class="rk-req"><span class="rk-av">' + window.armnRankAvatar(q.name, q.av) + '</span><span class="rk-nm"><b>' + esc(q.name) + '</b><small>' + T('يريد أن يضيفك صديقاً', 'wants to be your friend') + '</small></span><span class="ra"><button type="button" class="ok" data-acc="' + esc(q.name) + '" aria-label="' + T('قبول', 'Accept') + '">✓</button><button type="button" class="no" data-dec="' + esc(q.name) + '" aria-label="' + T('رفض', 'Decline') + '">✕</button></span></div>').join('') : '';
    list.innerHTML = reqHtml + ((names.length || pend.length) ? rowsHtml(rows, 'friends', Object.assign({}, o, { limit: 40 })) : '<p class="hb-empty">' + T('أضف أصدقاءك بأسماء حساباتهم، وسترى إن كانوا متصلين.', 'Add friends by username and see when they are online.') + '</p>');
  }
  async function addFriend() {
    const inp = $('.rk-add input', host), msg = $('.rk-msg', host); if (!inp) return;
    const n = inp.value.trim().toLowerCase();
    const say = m => { msg.textContent = m; };
    if (!SOC.me()) return say(T('سجّل دخولك أولاً لإضافة الأصدقاء', 'Log in first to add friends'));
    if (!validName(n)) return say(T('اكتب اسماً صحيحاً: 3–16 حرفاً a-z وأرقام و _', 'Use 3–16 chars: a-z, digits, _'));
    if (n === APP.name) return say(T('هذا اسمك أنت 😄', 'That is you!'));
    const f = LS.get('friends', []); if (f.includes(n)) return say(T('هو صديقك بالفعل', 'Already a friend'));
    if (LS.get('fpend', []).includes(n)) return say(T('طلبك بانتظار موافقته', 'Your request is awaiting approval'));
    if (f.length >= 30) return say(T('وصلت للحد الأقصى (30)', 'Limit reached (30)'));
    say(T('جارٍ البحث…', 'Searching…'));
    try {
      const v = await dbGet('lb/points/' + n); if (!v) return say(T('لا يوجد لاعب بهذا الاسم', 'No player with that name'));
      let r; try { r = await SOC.send(n); }
      catch (e) { return say(e && (e.status === 401 || e.status === 403) ? T('قاعدة البيانات ترفض الطلب — أضف قواعد social في Firebase (انظر ملف القواعد).', 'The database refused the request — add the social rules in Firebase (see the rules file).') : T('تعذّر إرسال الطلب الآن', 'Could not send the request')); }
      inp.value = '';
      APP.say(r === 'accepted' ? T('أصبحتما صديقين: ' + n, 'You are now friends with ' + n) : T('تم إرسال الطلب — بانتظار موافقة ' + n, 'Request sent — waiting for ' + n + ' to accept'));
      load();
    } catch (e) { say(T('تعذّر البحث الآن', 'Search failed')); }
  }
  host.addEventListener('click', e => {
    const tb = e.target.closest('[data-k]'); if (tb && host.contains(tb)) { st.kind = tb.dataset.k; load(); return; }
    if (e.target.closest('[data-addf]')) { addFriend(); return; }
    if (e.target.closest('[data-retry]')) { delete RB.cache[st.kind]; load(); return; }
    const acc = e.target.closest('[data-acc]'); if (acc) { acc.disabled = true; SOC.accept(acc.dataset.acc).then(() => { APP.say(T('أصبحتما صديقين', 'You are now friends')); load(); }).catch(() => { acc.disabled = false; APP.say(T('تعذّر القبول الآن', 'Could not accept now')); }); return; }
    const dec = e.target.closest('[data-dec]'); if (dec) { SOC.decline(dec.dataset.dec).then(load); return; }
    const rm = e.target.closest('[data-rm]'); if (rm) { SOC.remove(rm.dataset.rm).then(load); }
  });
  host.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.rk-add input')) addFriend(); });
  load();
  return { reload() { delete RB.cache[st.kind]; load(); }, set(k) { st.kind = k; load(); } };
}
window.armnOpenRanking = kind => {
  const host = D.createElement('div');
  sheet(T('التصنيف العالمي', 'Global ranking'), host, 'rank');
  const k = kind === 'xo' ? 'xo' : (kind || 'points');
  mountRank(host, { kind: k, chips: true, limit: 10 });
};

/* ============================================================
   Avatar picker (panel on desktop, sheet on phones)
   ============================================================ */
function mountPicker(host, o) {
  o = o || {};
  const u = user();
  const st = { sel: u && isInt(u.avatar) ? +u.avatar : LS.get('guestav', 0), frame: (u && u.fr) || LS.get('frame', 'gold'), bio: LS.get('bio', '') };
  /* premium avatars (15+) are not in this grid but must survive saving the picker */
  host.innerHTML = '<div class="ap"><div class="ap-grid" role="radiogroup" aria-label="' + T('اختر صورتك', 'Choose your portrait') + '">' +
    Array.from({ length: 15 }, (_, i) => '<button type="button" class="ap-i" role="radio" data-i="' + i + '" aria-checked="false" aria-label="' + T('شخصية ', 'Character ') + (i + 1) + '">' + avHtml(i) + '<span class="ap-ck">' + ic('check') + '</span></button>').join('') +
    '</div><div class="ap-side"><div class="ap-prev"><span class="ring fr-gold"><span class="ap-big"></span></span><b class="ap-name"></b></div>' +
    '<label class="ap-bio"><span>' + T('نبذة عني', 'About me') + '</span><input type="text" maxlength="40" placeholder="' + T('اكتب جملة قصيرة…', 'A short line…') + '" value="' + esc(st.bio) + '"></label>' +
    '<div class="ap-frames"><span>' + T('تغيير الإطار', 'Frame') + '</span><div class="ap-fr" role="radiogroup">' + framesAvail().map(f => '<button type="button" class="fr-b fr-' + f + '" role="radio" data-f="' + f + '" aria-label="' + f + '"><i>' + (f === 'gold' ? ic('crown') : '') + '</i></button>').join('') + '</div></div></div>' +
    '<p class="ap-hint">' + T('اختر صورتك الشخصية من القائمة', 'Pick your portrait from the list') + '</p>' +
    '<button type="button" class="hb-btn primary big ap-save">' + T('حفظ التغيير', 'Save changes') + ' ' + ic('check') + '</button>'
    + '</div>';
  const paint = () => {
    $$('.ap-i', host).forEach(b => { const on = +b.dataset.i === st.sel; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    $$('.fr-b', host).forEach(b => { const on = b.dataset.f === st.frame; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    $('.ap-big', host).innerHTML = avHtml(st.sel);
    $('.ap-name', host).textContent = APP.name || T('زائر', 'Guest');
    $('.ring', host).className = 'ring fr-' + st.frame;
  };
  host.addEventListener('click', e => {
    const i = e.target.closest('.ap-i'); if (i) { st.sel = +i.dataset.i; paint(); return; }
    const f = e.target.closest('.fr-b'); if (f) { st.frame = f.dataset.f; paint(); return; }
    if (e.target.closest('.ap-save')) {
      st.bio = $('.ap-bio input', host).value.trim().slice(0, 40);
      LS.set('frame', st.frame); LS.set('bio', st.bio); LS.set('guestav', st.sel);
      if (!APP.loggedIn) { APP.say(T('سجّل دخولك لحفظ صورتك', 'Log in to save your portrait')); renderProfile(); APP.auth('in'); return; }
      APP.setAvatar(st.sel); APP.setFrame(st.frame); APP.say(T('تم حفظ التغييرات ✓', 'Saved ✓')); delete RB.cache.points; renderProfile(); refreshRank();
      if (o.sheet) closeSheet();
    }
  });
  paint();
}
function openPicker() { const h = D.createElement('div'); sheet(T('تغيير الصورة الشخصية', 'Change portrait'), h, 'picker'); mountPicker(h, { sheet: true }); }

/* ============================================================
   Profile (sidebar, header chip, mobile card)
   ============================================================ */
function renderProfile() {
  const u = user(), name = APP.loggedIn && APP.name ? APP.name : null;
  const frame = (u && u.fr) || LS.get('frame', 'gold'), bio = LS.get('bio', '');
  const av = u && isInt(u.avatar) ? +u.avatar : LS.get('guestav', 0);
  const tot = u ? u.tot | 0 : 0, lv = lvInfo(tot);
  $$('.js-av').forEach(el => { el.innerHTML = avHtml(av); });
  $$('.js-ring').forEach(el => { el.className = el.className.replace(/\bfr-\w+/g, '') + ' fr-' + frame; });
  $$('.js-name').forEach(el => { el.textContent = name || T('زائر', 'Guest'); });
  $$('.js-status').forEach(el => { el.innerHTML = '<i class="dot ' + (navigator.onLine ? 'on' : '') + '"></i>' + (navigator.onLine ? T('متصل', 'Online') : T('غير متصل', 'Offline')); });
  $$('.js-coins').forEach(el => { el.innerHTML = ic('coin') + '<b>' + (u ? u.pts | 0 : 0) + '</b>'; });
  $$('.js-lv').forEach(el => { el.textContent = 'Lv. ' + lv.lvl; });
  $$('.js-xp').forEach(el => { el.textContent = lv.cur + ' / ' + lv.need; });
  $$('.js-bar').forEach(el => { el.style.setProperty('--p', lv.pct + '%'); });
  $$('.js-title').forEach(el => { el.textContent = titleOf(tot); });
  $$('.js-bio').forEach(el => { el.textContent = bio || T('اللعب هو المتعة الحقيقية', 'Play is the real fun'); });
  $$('.js-guest').forEach(el => { el.hidden = !!name; });
  $$('.js-user').forEach(el => { el.hidden = !name; });
}
window.armnOnPaint = () => { renderProfile(); };

/* ============================================================
   Live demo board (home panel)
   ============================================================ */
function mountDemo(host) {
  const seq = [[4, 'X'], [0, 'O'], [2, 'X'], [6, 'O'], [3, 'X'], [5, 'O'], [8, 'X'], [1, 'O']];
  host.innerHTML = '<div class="dm-board" aria-hidden="true">' + Array.from({ length: 9 }, () => '<i class="dm-c"></i>').join('') + '</div>';
  const cells = $$('.dm-c', host); let k = 0;
  const mark = s => '<svg viewBox="0 0 40 40">' + (s === 'X' ? '<path class="mx" d="M9 9l22 22M31 9 9 31"/>' : '<circle class="mo" cx="20" cy="20" r="12"/>') + '</svg>';
  const tick = () => {
    if (D.hidden || !onHome() || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if (k >= seq.length + 2) { cells.forEach(c => { c.innerHTML = ''; }); k = 0; return; }
    if (k < seq.length) { const [i, s] = seq[k]; cells[i].innerHTML = mark(s); }
    k++;
  };
  tick(); tick(); tick();
  setInterval(tick, 1100);
}

/* ============================================================
   HOME DASHBOARD
   ============================================================ */
let hub, rankMount = null;
const refreshRank = () => { if (rankMount) rankMount.reload(); };
function gamesFromLegacy() {
  const map = {};
  $$('#home .gcard').forEach(a => {
    const id = (a.getAttribute('href') || '').replace('#', ''); if (!id) return;
    map[id] = { name: ($('.gname', a) || {}).textContent || gName(id), desc: ($('.gdesc', a) || {}).textContent || '', meta: (($('.meta', a) || {}).textContent || '').trim() };
  });
  return map;
}
function renderGames() {
  const host = $('#hbGames .hb-grid'); if (!host) return;
  const m = gamesFromLegacy();
  host.innerHTML = GIDS.map((id, n) => {
    const g = m[id] || { name: gName(id), desc: '', meta: '' };
    return '<a class="gc" href="#' + id + '" style="--c:' + GCOL[id] + '" data-id="' + id + '"><span class="gc-art">' + art(id) + '</span><span class="gc-t"><b>' + esc(g.name) + '</b><small>' + esc(g.desc) + '</small></span>' + (g.meta ? '<em class="gc-m">' + esc(g.meta) + '</em>' : '') + '<span class="gc-go">' + ic('play') + '<kbd>' + (n === 9 ? 0 : n + 1) + '</kbd></span></a>';
  }).join('');
  const rec = LS.get('recent', []);
  const rh = $('#hbRecent');
  if (rh) {
    rh.hidden = !rec.length;
    rh.innerHTML = rec.length ? '<span class="rc-l">' + T('العب من جديد', 'Play again') + '</span>' + rec.map(id => '<a class="rc" href="#' + id + '" style="--c:' + GCOL[id] + '">' + art(id) + '<b>' + gName(id) + '</b></a>').join('') : '';
  }
}
function buildHub() {
  const home = $('#home'); if (!home || $('#hub')) return;
  hub = D.createElement('div'); hub.id = 'hub'; hub.className = 'hub';
  const nav = (act, icon, label) => '<button type="button" class="nv" data-act="' + act + '">' + ic(icon) + '<span>' + label + '</span></button>';
  hub.innerHTML =
  '<header class="hb-top">' +
  '<nav class="hb-nav" aria-label="' + T('التنقل الرئيسي', 'Main') + '">' + nav('top', 'home', T('الرئيسية', 'Home')) + nav('rank', 'trophy', T('التصنيف العالمي', 'Ranking')) + nav('shop', 'bag', T('المتجر', 'Shop')) + nav('games', 'gamepad', T('ألعاب سريعة', 'Quick games')) + '</nav>' +
  '<div class="hb-tr"><button type="button" class="ib" data-act="notes" aria-label="' + T('الإشعارات', 'Notifications') + '">' + ic('bell') + '<i class="js-bell-dot dotb" hidden></i></button>' +
  '<button type="button" class="chip-me" data-act="account"><span class="av-sm js-ring ring fr-gold"><span class="js-av"></span></span><span class="cm-t"><b class="js-name"></b><small class="js-status"></small></span></button>' +
  '<button type="button" class="ib" data-act="settings" aria-label="' + T('الإعدادات', 'Settings') + '">' + ic('gear') + '</button></div></header>' +

  '<section class="hb-stage"><section class="pc"><div class="pc-top"><span class="pc-ring js-ring ring fr-gold"><span class="js-av"></span></span><button type="button" class="pc-cam" data-act="avatar" aria-label="' + T('تغيير الصورة', 'Change portrait') + '">' + ic('camera') + '</button></div>' +
  '<h2 class="pc-name js-name"></h2><p class="pc-bio js-bio"></p>' +
  '<div class="pc-lv js-user"><span class="lvb"><ins>' + ic('star') + '</ins><b class="js-lv"></b></span><div class="xp"><div class="xp-bar js-bar"></div></div><span class="xp-n js-xp"></span></div>' +
  '<div class="pc-row js-user"><span class="coinp js-coins"></span><button type="button" class="hb-btn mini" data-act="shop">' + ic('bag') + ' ' + T('المتجر', 'Shop') + '</button></div>' +
  '<div class="pc-guest js-guest"><p>' + T('سجّل دخولك لتحفظ تقدمك وتظهر صورتك في التصنيف العالمي.', 'Log in to save progress and show your portrait in the global ranking.') + '</p><button type="button" class="hb-btn primary block" data-act="login">' + ic('key') + ' ' + T('دخول / حساب جديد', 'Log in / Sign up') + '</button></div></section>' +
  '<div class="hl-wrap"><h1 class="hl" aria-label="GAME ARMN"><span class="hl-crown" aria-hidden="true">' + ic('crown') + '</span>' +
  '<span class="hl-g" aria-hidden="true"><span style="--i:0">G</span><span style="--i:1">A</span><span style="--i:2">M</span><span style="--i:3">E</span></span>' +
  '<span class="hl-a" aria-hidden="true"><span style="--i:0">A</span><span style="--i:1">R</span><span style="--i:2">M</span><span style="--i:3">N</span></span>' +
  '<i class="hl-sp s1" aria-hidden="true">✦</i><i class="hl-sp s2" aria-hidden="true">✦</i><i class="hl-sp s3" aria-hidden="true">✦</i><i class="hl-sp s4" aria-hidden="true">✦</i></h1>' +
  '<p class="hl-by"><b class="x">X</b><span>By <b>Ahmed Abu Muslim</b></span><b class="o">O</b></p></div></section>' +
  '<div class="hb-body"><aside class="hb-side" id="hbSide">' +
  '<nav class="sm" aria-label="' + T('قائمة الحساب', 'Account menu') + '"><button type="button" class="on" data-act="top">' + ic('user') + '<span>' + T('ملفي الشخصي', 'My profile') + '</span></button><button type="button" data-act="avatar">' + ic('image') + '<span>' + T('تغيير الصورة', 'Change portrait') + '</span></button><button type="button" data-act="account">' + ic('user') + '<span>' + T('معلومات الحساب', 'Account info') + '</span></button><button type="button" data-act="settings">' + ic('gear') + '<span>' + T('الإعدادات', 'Settings') + '</span></button><button type="button" data-act="help">' + ic('help') + '<span>' + T('مساعدة', 'Help') + '</span></button><button type="button" class="js-user" data-act="logout">' + ic('logout') + '<span>' + T('تسجيل الخروج', 'Log out') + '</span></button></nav>' +
  '<p class="slogan">' + ic('crown') + '<span><i>' + T('العب', 'Play') + '</i> <i>' + T('تحدَّ', 'Challenge') + '</i> <i>' + T('اصعد', 'Rise') + '</i></span></p></aside>' +

  '<main class="hb-main"><section class="hb-tiles" aria-label="' + T('ابدأ اللعب', 'Start playing') + '">' +
  '<button type="button" class="tile t-online" data-act="online"><span class="t-ic">' + ic('globe') + '</span><b>' + T('لعب X-O أونلاين', 'Play X-O online') + '</b><small>' + T('تحدَّ أصدقاءك أو انضم بكود غرفة', 'Challenge friends or join with a room code') + '</small><kbd>O</kbd></button>' +
  '<button type="button" class="tile t-shop" data-act="shop"><span class="t-ic">' + ic('bag') + '</span><b>' + T('المتجر', 'Shop') + '</b><small>' + T('أطر وصور مميزة بنقاطك', 'Special frames and portraits for your points') + '</small><kbd>S</kbd></button>' +
  '<button type="button" class="tile t-rank" data-act="rank"><span class="t-ic">' + ic('trophy') + '</span><b>' + T('التصنيف العالمي', 'Global ranking') + '</b><small>' + T('كن الأفضل بين جميع اللاعبين', 'Be the best of all players') + '</small><kbd>L</kbd></button>' +
  '<button type="button" class="tile t-quick" data-act="random"><span class="t-ic">' + ic('bolt') + '</span><b>' + T('ألعاب سريعة', 'Quick play') + '</b><small>' + T('لعبة عشوائية فوراً بدون انتظار', 'A random game, instantly') + '</small><kbd>Q</kbd></button></section>' +
  '<div class="hb-recent" id="hbRecent" hidden></div>' +
  '<div class="hb-panels"><section class="pn pn-avatar" id="pnAvatar"><header class="pn-h">' + ic('image') + '<h3>' + T('تغيير الصورة الشخصية', 'Change portrait') + '</h3></header><div class="pn-b" id="pnAvatarBody"></div></section>' +
  '<section class="pn pn-rank" id="pnRank"><header class="pn-h">' + ic('crown') + '<h3>' + T('التصنيف العالمي', 'Global ranking') + '</h3>' + ic('globe', 'pn-g') + '</header><div class="pn-b" id="pnRankBody"></div></section>' +
  '<section class="pn pn-live" id="pnLive"><header class="pn-h">' + ic('wifi') + '<h3>' + T('لعب X-O أونلاين', 'Play X-O online') + '</h3></header><div class="pn-b"><div class="lv-vs"><div class="lv-p"><span class="ring fr-gold js-ring"><span class="js-av"></span></span><b class="js-name"></b></div><span class="vs">VS</span><div class="lv-p"><span class="ring fr-pink mystery"><span class="q">?</span></span><b>' + T('صديقك', 'Your friend') + '</b></div></div><div id="pnDemo"></div><div class="lv-act"><button type="button" class="hb-btn primary" data-act="quick">' + ic('bolt') + ' ' + T('غرفة سريعة', 'Quick room') + '</button><button type="button" class="hb-btn" data-act="rooms">' + ic('key') + ' ' + T('انضمام بكود', 'Join by code') + '</button></div></div></section></div>' +
  '<section class="hb-games" id="hbGames"><header class="sec-h"><h2>' + ic('gamepad') + ' ' + T('ألعابنا', 'Our games') + '</h2><button type="button" class="hb-link" data-act="random">' + ic('dice') + ' ' + T('اختر لي لعبة', 'Surprise me') + '</button></header><div class="hb-grid"></div></section>' +
  '<footer class="hb-foot"><span>© 2026 Ahmed Abu Muslim</span><span>MIT</span><button type="button" class="hb-link" data-act="about">' + T('حول / الترخيص / الخصوصية', 'About · License · Privacy') + '</button></footer></main></div>' +

  '<nav class="hb-bottom" aria-label="' + T('تنقل سريع', 'Quick navigation') + '"><button type="button" class="bn on" data-act="top">' + ic('home') + '<span>' + T('الرئيسية', 'Home') + '</span></button><button type="button" class="bn" data-act="rank">' + ic('trophy') + '<span>' + T('التصنيف', 'Ranking') + '</span></button><button type="button" class="bn bn-mid" data-act="random" aria-label="' + T('لعب سريع', 'Quick play') + '">' + ic('bolt') + '</button><button type="button" class="bn" data-act="shop">' + ic('bag') + '<span>' + T('المتجر', 'Shop') + '</span></button><button type="button" class="bn" data-act="mobileme"><span class="av-xs js-ring ring fr-gold"><span class="js-av"></span></span><span>' + T('حسابي', 'Me') + '</span></button></nav>';
  home.prepend(hub);
  mountPicker($('#pnAvatarBody'));
  rankMount = mountRank($('#pnRankBody'), { limit: 10, more: true });
  mountDemo($('#pnDemo'));
  renderProfile(); renderGames(); paintBell(); SOC.start();
  hub.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && hub.contains(b)) act(b.dataset.act); });
}

/* ---- actions ---- */
function settingsSheet() {
  const sndOn = () => !$('#btnSound').classList.contains('off');
  const h = D.createElement('div');
  const draw = () => {
    h.innerHTML = '<div class="st-list"><button type="button" class="st" data-s="sound">' + ic(sndOn() ? 'sound' : 'mute') + '<span>' + T('الصوت', 'Sound') + '</span><i class="sw ' + (sndOn() ? 'on' : '') + '"></i></button>' +
      '<button type="button" class="st" data-s="lang">' + ic('lang') + '<span>' + T('اللغة', 'Language') + '</span><em>' + T('English', 'العربية') + '</em></button>' +
      '<button type="button" class="st" data-s="full">' + ic('expand') + '<span>' + T('ملء الشاشة', 'Fullscreen') + '</span></button>' +
      '<button type="button" class="st" data-s="account">' + ic('user') + '<span>' + T('حسابي', 'My account') + '</span></button>' +
      '<button type="button" class="st" data-s="help">' + ic('help') + '<span>' + T('الاختصارات والمساعدة', 'Shortcuts & help') + '</span></button></div>';
  };
  draw();
  h.addEventListener('click', e => {
    const b = e.target.closest('[data-s]'); if (!b) return;
    const s = b.dataset.s;
    if (s === 'sound') { $('#btnSound').click(); draw(); }
    else if (s === 'lang') { $('#btnLang').click(); closeSheet(); }
    else if (s === 'full') { $('#btnFull').click(); closeSheet(); }
    else if (s === 'account') { closeSheet(); accountOrLogin(); }
    else if (s === 'help') { closeSheet(); helpSheet(); }
  });
  sheet(T('الإعدادات', 'Settings'), h, 'small');
}
function helpSheet() {
  const k = (key, a, e) => '<li><kbd>' + key + '</kbd><span>' + T(a, e) + '</span></li>';
  sheet(T('الاختصارات والمساعدة', 'Shortcuts & help'),
    '<h4 class="hp-h">' + T('في الشاشة الرئيسية', 'On the home screen') + '</h4><ul class="hp">' +
    k('1 – 0', 'فتح اللعبة بحسب ترتيبها', 'Open a game by its number') + k('O', 'لعب X-O أونلاين (غرفة أو انضمام بكود)', 'Play X-O online (room or join by code)') + k('L', 'التصنيف العالمي', 'Global ranking') + k('Q', 'لعبة عشوائية فوراً', 'Random game') + k('S', 'المتجر', 'Shop') + k('A', 'تغيير الصورة', 'Change portrait') + k('?', 'هذه النافذة', 'This window') + '</ul>' +
    '<h4 class="hp-h">' + T('داخل X-O', 'Inside X-O') + '</h4><ul class="hp">' + k('1 – 9', 'ضع قطعتك في الخانة', 'Place your piece') + k('Z', 'تراجع', 'Undo') + k('H', 'تلميح', 'Hint') + k('N', 'جولة جديدة', 'New round') + k('C', 'فتح الدردشة (أونلاين)', 'Open chat (online)') + '</ul>' +
    '<h4 class="hp-h">' + T('داخل أي لعبة', 'Inside any game') + '</h4><ul class="hp">' + k('Esc', 'قائمة الاختصارات السريعة', 'Quick menu') + '</ul>', 'small');
}
function accountOrLogin() { if (APP.loggedIn) APP.acct(); else APP.auth('in'); }
function mobileMe() {
  const h = D.createElement('div');
  const u = user(), lv = lvInfo(u ? u.tot | 0 : 0);
  h.innerHTML = '<div class="mm-card"><span class="ring js-ring fr-gold mm-ring"><span class="js-av"></span></span><b class="js-name mm-n"></b><small class="js-title"></small>' +
    (APP.loggedIn ? '<div class="pc-lv"><span class="lvb"><ins>' + ic('star') + '</ins><b class="js-lv"></b></span><div class="xp"><div class="xp-bar js-bar"></div></div><span class="xp-n js-xp"></span></div><span class="coinp js-coins"></span>' : '<p class="hb-empty">' + T('سجّل دخولك لحفظ تقدمك ونقاطك.', 'Log in to save your progress.') + '</p>') + '</div>' +
    '<div class="st-list">' + (APP.loggedIn ? '' : '<button type="button" class="st hl" data-m="login">' + ic('key') + '<span>' + T('دخول / حساب جديد', 'Log in / Sign up') + '</span></button>') +
    '<button type="button" class="st" data-m="avatar">' + ic('image') + '<span>' + T('تغيير الصورة', 'Change portrait') + '</span></button>' +
    (APP.loggedIn ? '<button type="button" class="st" data-m="shop">' + ic('bag') + '<span>' + T('المتجر', 'Shop') + '</span></button><button type="button" class="st" data-m="account">' + ic('user') + '<span>' + T('معلومات الحساب', 'Account info') + '</span></button>' : '') +
    '<button type="button" class="st" data-m="settings">' + ic('gear') + '<span>' + T('الإعدادات', 'Settings') + '</span></button><button type="button" class="st" data-m="help">' + ic('help') + '<span>' + T('الاختصارات والمساعدة', 'Shortcuts & help') + '</span></button>' +
    (APP.loggedIn ? '<button type="button" class="st danger" data-m="logout">' + ic('logout') + '<span>' + T('تسجيل الخروج', 'Log out') + '</span></button>' : '') + '</div>';
  h.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; closeSheet(); setTimeout(() => act(b.dataset.m), 60); });
  sheet(T('حسابي', 'My account'), h, 'small'); renderProfile();
}
function act(a) {
  switch (a) {
    case 'top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    case 'rank': window.armnOpenRanking('points'); break;
    case 'online': gotoOnline('lobby'); break;
    case 'rooms': gotoOnline('join'); break;
    case 'quick': gotoOnline('create'); break;
    case 'games': scrollTo('#hbGames'); break;
    case 'random': randomGame(); break;
    case 'notes': openNotes(); break;
    case 'settings': settingsSheet(); break;
    case 'help': helpSheet(); break;
    case 'avatar': if (matchMedia('(min-width:1240px)').matches && $('#pnAvatar') && $('#pnAvatar').offsetParent) scrollTo('#pnAvatar'); else openPicker(); break;
    case 'account': accountOrLogin(); break;
    case 'login': APP.auth('in'); break;
    case 'logout': SOC.beat(true); APP.logout(); break;
    case 'shop': if (!needLogin(T('سجّل دخولك لفتح المتجر', 'Log in to open the shop'))) APP.shop(); break;
    case 'about': { const b = $('#btnAbout'); if (b) b.click(); break; }
    case 'mobileme': mobileMe(); break;
  }
}

/* ---- keyboard shortcuts (home only) ---- */
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || sheetEl || !onHome()) return;
  const tg = (D.activeElement || {}).tagName; if (/INPUT|TEXTAREA|SELECT/.test(tg)) return;
  if ($$('.amod').some(m => !m.hidden) || !$('#about').hidden) return;
  const k = e.key.toLowerCase();
  if (/^[0-9]$/.test(k)) { openGame(GIDS[k === '0' ? 9 : +k - 1]); e.preventDefault(); return; }
  const map = { o: 'online', l: 'rank', q: 'random', s: 'shop', a: 'avatar', '?': 'help', h: 'help', '؟': 'help' };
  if (map[k]) { e.preventDefault(); act(map[k]); }
});

/* ============================================================
   X-O CHAT
   ============================================================ */
(function chat() {
  const xo = $('#xo'); if (!xo) return;
  const ST = { code: null, side: null, seen: new Set(), msgs: [], unread: 0, open: false, mute: LS.get('chatmute', false), last: 0, opp: { name: '', av: 0 }, fresh: true, usedFallback: false };
  const QUICK = [['حظ سعيد', 'Good luck'], ['لعبة حلوة 👏', 'Nice one 👏'], ['جولة ثانية؟', 'Rematch?'], ['يا سلام 😮', 'Wow 😮'], ['😂', '😂'], ['تمام 👍', 'OK 👍'], ['استعد 🔥', 'Get ready 🔥'], ['GG', 'GG']];
  const tools = $('.xo-tools', xo);
  const btn = D.createElement('button'); btn.type = 'button'; btn.className = 'btn xc-open'; btn.id = 'xcOpen';
  btn.innerHTML = ic('chat') + '<span>' + T('دردشة', 'Chat') + '</span><i class="xc-badge" hidden></i>';
  if (tools) tools.prepend(btn);
  const bubble = D.createElement('div'); bubble.className = 'xc-bubble'; bubble.hidden = true; bubble.setAttribute('role', 'status');
  const sh = D.createElement('section'); sh.className = 'xc-sheet'; sh.hidden = true; sh.setAttribute('aria-label', T('دردشة المنافس', 'Opponent chat'));
  sh.innerHTML = '<header class="xc-h"><span class="xc-oav ring fr-cyan"><span class="xc-av"></span></span><div class="xc-w"><b class="xc-nm"></b><small class="xc-st"></small></div><button type="button" class="ib xc-mute" aria-pressed="false"></button><button type="button" class="ib xc-x" aria-label="' + T('إغلاق', 'Close') + '">' + ic('close') + '</button></header>' +
    '<div class="xc-log" role="log" aria-live="polite"></div><div class="xc-quick">' + QUICK.map((q, i) => '<button type="button" data-q="' + i + '">' + T(q[0], q[1]) + '</button>').join('') + '</div>' +
    '<div class="xc-form"><input type="text" class="xc-in" maxlength="80" enterkeyhint="send" autocomplete="off" placeholder="' + T('اكتب رسالة قصيرة…', 'Type a short message…') + '" aria-label="' + T('رسالة', 'Message') + '"><button type="button" class="xc-send" aria-label="' + T('إرسال', 'Send') + '">' + ic('send') + '</button></div><p class="xc-note">' + T('لا تشارك أرقاماً أو روابط أو معلومات شخصية.', 'Never share numbers, links or personal info.') + '</p>';
  xo.append(bubble, sh);
  const log = $('.xc-log', sh), input = $('.xc-in', sh), badge = $('.xc-badge', btn), muteB = $('.xc-mute', sh);

  const paintMute = () => { muteB.innerHTML = ic(ST.mute ? 'mute' : 'sound'); muteB.setAttribute('aria-pressed', ST.mute); muteB.setAttribute('aria-label', ST.mute ? T('تفعيل التنبيه', 'Unmute') : T('كتم التنبيه', 'Mute')); };
  paintMute();
  const paintBadge = () => { badge.hidden = !ST.unread; badge.textContent = ST.unread > 9 ? '9+' : ST.unread; };
  const URL_RE = /(https?:|www\.|\.com|\.net|\.org|\.io|\.me|@|t\.me|wa\.me)/i, NUM_RE = /(?:[0-9٠-٩][\s\-.]*){6,}/;
  function check(txt) {
    txt = String(txt).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (!txt) return { ok: false };
    if (URL_RE.test(txt)) return { ok: false, err: T('لا يمكن إرسال الروابط أو الإيميلات', 'Links and emails are not allowed') };
    if (NUM_RE.test(txt)) return { ok: false, err: T('لا يمكن إرسال أرقام طويلة', 'Long numbers are not allowed') };
    return { ok: true, txt };
  }
  function beep() {
    if (ST.mute || $('#btnSound').classList.contains('off')) return;
    try { const A = window.AudioContext || window.webkitAudioContext, c = new A(), o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = 880; g.gain.value = .09; o.connect(g); g.connect(c.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + .18); o.stop(c.currentTime + .2); setTimeout(() => c.close(), 400); } catch (e) {}
  }
  const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  function renderLog() {
    if (!ST.msgs.length) { log.innerHTML = '<p class="xc-empty">' + T('قل مرحباً لمنافسك 👋 — أو اضغط على رسالة سريعة بالأسفل.', 'Say hi to your opponent 👋 — or tap a quick reply below.') + '</p>'; return; }
    log.innerHTML = ST.msgs.map(m => {
      const mine = m.s === ST.side, c = check(m.m);
      return '<div class="xc-m ' + (mine ? 'me' : 'op') + (m.fail ? ' fail' : '') + '"><p>' + (c.ok ? esc(c.txt) : '🚫 ' + T('رسالة محجوبة', 'Blocked message')) + '</p><small>' + (m.fail ? T('لم تُرسل', 'Not sent') : hhmm(m.t)) + '</small></div>';
    }).join('');
    log.scrollTop = log.scrollHeight;
  }
  function setOpen(v) {
    ST.open = v; sh.hidden = !v; btn.classList.toggle('on', v); btn.setAttribute('aria-expanded', v);
    if (v) { ST.unread = 0; paintBadge(); bubble.hidden = true; renderLog(); setTimeout(() => input.focus({ preventScroll: true }), 60); }
  }
  function showBubble(m) {
    const c = check(m.m); if (!c.ok) return;
    bubble.innerHTML = '<span class="bb-av">' + avHtml(ST.opp.av) + '</span><span><b>' + esc(ST.opp.name || T('المنافس', 'Opponent')) + '</b><i>' + esc(c.txt) + '</i></span>';
    bubble.hidden = false; clearTimeout(showBubble.t); showBubble.t = setTimeout(() => { bubble.hidden = true; }, 6500);
    try { if (navigator.vibrate) navigator.vibrate([80, 50, 80]); } catch (e) {}
    if (D.hidden) { const old = D.title.replace(/^💬 .*? — /, ''); D.title = '💬 ' + (ST.opp.name || '') + ' — ' + old; const rs = () => { if (!D.hidden) { D.title = old; D.removeEventListener('visibilitychange', rs); } }; D.addEventListener('visibilitychange', rs); }
  }
  function add(m) {
    if (ST.seen.has(m.k)) return false;
    ST.seen.add(m.k); ST.msgs.push(m); ST.msgs.sort((a, b) => a.t - b.t); ST.msgs = ST.msgs.slice(-60); return true;
  }
  async function send(text) {
    const now = Date.now(); if (now - ST.last < 900) return;
    const c = check(text); if (!c.ok) { if (c.err) APP.say(c.err); return; }
    if (!ST.code) return;
    ST.last = now;
    const k = now.toString(36) + ST.side + Math.random().toString(36).slice(2, 4);
    const m = { k, s: ST.side, m: c.txt, t: now, n: API.name || '' };
    add(m); renderLog(); input.value = '';
    const body = { s: m.s, m: m.m, t: m.t, n: m.n };
    try { await API.db('PATCH', 'rooms/' + ST.code + '/chat', { [k]: body }); }
    catch (e) {
      try { await API.db('PATCH', 'rooms/' + ST.code, { ['cm' + ST.side]: Object.assign({ k }, body) }); }
      catch (e2) { m.fail = true; renderLog(); APP.say(T('تعذّر إرسال الرسالة', 'Could not send the message')); }
    }
  }
  window.armnXoChat = {
    open(code, side, room) {
      ST.code = code; ST.side = side; ST.seen = new Set(); ST.msgs = []; ST.unread = 0; ST.fresh = true; ST.open = false; sh.hidden = true;
      paintBadge(); renderLog(); this.sync(room, side, code);
    },
    close() { ST.code = null; ST.seen = new Set(); ST.msgs = []; ST.unread = 0; sh.hidden = true; ST.open = false; bubble.hidden = true; paintBadge(); },
    sync(room, side, code) {
      if (!room || !ST.code || code !== ST.code) return;
      const meX = side === 'X';
      ST.opp = { name: room[meX ? 'playerOName' : 'playerXName'] || '', av: isInt(room[meX ? 'playerOAvatar' : 'playerXAvatar']) ? +room[meX ? 'playerOAvatar' : 'playerXAvatar'] : 0 };
      const hasOpp = !!room[meX ? 'playerO' : 'playerX'];
      $('.xc-nm', sh).textContent = hasOpp ? (ST.opp.name || T('المنافس', 'Opponent')) : T('بانتظار المنافس…', 'Waiting for opponent…');
      $('.xc-av', sh).innerHTML = hasOpp ? avHtml(ST.opp.av) : '<span class="q">?</span>';
      $('.xc-oav', sh).className = 'xc-oav ring fr-' + ((window.armnFrameOk && window.armnFrameOk(room[meX ? 'playerOFrame' : 'playerXFrame'])) || 'cyan');
      $('.xc-st', sh).textContent = hasOpp ? T('في الغرفة ' + code, 'In room ' + code) : T('أرسل الكود لصديقك', 'Share the code with your friend');
      const incoming = [];
      Object.entries(room.chat || {}).forEach(([k, v]) => { if (v && typeof v.m === 'string' && (v.s === 'X' || v.s === 'O')) incoming.push({ k, s: v.s, m: v.m, t: +v.t || 0, n: v.n }); });
      ['X', 'O'].forEach(s => { const v = room['cm' + s]; if (v && typeof v.m === 'string' && v.k) incoming.push({ k: v.k, s, m: v.m, t: +v.t || 0, n: v.n }); });
      let fresh = false;
      incoming.forEach(m => {
        const isNew = add(m); if (!isNew) return;
        if (m.s !== side && !ST.fresh) { fresh = true; if (!ST.open) ST.unread++; showBubble(m); }
      });
      ST.fresh = false;
      if (fresh) { beep(); paintBadge(); }
      if (ST.open && (incoming.length || fresh)) renderLog();
    }
  };
  btn.addEventListener('click', () => setOpen(!ST.open));
  bubble.addEventListener('click', () => setOpen(true));
  $('.xc-x', sh).addEventListener('click', () => setOpen(false));
  muteB.addEventListener('click', () => { ST.mute = !ST.mute; LS.set('chatmute', ST.mute); paintMute(); });
  $('.xc-send', sh).addEventListener('click', () => send(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(input.value); } e.stopPropagation(); });
  sh.addEventListener('click', e => { const q = e.target.closest('[data-q]'); if (q) send(T(QUICK[+q.dataset.q][0], QUICK[+q.dataset.q][1])); });
  addEventListener('keydown', e => {
    if (!ST.code || e.ctrlKey || e.metaKey || e.altKey) return;
    const tg = (D.activeElement || {}).tagName; if (/INPUT|TEXTAREA|SELECT/.test(tg)) { if (e.key === 'Escape' && ST.open) setOpen(false); return; }
    if (e.key.toLowerCase() === 'c' && onXo()) { e.preventDefault(); setOpen(!ST.open); }
    else if (e.key === 'Escape' && ST.open) { setOpen(false); }
  });
  const onXo = () => curHash() === 'xo';
  addEventListener('hashchange', () => { if (!onXo()) { setOpen(false); bubble.hidden = true; } });
})();

/* ============================================================
   Boot
   ============================================================ */
window.armnRenderProfile = () => { try { renderProfile(); delete RB.cache.points; } catch (e) {} };
function layoutClass() { D.documentElement.classList.toggle('hb-home', onHome()); }
function boot() {
  buildHub(); layoutClass();
  addEventListener('hashchange', () => {
    recordRecent();
    setTimeout(() => { layoutClass(); if (onHome()) { renderGames(); renderProfile(); } }, 90);
  });
  D.addEventListener('langchange', () => {
    const h = $('#hub'); if (h) { h.remove(); hub = null; rankMount = null; buildHub(); }
  });
  addEventListener('online', renderProfile); addEventListener('offline', renderProfile);
  setInterval(() => { if (onHome() && !D.hidden) renderGames(); }, 20000);
  /* pending avatar from a guest session is applied once they log in */
  recordRecent();
}
if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
