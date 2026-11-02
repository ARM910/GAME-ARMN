
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
  home: ['#dba376', '#d3915b', '<path d="M12 3 2.5 11.2c-.4.4-.1 1 .4 1H5v7.3c0 .8.6 1.5 1.5 1.5H10v-5.5h4V21h3.5c.9 0 1.5-.7 1.5-1.5v-7.3h2.1c.5 0 .8-.6.4-1z" fill="url(#§)"/>'],
  trophy: ['#ffe27a', '#ff9d1c', '<path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="url(#§)"/><path d="M7 4.5H4v1A3.5 3.5 0 0 0 7.5 9M17 4.5h3v1A3.5 3.5 0 0 1 16.5 9" fill="none" stroke="url(#§)" stroke-width="1.8" stroke-linecap="round"/><path d="M10.8 13h2.4v3h2.3a1 1 0 0 1 1 1v1.5H7.5V17a1 1 0 0 1 1-1h2.3z" fill="url(#§)"/><rect x="6" y="19" width="12" height="2.2" rx="1.1" fill="url(#§)"/>'],
  users: ['#9ff0ff', '#d99f70', '<circle cx="9" cy="8" r="3.6" fill="url(#§)"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z" fill="url(#§)"/><circle cx="17" cy="9" r="2.8" fill="url(#§)" opacity=".75"/><path d="M16.5 14.2c3 .2 5 2.2 5 5.8h-4.2c0-2.2-.5-4.2-.8-5.8z" fill="url(#§)" opacity=".75"/>'],
  gamepad: ['#ddd3ca', '#dba376', '<path d="M7.5 6h9A5.5 5.5 0 0 1 22 11.5v2.2c0 2-1.3 3.3-3 3.3-1.2 0-2-.6-2.8-1.8l-.5-.7H8.300l-.5.7C7 16.400 6.200 17 5 17c-1.700 0-3-1.300-3-3.300v-2.200A5.500 5.500 0 0 1 7.500 6z" fill="url(#§)"/><path d="M7 9.200v4.200M4.900 11.300h4.200" stroke="#25211f" stroke-width="1.700" stroke-linecap="round"/><circle cx="16" cy="10.300" r="1.150" fill="#25211f"/><circle cx="18.600" cy="12.500" r="1.150" fill="#25211f"/>'],
  bell: ['#dba376', '#d69866', '<path d="M12 2.500a6 6 0 0 0-6 6v3.600c0 .8-.3 1.500-.8 2.100L3.600 16c-.5.600-.1 1.500.7 1.500h15.400c.8 0 1.200-.9.700-1.500l-1.600-1.800a3.200 3.200 0 0 1-.8-2.100V8.500a6 6 0 0 0-6-6z" fill="url(#§)"/><path d="M9.500 19.500a2.600 2.600 0 0 0 5 0z" fill="url(#§)"/>'],
  gear: ['#e4dcd4', '#d89d6d', '<path d="M10.300 2.500h3.400l.5 2.400 1.700.7 2.100-1.300 2.400 2.400-1.300 2.100.7 1.700 2.400.5v3.400l-2.400.5-.7 1.700 1.300 2.100-2.400 2.400-2.100-1.300-1.700.7-.5 2.400h-3.400l-.5-2.400-1.700-.7-2.100 1.300-2.400-2.400 1.300-2.100-.7-1.700-2.400-.5v-3.400l2.400-.5.7-1.700-1.300-2.100 2.400-2.400 2.100 1.300 1.700-.7z" fill="url(#§)"/><circle cx="12" cy="12" r="3.200" fill="#25211f"/>'],
  coin: ['#fff08a', '#ffa21a', '<circle cx="12" cy="12" r="9.500" fill="url(#§)"/><circle cx="12" cy="12" r="6.800" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.300"/><path d="M12 7.400l1.500 3.100 3.400.5-2.500 2.400.6 3.400-3-1.600-3 1.600.6-3.400L7.100 11l3.400-.5z" fill="#b86a00" opacity=".85"/>'],
  crown: ['#ffe680', '#ff9a1f', '<path d="M3 8l4.500 4L12 5l4.500 7L21 8l-1.800 11H4.800z" fill="url(#§)"/><rect x="5" y="19.500" width="14" height="2.100" rx="1" fill="url(#§)"/><circle cx="3" cy="8" r="1.400" fill="url(#§)"/><circle cx="21" cy="8" r="1.400" fill="url(#§)"/><circle cx="12" cy="4.600" r="1.500" fill="url(#§)"/>'],
  bag: ['#e1d8d0', '#daa274', '<path d="M5 8h14l1 12.500H4z" fill="url(#§)"/><path d="M8.500 8V6.500a3.500 3.500 0 0 1 7 0V8" fill="none" stroke="url(#§)" stroke-width="1.800" stroke-linecap="round"/><path d="M9 12.500a3 3 0 0 0 6 0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.500" stroke-linecap="round"/>'],
  help: ['#e1d8d0', '#dba376', '<circle cx="12" cy="12" r="9.500" fill="url(#§)"/><path d="M9.300 9.700a2.800 2.800 0 1 1 4.300 2.300c-.9.600-1.600 1.100-1.600 2.100M12 16.700v.1" fill="none" stroke="#25211f" stroke-width="2.100" stroke-linecap="round"/>'],
  logout: ['#ffc2c2', '#ff6a6a', '<path d="M10 3.500H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h4" fill="none" stroke="url(#§)" stroke-width="2" stroke-linecap="round"/><path d="M15 7.500 19.500 12 15 16.500M19 12H9.500" fill="none" stroke="url(#§)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'],
  user: ['#9ff0ff', '#d69866', '<circle cx="12" cy="8" r="4.200" fill="url(#§)"/><path d="M4 21c0-4.200 3.600-7 8-7s8 2.800 8 7z" fill="url(#§)"/>'],
  image: ['#8ef0d0', '#d3915b', '<rect x="2.500" y="4" width="19" height="16" rx="3" fill="url(#§)"/><circle cx="8.500" cy="9.500" r="1.800" fill="#25211f"/><path d="m3 17 5-5 4 4 3-3 6 5v1.500H3z" fill="#25211f" opacity=".55"/>'],
  bolt: ['#a6ffb0', '#16d27a', '<path d="M13.500 2 4.500 13.500h6L9.500 22l10-12.500h-6.200z" fill="url(#§)"/>'],
  globe: ['#ddd4cb', '#d99f70', '<circle cx="12" cy="12" r="9.500" fill="url(#§)"/><path d="M2.500 12h19M12 2.500c3.200 3 3.200 16 0 19M12 2.500c-3.200 3-3.200 16 0 19M4.500 7.500h15M4.500 16.500h15" fill="none" stroke="#25211f" stroke-opacity=".5" stroke-width="1.200"/>'],
  send: ['#dba376', '#d3915b', '<path d="M21.500 3 3 10.500l6.600 2.700L12 20.500z" fill="url(#§)"/><path d="m9.600 13.200 11-10" stroke="#25211f" stroke-opacity=".45" stroke-width="1.300" fill="none"/>'],
  chat: ['#9ff0ff', '#d69866', '<path d="M4 4.500h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" fill="url(#§)"/><circle cx="8" cy="11" r="1.200" fill="#25211f"/><circle cx="12" cy="11" r="1.200" fill="#25211f"/><circle cx="16" cy="11" r="1.200" fill="#25211f"/>'],
  camera: ['#ffffff', '#e3dcd4', '<path d="M8.500 4.500h7l1.500 2H20a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.500a2 2 0 0 1 2-2h3z" fill="url(#§)"/><circle cx="12" cy="13" r="3.600" fill="#25211f"/><circle cx="12" cy="13" r="1.600" fill="#d3915b"/>'],
  close: ['#f1ede9', '#dba376', '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="url(#§)" stroke-width="2.400" stroke-linecap="round"/>'],
  check: ['#aaffd0', '#1fdc8a', '<path d="M4.500 12.500 9.500 17.500 19.500 6.500" fill="none" stroke="url(#§)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'],
  plus: ['#aaffd0', '#1fdc8a', '<path d="M12 5v14M5 12h14" fill="none" stroke="url(#§)" stroke-width="2.600" stroke-linecap="round"/>'],
  sound: ['#dba376', '#d69866', '<path d="M3 9.500v5h3.500L12 19V5L6.500 9.500z" fill="url(#§)"/><path d="M15.500 8.500a5 5 0 0 1 0 7M18 6a8.500 8.500 0 0 1 0 12" fill="none" stroke="url(#§)" stroke-width="1.800" stroke-linecap="round"/>'],
  mute: ['#d4cdc6', '#9d8c7e', '<path d="M3 9.500v5h3.500L12 19V5L6.500 9.500z" fill="url(#§)"/><path d="m16 9.500 5 5M21 9.500l-5 5" fill="none" stroke="url(#§)" stroke-width="2" stroke-linecap="round"/>'],
  dice: ['#ede8e2', '#dba376', '<rect x="3" y="3" width="18" height="18" rx="4.500" fill="url(#§)"/><circle cx="8.500" cy="8.500" r="1.600" fill="#25211f"/><circle cx="15.500" cy="8.500" r="1.600" fill="#25211f"/><circle cx="12" cy="12" r="1.600" fill="#25211f"/><circle cx="8.500" cy="15.500" r="1.600" fill="#25211f"/><circle cx="15.500" cy="15.500" r="1.600" fill="#25211f"/>'],
  play: ['#aaffd0', '#16d27a', '<path d="M7 4.500v15l13-7.500z" fill="url(#§)"/>'],
  star: ['#fff08a', '#ffa21a', '<path d="m12 2.800 2.800 5.900 6.400.9-4.700 4.500 1.200 6.400L12 17.400l-5.700 3.100 1.200-6.400-4.700-4.500 6.400-.9z" fill="url(#§)"/>'],
  wifi: ['#9bffc9', '#1fdc8a', '<path d="M2.500 9a14 14 0 0 1 19 0M5.500 12.500a9.500 9.500 0 0 1 13 0M8.500 16a5 5 0 0 1 7 0" fill="none" stroke="url(#§)" stroke-width="2.200" stroke-linecap="round"/><circle cx="12" cy="19.300" r="1.600" fill="url(#§)"/>'],
  chev: ['#f1ede9', '#dba376', '<path d="M9 5l7 7-7 7" fill="none" stroke="url(#§)" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/>'],
  expand: ['#f1ede9', '#dba376', '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="url(#§)" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/>'],
  lang: ['#e1d8d0', '#d99f70', '<circle cx="12" cy="12" r="9.500" fill="none" stroke="url(#§)" stroke-width="1.900"/><path d="M3 12h18M12 3c2.800 2.800 2.800 15.200 0 18M12 3c-2.800 2.800-2.800 15.200 0 18" fill="none" stroke="url(#§)" stroke-width="1.500"/>'],
  key: ['#ffe27a', '#ff9d1c', '<circle cx="8" cy="12" r="4.500" fill="url(#§)"/><circle cx="8" cy="12" r="1.700" fill="#25211f"/><path d="M12 12h9v3M17 12v3" fill="none" stroke="url(#§)" stroke-width="2.200" stroke-linecap="round"/>'],
  info: ['#e1d8d0', '#dba376', '<circle cx="12" cy="12" r="9.500" fill="url(#§)"/><path d="M12 11v5.500M12 7.600v.1" stroke="#25211f" stroke-width="2.300" stroke-linecap="round"/>']
};
function ic(name, cls) {
  const d = UI[name]; if (!d) return '';
  const id = 'hi' + (++uidN);
  return '<svg class="ic ic-' + name + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + d[0] + '"/><stop offset="1" stop-color="' + d[1] + '"/></linearGradient></defs>' + d[2].replace(/§/g, id) + '</svg>';
}

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
/* verified tick shown next to the owner's name */
const VERIFIED = '<svg class="vf" viewBox="0 0 24 24" width="18" height="18" role="img" aria-label="' + T('حساب موثّق', 'Verified') + '"><circle cx="12" cy="12" r="10.5" fill="#1d9bf0"/><path d="M7.4 12.4l3.2 3.2 6-6.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* ===== OWNER ACCOUNTS ("حساباتي"): put your links here — [arabic label, english label, url]. Empty list = button hidden ===== */
const OWNER_LINKS = [
  /* ['انستغرام', 'Instagram', 'https://instagram.com/YOUR_NAME'], */
  /* ['تيك توك', 'TikTok', 'https://tiktok.com/@YOUR_NAME'], */
];
const autoAv = name => { let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 15; };
const isInt = v => v !== null && v !== undefined && v !== '' && Number.isInteger(+v);
const avHtml = i => window.armnAvatarHtml ? window.armnAvatarHtml(isInt(i) ? +i : 0) : '';
const avPh = name => { const k = String(name || '').toLowerCase(); return '<span class="av-ph" data-avn="' + esc(k) + '">' + esc((k.trim()[0] || '?').toUpperCase()) + '</span>'; };
let avT = 0;
const hydrateAv = () => {
  avT = 0; const els = $$('.av-ph[data-avn]:not([data-avd])'); if (!els.length) return;
  els.forEach(e => { e.dataset.avd = '1'; });
  const names = [...new Set(els.map(e => e.dataset.avn))].filter(validName).slice(0, 40);
  Promise.all(names.map(async n => { const row = { name: n }; try { await resolveAv([row]); } catch (e) {} return row; })).then(rows => rows.forEach(r => {
    if (!isInt(r.av)) return;
    $$('.av-ph[data-avn]').forEach(e => { if (e.dataset.avn === r.name && e.isConnected) e.outerHTML = avHtml(+r.av); });
  }));
};
window.armnRankAvatar = (name, av) => {
  const mu = user(); if (mu && APP.name && name === APP.name && isInt(mu.avatar)) return avHtml(+mu.avatar);
  if (isInt(av)) return avHtml(+av);
  const k = String(name || '').toLowerCase(), c = RB.avc && RB.avc[k];
  if (isInt(c) && Date.now() - ((RB.avt && RB.avt[k]) || 0) < 120000) return avHtml(+c);
  if (validName(k)) { clearTimeout(avT); avT = setTimeout(hydrateAv, 60); }
  return avPh(name);
};
window.armnRankBust = () => { RB.cache = {}; RB.avc = {}; RB.frc = {}; try { refreshRank(); } catch (e) {} };
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
const curHash = () => (location.hash || '').replace('#', '');
const onHome = () => !D.documentElement.classList.contains('imm');
function needLogin(msg) {
  if (APP.loggedIn) return false;
  APP.say(msg || T('سجّل دخولك أولاً', 'Log in first')); APP.auth('in'); return true;
}
function gotoOnline(mode) {
  if (needLogin(T('سجّل دخولك أولاً للعب أونلاين', 'Log in first to play online'))) return;
  if (window.armnXoLobby) window.armnXoLobby(mode);   /* opens the room sheet right here on the home screen */
}
function scrollTo(sel) { const el = $(sel); if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
/* ============================================================
   RANKING — avatars next to every score
   ============================================================ */
const RB = { cache: {}, avc: {}, frc: {}, avt: {} };
const RKS = new Set(); /* every ranking list currently mounted (home panel + opened sheet) so a change refreshes all of them */
const BADN = ['__proto__', 'constructor', 'prototype', 'hasownproperty', 'tostring'];
const validName = n => /^[a-z0-9_]{3,16}$/.test(n) && !BADN.includes(n);
const dbGet = (p, q) => API.db('GET', p, undefined, { auth: false, q });

/* ============================================================
   GLOBAL RANKING — one list only: players ordered by online wins
   Firebase: lb/online_xo/<id> = { name, wins, av, fr, ... }
   ============================================================ */
const _allPtsRef = { t: 0, p: null };
function allPts() {
  if (_allPtsRef.p && Date.now() - _allPtsRef.t < 60000) return _allPtsRef.p;
  const p = dbGet('lb/points').then(d => d || {}).catch(() => { if (_allPtsRef.p === p) _allPtsRef.p = null; return {}; });
  _allPtsRef.t = Date.now(); _allPtsRef.p = p; return p;
}
async function resolveAv(rows) {
  const frOk = x => (window.armnFrameOk ? window.armnFrameOk(x) : '');
  await Promise.all(rows.map(async r => {
    const mu = user(); if (mu && APP.name && r.name === APP.name) { r.av = isInt(mu.avatar) ? +mu.avatar : 0; r.fr = frOk(mu.fr) || r.fr || ''; RB.avc[r.name] = r.av; RB.frc[r.name] = r.fr; return; }
    if (r.fr !== undefined && isInt(r.av)) { r.av = +r.av; r.fr = frOk(r.fr); RB.avc[r.name] = r.av; RB.frc[r.name] = r.fr; return; }
    if (r.name in RB.avc && r.name in RB.frc && Date.now() - (RB.avt[r.name] || 0) < 120000) { const cv = RB.avc[r.name]; r.av = isInt(cv) ? +cv : (isInt(r.av) ? +r.av : null); if (r.fr === undefined) r.fr = RB.frc[r.name]; return; }
    if (!validName(r.name)) { RB.avc[r.name] = null; RB.frc[r.name] = ''; r.av = isInt(r.av) ? +r.av : null; r.fr = r.fr || ''; return; }
    let v = null; try { const all = await allPts(); v = all && all[r.name] || null; } catch (e) {}
    if (!v) { try { v = await dbGet('lb/points/' + r.name); } catch (e) {} }
    RB.avc[r.name] = v && isInt(v.av) ? +v.av : null; RB.frc[r.name] = frOk(v && v.fr); RB.avt[r.name] = Date.now();
    r.av = isInt(RB.avc[r.name]) ? +RB.avc[r.name] : (isInt(r.av) ? +r.av : null); if (r.fr === undefined) r.fr = RB.frc[r.name];
  }));
}
async function fetchBoard() {
  const c = RB.cache.wins; if (c && Date.now() - c.t < 45000) return c.rows;
  let d; try { d = await dbGet('lb/online_xo', 'orderBy=%22wins%22&limitToLast=300'); } catch (e) { d = await dbGet('lb/online_xo'); }
  const g = new Map();
  Object.entries(d || {}).forEach(([k, v]) => {
    if (!v || !Number.isFinite(+v.wins) || +v.wins <= 0) return;
    const name = String(v.name || k).slice(0, 24), o = g.get(name) || { score: 0, av: null, fr: undefined };
    o.score += +v.wins; if (isInt(v.av)) o.av = +v.av; g.set(name, o);
  });
  const rows = [...g].map(([name, o]) => ({ name, score: o.score, av: o.av })).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, 300);
  await resolveAv(rows);
  RB.cache.wins = { t: Date.now(), rows };
  return rows;
}
const avWrap = r => { const a = '<span class="rk-av">' + window.armnRankAvatar(r.name, r.av) + '</span>'; return r.fr && r.fr !== 'none' ? '<span class="rk-avr ring fr-' + r.fr + '">' + a + '</span>' : a; };
function rowsHtml(rows, opts) {
  opts = opts || {};
  const myName = APP.name, lim = opts.limit || 300;
  return rows.slice(0, lim).map((r, i) =>
    '<div class="rk-row r' + (i + 1) + (r.name === myName ? ' me' : '') + '"' + (validName(r.name) ? ' data-p="' + esc(r.name) + '" tabindex="0" role="button" aria-label="' + T('فتح بروفايل ', 'Open profile of ') + esc(r.name) + '"' : '') + '>' +
    '<span class="rk-n">' + (i + 1) + '</span>' + avWrap(r) + '<span class="rk-nm"><b><span class="rk-t">' + esc(r.name) + '</span></b></span>' +
    '<span class="rk-sc">' + r.score + ' <small>' + T('فوز', 'wins') + '</small></span></div>').join('');
}
const skeleton = n => Array.from({ length: n }, () => '<div class="rk-row sk"><span class="rk-n"></span><span class="rk-av"></span><span class="rk-nm"><b></b></span><span class="rk-sc"></span></div>').join('');

function mountRank(host, o) {
  o = o || {};
  const st = { busy: 0 };
  host.innerHTML = '<div class="rk"><div class="rk-head"><span>#</span><span>' + T('اللاعب', 'Player') + '</span><span class="rk-h-sc">' + T('الانتصارات', 'Wins') + '</span></div><div class="rk-list" aria-live="polite"></div><div class="rk-foot"></div></div>';
  const list = $('.rk-list', host), foot = $('.rk-foot', host);
  async function load() {
    const my = ++st.busy;
    list.innerHTML = skeleton(Math.min(o.limit || 10, 6)); foot.innerHTML = '';
    try {
      const rows = await fetchBoard(); if (my !== st.busy) return;
      list.innerHTML = rows.length ? rowsHtml(rows, o) : '<p class="hb-empty">' + T('لا يوجد ترتيب بعد — اربح أول مباراة أونلاين!', 'No ranking yet — win the first online match!') + '</p>';
      if (o.more && rows.length > (o.limit || 10)) foot.innerHTML = '<button type="button" class="hb-btn ghost block" data-act="rank">' + T('عرض التصنيف الكامل', 'Open full ranking') + ' ' + ic('chev', 'flipx') + '</button>';
      const me = APP.name && rows.findIndex(r => r.name === APP.name);
      if (APP.loggedIn && me >= (o.limit || 10)) foot.insertAdjacentHTML('afterbegin', '<p class="rk-note">' + T('ترتيبك: #', 'Your rank: #') + (me + 1) + ' · ' + rows[me].score + ' ' + T('فوز', 'wins') + '</p>');
    } catch (e) {
      if (my !== st.busy) return;
      list.innerHTML = '<p class="hb-empty">' + T('تعذّر تحميل التصنيف. تحقق من الاتصال.', 'Could not load the ranking. Check your connection.') + '</p><button type="button" class="hb-btn ghost block" data-retry>' + T('إعادة المحاولة', 'Retry') + '</button>';
    }
  }
  host.addEventListener('click', e => {
    if (e.target.closest('[data-retry]')) { load(); return; }
    const pr = e.target.closest('[data-p]'); if (pr && host.contains(pr)) openProfile(pr.dataset.p, o.back || null);
  });
  host.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-p]')) { e.preventDefault(); e.target.click(); } });
  load();
  const inst = { reload() { delete RB.cache.wins; load(); } };
  RKS.add({ host, inst });
  return inst;
}
/* ===== player profile: opened from any ranking row ===== */
async function openProfile(name, back) {
  if (!validName(name)) return;
  const mine = APP.name && name === APP.name, mu = user();
  const host = D.createElement('div'); host.className = 'pf';
  host.innerHTML = '<div class="pf-hero"><div class="pf-cover" aria-hidden="true"></div><span class="ring fr-none pf-ring"><span class="pf-av"></span></span><h4 class="pf-nm"></h4><div class="pf-badges"></div><p class="pf-bio" hidden></p><div class="pf-xpw" hidden></div></div><div class="pf-stats"></div><div class="pf-act"></div>';
  sheet(T('بروفايل اللاعب', 'Player profile'), host, 'profile');
  $('.pf-nm', host).textContent = name;
  const isOwn = /^\s*yakuza\s*$/i.test(name); if (isOwn) $('.pf-nm', host).insertAdjacentHTML('beforeend', ' ' + VERIFIED);
  const paintLv = tot => { const lv = lvInfo(tot); $('.pf-badges', host).innerHTML = '<span class="pf-lv">Lv. ' + lv.lvl + '</span><span class="pf-t">' + titleOf(tot) + '</span>' + (mine ? '<span class="pf-t">' + T('أنت', 'You') + '</span>' : ''); const w = $('.pf-xpw', host); w.hidden = false; w.innerHTML = '<div class="pf-xp"><i style="width:' + lv.pct + '%"></i></div><span class="pf-xpt">' + lv.cur + ' / ' + lv.need + ' XP</span>'; };
  if (mine && mu) { paintLv(mu.tot | 0); const bio = LS.get('bio', ''); const b = $('.pf-bio', host); if (bio) { b.textContent = bio; b.hidden = false; } }
  if (/^\s*yakuza\s*$/i.test(name)) { host.classList.add('pf-owner'); $('.pf-hero', host).insertAdjacentHTML('beforeend', '<span class="pf-tag">' + T('✦ المالك والمطوّر ✦', '✦ Owner & developer ✦') + '</span>'); }
  $('.pf-av', host).innerHTML = window.armnRankAvatar(name, mine && mu && isInt(mu.avatar) ? +mu.avatar : null);
  let pts = mine && mu ? mu.tot | 0 : 0;
  try {
    const v = await dbGet('lb/points/' + name);
    if (v) {
      const row = { name, av: isInt(v.av) ? +v.av : null, fr: window.armnFrameOk ? window.armnFrameOk(v.fr) : '' }; await resolveAv([row]);
      if (isInt(row.av)) $('.pf-av', host).innerHTML = avHtml(+row.av);
      $('.pf-ring', host).className = 'ring pf-ring fr-' + (row.fr && row.fr !== 'none' ? row.fr : 'none');
      if (isInt(v.pts) && !(mine && mu)) paintLv(+v.pts);
      pts = isInt(v.pts) ? +v.pts : (mine && mu ? mu.tot | 0 : 0);
      const cvId = window.armnCoverOk ? window.armnCoverOk(v.cv) : '';
      if (cvId && cvId !== 'none' && window.armnCoverHtml) { const cvEl = $('.pf-cover', host); cvEl.insertAdjacentHTML('afterbegin', window.armnCoverHtml(cvId)); cvEl.classList.add('has-cv'); }
    }
  } catch (e) {}
  const stats = $('.pf-stats', host);
  const stat = (id, icn, v, l) => '<div class="pf-s" id="' + id + '"><i class="pf-si">' + icn + '</i><b>' + v + '</b><small>' + l + '</small></div>';
  stats.innerHTML = stat('pfWins', '🏆', '…', T('انتصارات أونلاين', 'Online wins')) + stat('pfRank', '🌍', '…', T('التصنيف العالمي', 'Global rank')) + stat('pfPts', '⭐', pts, T('إجمالي النقاط', 'Total points'));
  try {
    const rows = await fetchBoard(); const i = rows.findIndex(r => r.name === name);
    $('#pfWins b', host).textContent = i >= 0 ? rows[i].score : 0;
    $('#pfRank b', host).textContent = i >= 0 ? '#' + (i + 1) : '—';
    if (i >= 0 && i < 3) $('#pfRank', host).classList.add('pf-top');
  } catch (e) { $('#pfWins b', host).textContent = '—'; $('#pfRank b', host).textContent = '—'; }
  const act = $('.pf-act', host);
  if (back) { act.innerHTML = '<button type="button" class="hb-btn ghost" data-pf-back>' + T('رجوع للتصنيف', 'Back to ranking') + '</button>'; act.addEventListener('click', e => { if (e.target.closest('[data-pf-back]')) back(); }); }
}

window.armnOpenProfile = openProfile;
/* frames only animate while visible (big saving in long rankings); weak devices drop the particle layers */
(function () {
  try { if ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2) D.documentElement.classList.add('lowfx'); } catch (e) {}
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('fr-off', !e.isIntersecting)), { rootMargin: '80px' });
  const seen = new WeakSet(); let q = 0;
  const scan = () => { q = 0; D.querySelectorAll('.ring[class*="fr-"]').forEach(el => { if (!seen.has(el)) { seen.add(el); io.observe(el); } }); };
  new MutationObserver(() => { if (!q) q = requestAnimationFrame(scan); }).observe(D.body, { childList: true, subtree: true });
  scan();
})();
window.armnOpenRanking = () => {
  const host = D.createElement('div');
  sheet(T('التصنيف العالمي', 'Global ranking'), host, 'rank');
  mountRank(host, { limit: 300, back: () => window.armnOpenRanking() });
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
      APP.setAvatar(st.sel); APP.setFrame(st.frame); APP.say(T('تم حفظ التغييرات ✓', 'Saved ✓')); RB.cache = {}; RB.avc = {}; RB.frc = {}; renderProfile(); refreshRank();
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
  { const c0 = window.armnCoverOk ? window.armnCoverOk(u && u.cv) : '', cvk = c0 && c0 !== 'none' ? c0 : '';
    $$('.pc-cover').forEach(el => { if (el.dataset.cv === cvk) return; el.dataset.cv = cvk; el.innerHTML = cvk ? window.armnCoverHtml(cvk) : ''; el.classList.toggle('has-cv', !!cvk); }); }
  $$('.js-name').forEach(el => { el.textContent = name || T('زائر', 'Guest'); });
  $$('.js-vf').forEach(el => { el.innerHTML = name && /^\s*yakuza\s*$/i.test(name) ? VERIFIED : ''; });
  $$('.pc').forEach(el => el.classList.toggle('pc-owner', !!name && /^\s*yakuza\s*$/i.test(name)));
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
   HOME — two big buttons (create room / join room) + one global ranking
   ============================================================ */
let hub, rankMount = null;
const refreshRank = () => { RKS.forEach(r => { if (!D.body.contains(r.host)) { RKS.delete(r); return; } try { r.inst.reload(); } catch (e) {} }); };
function buildHub() {
  const home = $('#home'); if (!home || $('#hub')) return;
  hub = D.createElement('div'); hub.id = 'hub'; hub.className = 'hub xh';
  hub.innerHTML =
  '<header class="xh-top">' +
    '<b class="xh-brandmini">GAME <i>ARMN</i></b>' +
    '<div class="xh-tools">' +
      '<button type="button" class="ib" data-act="shop" aria-label="' + T('المتجر', 'Shop') + '">' + ic('bag') + '</button>' +
      '<button type="button" class="ib" data-act="avatar" aria-label="' + T('تغيير الصورة', 'Change portrait') + '">' + ic('image') + '</button>' +
      '<button type="button" class="ib" data-act="settings" aria-label="' + T('الإعدادات', 'Settings') + '">' + ic('gear') + '</button>' +
    '</div>' +
  '</header>' +
  '<section class="pc xh-pc" data-act="mobileme" role="button" tabindex="0" aria-label="' + T('قائمة اللاعب', 'Player menu') + '">' +
    '<div class="pc-top"><span class="ring js-ring pc-ring fr-gold"><span class="js-av"></span></span></div>' +
    '<h3 class="pc-name"><span class="js-name"></span><span class="js-vf"></span></h3>' +
    '<p class="pc-bio"><span class="js-title"></span> · <span class="js-bio"></span></p>' +
    '<div class="pc-row js-user"><span class="coinp js-coins"></span></div>' +
    '<div class="pc-lv js-user"><span class="lvb"><ins>' + ic('star') + '</ins><b class="js-lv"></b></span><div class="xp"><div class="xp-bar js-bar"></div></div><span class="xp-n js-xp"></span></div>' +
    '<div class="pc-guest js-guest"><p>' + T('سجّل دخولك لتلعب أونلاين وتظهر في التصنيف العالمي.', 'Log in to play online and appear in the global ranking.') + '</p><button type="button" class="hb-btn primary" data-act="login">' + ic('key') + ' ' + T('دخول', 'Log in') + '</button></div>' +
    '<span class="xh-pc-more" aria-hidden="true">' + ic('gear') + '</span>' +
  '</section>' +
  '<section class="xh-hero">' +
    '<h1 class="hl" aria-label="GAME ARMN"><span class="hl-crown" aria-hidden="true">' + ic('crown') + '</span>' +
    '<span class="hl-g" aria-hidden="true"><span style="--i:0">G</span><span style="--i:1">A</span><span style="--i:2">M</span><span style="--i:3">E</span></span>' +
    '<span class="hl-a" aria-hidden="true"><span style="--i:0">A</span><span style="--i:1">R</span><span style="--i:2">M</span><span style="--i:3">N</span></span></h1>' +
    '<p class="hl-by"><b class="x">X</b><span>By <b>Ahmed Abu Muslim</b></span><b class="o">O</b></p>' +
    '<p class="xh-tag">' + T('إكس-أو أونلاين — قطعك تختفي، فكّر قبل ما تلعب', 'Online X-O — your pieces vanish, think before you move') + '</p>' +
  '</section>' +
  '<section class="xh-actions" aria-label="' + T('ابدأ اللعب', 'Start playing') + '">' +
    '<button type="button" class="xh-btn create" data-act="create"><span class="xh-ic">' + ic('plus') + '</span><b>' + T('إنشاء غرفة', 'Create room') + '</b><small>' + T('أنشئ غرفة وأرسل الكود لصديقك', 'Make a room and send the code to a friend') + '</small></button>' +
    '<button type="button" class="xh-btn join" data-act="join"><span class="xh-ic">' + ic('key') + '</span><b>' + T('انضمام لغرفة', 'Join room') + '</b><small>' + T('عندك كود؟ ادخل الغرفة مباشرة', 'Have a code? Jump straight in') + '</small></button>' +
  '</section>' +
  '<p class="xh-solo"><button type="button" class="hb-link" data-act="solo">' + T('أو تدرّب ضد الكمبيوتر', 'or practice against the computer') + '</button></p>' +
  '<button type="button" class="xh-jelly" data-act="jelly"><span class="jl-em" aria-hidden="true">😋</span><span><b>' + T('جيلي بِت — ابلع واكبر', 'Jelly Pit — Eat & Grow') + '</b><small>' + T('تحكّم بحفرة جيلي، ابلع الحلويات وتفوّق على المنافسين', 'Steer a jelly hole, swallow sweets and out-grow rivals') + '</small></span><i class="jl-new">' + T('جديد', 'NEW') + '</i></button>' +
  '<section class="xh-rank" id="pnRank"><header class="xh-rank-h">' + ic('trophy') + '<h2>' + T('التصنيف العالمي', 'Global ranking') + '</h2><small>' + T('حسب عدد الانتصارات أونلاين', 'by online wins') + '</small></header><div id="pnRankBody"></div></section>' +
  '<div class="xh-owner-slot"></div>' +
  '<footer class="xh-wa"><a class="xh-wa-a" href="https://wa.me/962780653596" target="_blank" rel="noopener noreferrer" aria-label="' + T('تواصل عبر واتساب', 'Contact on WhatsApp') + '"><svg class="xh-wa-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg><span class="xh-wa-t"><small>' + T('تواصل معنا عبر واتساب', 'Contact us on WhatsApp') + '</small><b dir="ltr">+962 78 065 3596</b></span></a></footer>';
  home.prepend(hub);
  { const slot = $('.xh-owner-slot', hub); if (slot) slot.outerHTML = '<section class="oc" aria-label="' + T('المطوّر', 'Developer') + '"><span class="oc-av" aria-hidden="true">A</span><div class="oc-t"><b>' + T('أحمد أبو مسلم', 'Ahmed Abu Muslim') + ' ' + VERIFIED + '</b><small>' + T('مطوّر ومالك اللعبة', 'Developer & game owner') + '</small></div>' + (OWNER_LINKS.length ? '<button type="button" class="oc-btn" data-act="accounts">' + ic('user') + '<span>' + T('حساباتي', 'My accounts') + '</span></button>' : '') + '</section>'; }
  hub.addEventListener('keydown', e => { const c = e.target.closest && e.target.closest('.xh-pc'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); act('mobileme'); } });
  rankMount = mountRank($('#pnRankBody'), { limit: 10, more: true });
  renderProfile();
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
      '<button type="button" class="st" data-s="help">' + ic('help') + '<span>' + T('الاختصارات والمساعدة', 'Shortcuts & help') + '</span></button></div>' + perfBlock();
  };
  const perfBlock = () => {
    const P = window.ARMN_PERF ? ARMN_PERF.get() : { fps: 60, mode: 'normal' };
    const fp = n => '<button type="button" data-fps="' + n + '" aria-pressed="' + (P.fps === n) + '">' + n + '</button>';
    return '<h4 class="hp-h" style="margin:14px 0 8px">' + T('الأداء', 'Performance') + '</h4><div class="pfb-bar pfb-in">' +
      '<div class="pfb-g"><span class="pfb-l">' + T('الفريمات', 'FPS') + '</span><div class="pfb-seg">' + fp(30) + fp(60) + fp(90) + '</div></div>' +
      '<div class="pfb-g"><button type="button" class="pfb-m" data-m="lite" aria-pressed="' + (P.mode === 'lite') + '" title="' + T('تبسيط الموقع للهواتف الضعيفة', 'Simplify the site for weak phones') + '">' + T('🪶 تبسيط', '🪶 Lite') + '</button>' +
      '<button type="button" class="pfb-m u" data-m="ultra" aria-pressed="' + (P.mode === 'ultra') + '" title="' + T('كل المؤثرات بأعلى فريمات', 'All effects at the highest frame rate') + '">' + T('⚡ فائق', '⚡ Ultra') + '</button></div></div>';
  };
  draw();
  h.addEventListener('click', e => {
    const pb = e.target.closest('.pfb-in [data-fps], .pfb-in [data-m]');
    if (pb && window.ARMN_PERF) {
      const P = ARMN_PERF.get();
      if (pb.dataset.fps) ARMN_PERF.set({ fps: +pb.dataset.fps });
      else ARMN_PERF.set({ mode: P.mode === pb.dataset.m ? 'normal' : pb.dataset.m });
      draw(); return;
    }
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
    k('C', 'إنشاء غرفة', 'Create a room') + k('J', 'انضمام لغرفة بكود', 'Join a room by code') + k('L', 'التصنيف العالمي', 'Global ranking') + k('S', 'المتجر', 'Shop') + k('A', 'تغيير الصورة', 'Change portrait') + k('?', 'هذه النافذة', 'This window') + '</ul>' +
    '<h4 class="hp-h">' + T('داخل X-O', 'Inside X-O') + '</h4><ul class="hp">' + k('1 – 9', 'ضع قطعتك في الخانة', 'Place your piece') + k('Z', 'تراجع', 'Undo') + k('H', 'تلميح', 'Hint') + k('N', 'جولة جديدة', 'New round') + k('C', 'فتح الدردشة (أونلاين)', 'Open chat (online)') + '</ul>' +
    '', 'small');
}
function accountOrLogin() { if (APP.loggedIn) APP.acct(); else APP.auth('in'); }
function mobileMe() {
  const h = D.createElement('div');
  const u = user(), lv = lvInfo(u ? u.tot | 0 : 0);
  h.innerHTML = '<div class="mm-card"><span class="ring js-ring fr-gold mm-ring"><span class="js-av"></span></span><b class="mm-n"><span class="js-name"></span><span class="js-vf"></span></b><small class="js-title"></small>' +
    (APP.loggedIn ? '<div class="pc-lv"><span class="lvb"><ins>' + ic('star') + '</ins><b class="js-lv"></b></span><div class="xp"><div class="xp-bar js-bar"></div></div><span class="xp-n js-xp"></span></div><span class="coinp js-coins"></span>' : '<p class="hb-empty">' + T('سجّل دخولك لحفظ تقدمك ونقاطك.', 'Log in to save your progress.') + '</p>') + '</div>' +
    '<div class="st-list">' + (APP.loggedIn ? '' : '<button type="button" class="st hi" data-m="login">' + ic('key') + '<span>' + T('دخول / حساب جديد', 'Log in / Sign up') + '</span></button>') +
    (APP.loggedIn ? '<button type="button" class="st hi" data-m="myprofile">' + ic('user') + '<span>' + T('بروفايلي', 'My profile') + '</span></button>' : '') +
    '<button type="button" class="st" data-m="avatar">' + ic('image') + '<span>' + T('تغيير الصورة', 'Change portrait') + '</span></button>' +
    (APP.loggedIn ? '<button type="button" class="st" data-m="shop">' + ic('bag') + '<span>' + T('المتجر', 'Shop') + '</span></button><button type="button" class="st" data-m="account">' + ic('user') + '<span>' + T('معلومات الحساب', 'Account info') + '</span></button>' : '') +
    '<button type="button" class="st" data-m="settings">' + ic('gear') + '<span>' + T('الإعدادات', 'Settings') + '</span></button><button type="button" class="st" data-m="help">' + ic('help') + '<span>' + T('الاختصارات والمساعدة', 'Shortcuts & help') + '</span></button>' +
    (APP.loggedIn ? '<button type="button" class="st danger" data-m="logout">' + ic('logout') + '<span>' + T('تسجيل الخروج', 'Log out') + '</span></button>' : '') + '</div>';
  h.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; closeSheet(); setTimeout(() => act(b.dataset.m), 60); });
  sheet(T('قائمة اللاعب', 'Player menu'), h, 'small'); renderProfile();
}
function act(a) {
  switch (a) {
    case 'create': gotoOnline('create'); break;
    case 'join': gotoOnline('join'); break;
    case 'solo': location.hash = '#xo'; break;
    case 'jelly': if (window.armnJelly) window.armnJelly.open(); break;
    case 'myprofile': if (APP.loggedIn && APP.name) openProfile(APP.name); break;
    case 'accounts': { const h = D.createElement('div'); h.className = 'oc-list'; h.innerHTML = OWNER_LINKS.map(l => '<a class="st" target="_blank" rel="noopener noreferrer" href="' + esc(l[2]) + '">' + ic('user') + '<span>' + T(l[0], l[1]) + '</span></a>').join(''); sheet(T('حساباتي', 'My accounts'), h, 'small'); break; }
    case 'rank': window.armnOpenRanking(); break;
    case 'notes': openNotes(); break;
    case 'settings': settingsSheet(); break;
    case 'help': helpSheet(); break;
    case 'avatar': openPicker(); break;
    case 'account': accountOrLogin(); break;
    case 'login': APP.auth('in'); break;
    case 'logout': APP.logout(); break;
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
  const map = { c: 'create', j: 'join', l: 'rank', s: 'shop', a: 'avatar', '?': 'help', h: 'help', '؟': 'help' };
  if (map[k]) { e.preventDefault(); act(map[k]); }
});

/* ============================================================
   X-O CHAT
   ============================================================ */
(function chat() {
  const xo = $('#xo'); if (!xo) return;
  const ST = { code: null, side: null, seen: new Set(), msgs: [], unread: 0, open: false, mute: LS.get('chatmute', false), last: 0, opp: { name: '', av: null }, fresh: true, usedFallback: false };
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
    bubble.innerHTML = '<span class="bb-av">' + (isInt(ST.opp.av) ? avHtml(+ST.opp.av) : window.armnRankAvatar(ST.opp.name, null)) + '</span><span><b>' + esc(ST.opp.name || T('المنافس', 'Opponent')) + '</b><i>' + esc(c.txt) + '</i></span>';
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
      ST.opp = { name: room[meX ? 'playerOName' : 'playerXName'] || '', av: isInt(room[meX ? 'playerOAvatar' : 'playerXAvatar']) ? +room[meX ? 'playerOAvatar' : 'playerXAvatar'] : null };
      const hasOpp = !!room[meX ? 'playerO' : 'playerX'];
      $('.xc-nm', sh).textContent = hasOpp ? (ST.opp.name || T('المنافس', 'Opponent')) : T('بانتظار المنافس…', 'Waiting for opponent…');
      $('.xc-av', sh).innerHTML = hasOpp ? (isInt(ST.opp.av) ? avHtml(+ST.opp.av) : window.armnRankAvatar(ST.opp.name, null)) : '<span class="q">?</span>';
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
window.armnRenderProfile = () => { try { renderProfile(); } catch (e) {} };
function layoutClass() { D.documentElement.classList.toggle('hb-home', onHome()); }
function boot() {
  buildHub(); layoutClass();
  addEventListener('hashchange', () => {
    setTimeout(() => { layoutClass(); if (onHome()) { renderProfile(); refreshRank(); } }, 90);
  });
  D.addEventListener('langchange', () => {
    const h = $('#hub'); if (h) { h.remove(); hub = null; rankMount = null; buildHub(); }
  });
  addEventListener('online', renderProfile); addEventListener('offline', renderProfile);
  setInterval(() => { if (!D.hidden) refreshRank(); }, 45000);
  /* pending avatar from a guest session is applied once they log in */
}
if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();

