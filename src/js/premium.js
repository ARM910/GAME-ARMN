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
  var GCOL = { snake: '#4cf0a0', maze: '#b28cff', orbit: '#ffb347', bricks: '#3dd0ff', runner: '#ff7a5c', t2048: '#ffb02e', memory: '#ff6fb5', blocks: '#5b8cff', flip: '#8a7bff' };
  var FEATURED = ['snake', 'runner', 't2048', 'flip']; /* editorial picks by the developer */

  function levelOf(tot) { /* mirrors hub.js lvInfo only for display of the existing field */
    var el = $('.js-lv'); return el ? el.textContent.replace(/\D/g, '') || '1' : '1';
  }

  /* ---------- cinematic hero ---------- */
  var SCENE = '<svg viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
    '<linearGradient id="pmgx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#ff3ea5"/></linearGradient>' +
    '<linearGradient id="pmgo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0b8ff"/><stop offset="1" stop-color="#6a2bff"/></linearGradient>' +
    '<filter id="pmgl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
    '<g stroke="rgba(190,140,255,.28)" stroke-width="1" fill="none"><path d="M0 300H400M0 330H400M0 372H400M0 430H400"/><path d="M200 262L-60 440M200 262L60 440M200 262L180 440M200 262L220 440M200 262L340 440M200 262L460 440"/></g>' +
    '<g class="xg" filter="url(#pmgl)"><path d="M262 92L342 172M342 92L262 172" stroke="url(#pmgx)" stroke-width="26" stroke-linecap="round"/></g>' +
    '<g class="og" filter="url(#pmgl)"><circle cx="110" cy="190" r="62" fill="none" stroke="url(#pmgo)" stroke-width="24"/></g>' +
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
      '<div class="pm-flag-cta"><a class="pm-btn solid" href="#xo">▶ ' + T('العب X-O', 'Play X-O') + '</a><button type="button" class="pm-btn ghost" data-pm="online">🌐 ' + T('أونلاين', 'Online') + '</button><button type="button" class="pm-btn ghost" data-pm="explore">' + T('استكشف', 'Explore') + '</button></div>' +
      (thumbs ? '<div class="pm-thumbs">' + thumbs + '</div>' : '');
  }
  function paintFlag() {
    var f = $('#pmFlag'); if (!f) return;
    var sig = lang() + '|' + FEATURED.filter(function (id) { return $('#hbGames .gc[data-id="' + id + '"]'); }).join();
    if (f.dataset.sig !== sig) { f.dataset.sig = sig; f.innerHTML = heroHtml(); }
  }
  function strip() {}

  /* ---------- player dashboard: only real stored data ---------- */
  var GN = { xo: ['إكس-أو', 'X-O'], snake: ['الدودة', 'Snake'], maze: ['المتاهة', 'Maze'], orbit: ['مدار', 'Orbit'], bricks: ['الطوب', 'Bricks'], runner: ['العدّاء', 'Runner'], t2048: ['2048', '2048'], memory: ['الذاكرة', 'Memory'], blocks: ['المكعبات', 'Blocks'], flip: ['قلب الجاذبية', 'Gravity Flip'] };
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
    var rows = $$('.rk-row:not(.sk)', list).filter(function (r) { return /\br[123]\b/.test(r.className); });
    var old = $('.pm-podium', rk);
    if (rows.length < 3) { if (old) old.remove(); rk.classList.remove('pm-on'); $$('.pm-hide', list).forEach(function (r) { r.classList.remove('pm-hide'); }); return; }
    var data = rows.slice(0, 3).map(function (r, i) {
      return { i: i, n: ($('.rk-nm b', r) || {}).textContent || '', sc: ($('.rk-sc', r) || {}).innerHTML || '', av: ($('.rk-av', r) || {}).innerHTML || '', row: r };
    });
    var sig = data.map(function (d) { return d.n + d.sc; }).join('|');
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
    flag.addEventListener('click', function (e) { var b = e.target.closest('[data-pm="online"]'); if (b) { var o = $('#hub [data-act="online"]'); if (o) o.click(); return; } if (e.target.closest('[data-pm="explore"]')) { var g = $('#hbGames'); if (g) g.scrollIntoView({ behavior: 'smooth' }); } });
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
