
/* GAME ARMN — premium layer. Pure presentation: it only READS existing state
   (armnApp.me(), localStorage, rendered ranking rows) and triggers the existing
   handlers by clicking the original buttons. No auth / Firebase / room logic here. */
(function () {
  'use strict';
  var D = document;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var lang = function () { return D.documentElement.lang === 'en' ? 'en' : 'ar'; };
  var T = function (a, e) { return lang() === 'en' ? e : a; };
  var esc = function (x) { return String(x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ls = function (k, d) { try { var v = JSON.parse(localStorage.getItem('armn:' + k)); return v == null ? d : v; } catch (e) { return d; } };
  var me = function () { try { return window.armnApp && window.armnApp.me(); } catch (e) { return null; } };
  var GCOL = { xo: '#35c2ff' };
  var FEATURED = [];

  function levelOf(tot) { /* mirrors hub.js lvInfo only for display of the existing field */
    var el = $('.js-lv'); return el ? el.textContent.replace(/\D/g, '') || '1' : '1';
  }

  /* ---------- cinematic hero ---------- */
  var SCENE = '<svg viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
    '<linearGradient id="pmgx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ccbff"/><stop offset=".5" stop-color="#2f7bff"/><stop offset="1" stop-color="#0b3fb8"/></linearGradient>' +
    '<linearGradient id="pmgo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffa3a3"/><stop offset=".5" stop-color="#ee3b3b"/><stop offset="1" stop-color="#a50f1f"/></linearGradient>' +
    '<linearGradient id="pmsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="pmfd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<mask id="pmfm" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="440"><rect width="400" height="440" fill="url(#pmfd)"/></mask>' +
    '<filter id="pmgl" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '<g id="pmX"><path d="M262 92L342 172M342 92L262 172" stroke="#0e3aa8" stroke-width="28" stroke-linecap="round" fill="none"/><path d="M262 92L342 172M342 92L262 172" stroke="#2f8bff" stroke-width="20" stroke-linecap="round" fill="none"/><path d="M262 92L342 172M342 92L262 172" stroke="#7fe3ff" stroke-width="9" stroke-linecap="round" fill="none" transform="translate(-3,-3)"/><path d="M262 92L342 172M342 92L262 172" stroke="#fff" stroke-opacity=".9" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="16 70" fill="none" transform="translate(-5,-5)"/></g>' +
    '<g id="pmO"><circle cx="110" cy="190" r="62" fill="none" stroke="#8c0f3a" stroke-width="28"/><circle cx="110" cy="190" r="62" fill="none" stroke="#ff4f86" stroke-width="20"/><circle cx="110" cy="190" r="62" fill="none" stroke="#ffb3cf" stroke-width="8" stroke-dasharray="150 240" transform="rotate(-150 110 190)"/><circle cx="110" cy="190" r="62" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2.4" stroke-dasharray="18 372" transform="rotate(-120 110 190)"/></g></defs>' +
    '<g class="xg"><use href="#pmX"/><path d="M350 84l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#bfeaff"/></g>' +
    '<g class="og"><use href="#pmO"/><path d="M52 138l2.6 7 7 2.6-7 2.6-2.6 7-2.6-7-7-2.6 7-2.6z" fill="#ffd6e4"/></g>' +
    '<g fill="#fff" opacity=".8"><circle cx="40" cy="60" r="1.6"/><circle cx="170" cy="40" r="1.2"/><circle cx="370" cy="230" r="1.6"/><circle cx="220" cy="210" r="1.2"/><circle cx="60" cy="300" r="1.4"/></g></svg>';
  function heroHtml() {
    var thumbs = FEATURED.slice(0, 3).map(function (id) {
      var c = $('#hbGames .gc[data-id="' + id + '"]'); if (!c) return '';
      var a = $('.gc-art', c), t = $('.gc-t b', c);
      return '<a href="#' + id + '" style="--c:' + (GCOL[id] || '#a35cff') + '">' + (a ? a.innerHTML : '') + '<span>' + esc(t ? t.textContent : id) + '</span></a>';
    }).join('');
    return '<div class="pm-scene">' + SCENE + '</div>' +
      '<div class="pm-flag-top"><span class="pm-badge"><i></i>ONLINE</span><span class="pm-badge alt">' + T('اللعبة الرئيسية · X-O', 'FLAGSHIP · X-O') + '</span></div>' +
      '<h2>' + T('استعد للعب<br><em>تحدَّ · انتصر</em>', 'Get ready to play<br><em>Challenge · Conquer</em>') + '</h2>' +
      '<p>' + T('إكس-أو بقطع تختفي، ذكاء يتحدّاك، وغرف أونلاين مع أصدقائك.', 'X-O with vanishing pieces, a sharp AI, and online rooms with friends.') + '</p>' +
      '<div class="pm-flag-cta"><a class="pm-btn solid" href="#xo">▶ ' + T('العب X-O', 'Play X-O') + '</a><button type="button" class="pm-btn ghost" data-pm="online">🌐 ' + T('أونلاين', 'Online') + '</button></div>' +
      (thumbs ? '<div class="pm-thumbs">' + thumbs + '</div>' : '');
  }
  function paintFlag() {
    var f = $('#pmFlag'); if (!f) return;
    var sig = lang() + '|' + FEATURED.filter(function (id) { return $('#hbGames .gc[data-id="' + id + '"]'); }).join();
    if (f.dataset.sig !== sig) { f.dataset.sig = sig; f.innerHTML = heroHtml(); }
  }
  function strip() {}

  /* ---------- player dashboard: only real stored data ---------- */
  var GN = { xo: ['إكس-أو', 'X-O'] };
  function activity() {
    var host = $('#pmActBody'); if (!host) return;
    var wins = +ls('xo-wins', 0) || 0, u = me(), rec = ls('recent', []) || [], id = GN[rec[0]] ? rec[0] : 'xo';
    var card = $('#hbGames .gc[data-id="' + id + '"]'), art = card ? ($('.gc-art', card) || {}).innerHTML || '' : '', meta = card ? ($('.gc-m', card) || {}).textContent || '' : '';
    var on = navigator.onLine, lvTxt = ($('.js-lv') || {}).textContent || 'Lv. 1', xp = ($('.js-xp') || {}).textContent || '';
    var html = '<div class="pm-pills"><span class="pm-pill"><b class="' + (on ? 'ok' : 'warn') + '">●</b> ' + (on ? T('متصل', 'Online') : T('غير متصل', 'Offline')) + '</span>' +
      '<span class="pm-pill">' + T('المستوى', 'Level') + ' <b>' + esc(lvTxt.replace('Lv. ', '')) + '</b></span>' +
      '<span class="pm-pill">' + T('النقاط', 'Points') + ' <b>' + (u ? (u.pts | 0) : 0) + '</b></span>' +
      '<span class="pm-pill">' + T('انتصارات X-O', 'X-O wins') + ' <b>' + wins + '</b></span></div>' +
      '<div class="pm-now" style="--c:' + (GCOL[id] || '#a35cff') + '"><div><small>' + (rec[0] ? T('آخر لعبة لعبتها', 'LAST PLAYED') : T('ابدأ من هنا', 'START HERE')) + '</small><h3>' + GN[id][lang() === 'en' ? 1 : 0] + '</h3>' +
      (meta ? '<small>' + esc(meta) + '</small><br>' : '') + '<a class="pm-btn solid" href="#' + id + '" style="margin-top:10px">▶ ' + T('تابع اللعب', 'Launch') + '</a></div><span class="art">' + art + '</span></div>' +
      '<div class="pm-card"><h4>' + T('نظرة على أدائك', 'PERFORMANCE OVERVIEW') + '</h4><div class="pm-perf"><div>' + T('انتصارات X-O', 'X-O wins') + '<b class="g">' + wins + '</b></div><div>' + T('المستوى', 'Level') + '<b class="v">' + esc(lvTxt.replace('Lv. ', '')) + '</b></div><div>' + T('النقاط', 'Points') + '<b class="y">' + (u ? (u.pts | 0) : 0) + '</b></div><div>XP<b>' + esc(xp || '-') + '</b></div></div></div>';
    var ach = [[1, '🏅', T('أول انتصار', 'First win')], [10, '🔥', T('10 انتصارات', '10 wins')], [50, '👑', T('50 انتصاراً', '50 wins')]];
    html += '<div class="pm-card"><h4>' + T('آخر الإنجازات (X-O)', 'RECENT ACHIEVEMENTS (X-O)') + '</h4><div class="pm-ach">' + ach.map(function (a) { var ok = wins >= a[0]; return '<div class="' + (ok ? '' : 'lock') + '"><span class="ic">' + a[1] + '</span>' + a[2] + '<em>' + (ok ? T('مُنجَز', 'Unlocked') : T('مقفل', 'Locked') + ' ' + wins + '/' + a[0]) + '</em></div>'; }).join('') + '</div></div>';
    if (!u) html += '<div class="pm-card"><b>' + T('سجّل دخولك لحفظ تقدمك وإنجازاتك', 'Log in to save your progress') + '</b></div>';
    if (host.dataset.sig !== html) { host.dataset.sig = html; host.innerHTML = html; }
  }

  /* ---------- podium from the real ranking rows ---------- */
  function podium(list) {
    var rk = list.closest('.rk'); if (!rk) return;
    var tabOn = $('.rk-tabs button.on', rk);
    var rows = $$('.rk-row:not(.sk)', list).filter(function (r) { return /\br[123]\b/.test(r.className); });
    var old = $('.pm-podium', rk);
    if (rows.length < 3 || (tabOn && tabOn.dataset.k === 'friends')) { if (old) old.remove(); rk.classList.remove('pm-on'); $$('.pm-hide', list).forEach(function (r) { r.classList.remove('pm-hide'); }); return; }
    var data = rows.slice(0, 3).map(function (r, i) {
      var ring = $('.rk-avr', r), plain = $('.rk-av', r);
      return { i: i, n: ($('.rk-nm b', r) || {}).textContent || '', sc: ($('.rk-sc', r) || {}).innerHTML || '', av: ring ? ring.outerHTML : (plain ? plain.outerHTML : ''), fr: ring ? ring.className : '', row: r };
    });
    var sig = data.map(function (d) { return d.n + d.sc + d.fr; }).join('|');
    if (old && old.dataset.sig === sig) { rows.forEach(function (r) { r.classList.add('pm-hide'); }); return; }
    if (old) old.remove();
    var order = [1, 0, 2], el = D.createElement('div'); el.className = 'pm-podium'; el.dataset.sig = sig;
    el.innerHTML = order.map(function (k) { var d = data[k]; return '<div class="pm-pod p' + (k + 1) + '" data-k="' + k + '"><span class="md">' + (k + 1) + '</span><span class="av">' + d.av + '</span><b>' + d.n + '</b><em>' + d.sc + '</em></div>'; }).join('');
    el.addEventListener('click', function (e) { var p = e.target.closest('.pm-pod'); if (p) data[+p.dataset.k].row.click(); });
    list.parentNode.insertBefore(el, list);
    rk.classList.add('pm-on'); rows.forEach(function (r) { r.classList.add('pm-hide'); });
  }
  var raf = 0;
  function scan() { raf = 0; $$('.rk-list').forEach(podium); strip(); activity(); paintFlag(); }
  function sched() { if (!raf) raf = requestAnimationFrame(scan); }

  /* ---------- build ---------- */
  function build() {
    var main = $('#hub .hb-main'); if (!main || $('#pmFlag')) return !!$('#pmFlag');
    var flag = D.createElement('div'); flag.id = 'pmFlag'; flag.className = 'pm-hero';
    flag.addEventListener('click', function (e) { var b = e.target.closest('[data-pm="online"]'); if (b) { var o = $('#hub [data-act="online"]'); if (o) o.click(); return; } });
    main.insertBefore(flag, main.firstChild);
    var tiles = $('.hb-tiles', main);
    var ac = D.createElement('section'); ac.className = 'pm-sec pm-rv'; ac.id = 'pmAct';
    ac.innerHTML = '<div class="pm-h"><h2>' + T('لوحة اللاعب', 'Player dashboard') + '</h2></div><div class="pm-act" id="pmActBody"></div>';
    var contact = $('.hb-contact-t', main); if (contact) main.insertBefore(ac, contact); else main.appendChild(ac);
    var g = $('#hbGames'); if (g) g.classList.add('pm-rv');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
      $$('.pm-rv').forEach(function (n) { io.observe(n); });
    } else $$('.pm-rv').forEach(function (n) { n.classList.add('in'); });
    scan(); return true;
  }

  function init() {
    var tries = 0, iv = setInterval(function () { if (build() || ++tries > 80) clearInterval(iv); }, 100);
    new MutationObserver(sched).observe(D.body, { childList: true, subtree: true });
    var prev = window.armnOnPaint; window.armnOnPaint = function () { try { if (prev) prev.apply(this, arguments); } catch (e) { console.error(e); } sched(); };
    addEventListener('storage', sched); addEventListener('hashchange', sched);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();

