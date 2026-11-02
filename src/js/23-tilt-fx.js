
/* GAME ARMN — 3D tilt (no animated background).
   Cards, tiles, shop items and the profile card lean toward your finger/cursor.
   Safe by design: paused inside games (html.imm), with reduced-motion, and automatically
   switched to a light mode (html.d3-lite) on weak devices so the page can never freeze/crash. */
(function () {
  'use strict';
  var root = document.documentElement;
  var SEL = '.gc,.tile,.sit,.pc';
  var cur = null, raf = 0, last = null;

  /* ---- weak-device detection ---- */
  var lite = false;
  try {
    var mem = navigator.deviceMemory, cpu = navigator.hardwareConcurrency;
    var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sd = navigator.connection && navigator.connection.saveData;
    lite = !!(rm || sd || (mem && mem <= 2) || (cpu && cpu <= 2));
  } catch (_) {}
  if (lite) root.classList.add('d3-lite');
  function off() { return lite || root.classList.contains('d3-off') || root.classList.contains('imm'); }

  function reset(el) {
    if (!el) return;
    el.classList.remove('is-tilting');
    el.style.removeProperty('--rx'); el.style.removeProperty('--ry');
    el.style.removeProperty('--px'); el.style.removeProperty('--py');
    el.style.removeProperty('--mx'); el.style.removeProperty('--my');
  }
  function tilt(el, e) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    var m = el.matches('.pc') ? 3 : el.matches('.sit') ? 12 : 9;
    el.classList.add('is-tilting');
    el.style.setProperty('--ry', ((x - .5) * m * 2).toFixed(2) + 'deg');
    el.style.setProperty('--rx', (-(y - .5) * m * 2).toFixed(2) + 'deg');
    el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    el.style.setProperty('--px', ((x - .5) * 2).toFixed(3));
    el.style.setProperty('--py', ((y - .5) * 2).toFixed(3));
  }
  function release() { if (raf) { cancelAnimationFrame(raf); raf = 0; } last = null; reset(cur); cur = null; }

  document.addEventListener('pointermove', function (e) {
    if (off()) { if (cur) release(); return; }
    last = e;
    if (raf) return;                      /* at most one style write per frame */
    raf = requestAnimationFrame(function () {
      raf = 0;
      var ev = last; if (!ev || off()) return;
      var t = ev.target, el = null;
      try { el = t && t.closest ? t.closest(SEL) : null; } catch (_) {}
      if (el !== cur) { reset(cur); cur = el; }
      if (el) tilt(el, ev);
    });
  }, { passive: true });
  document.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') release(); }, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
  document.addEventListener('pointerout', function (e) { if (!e.relatedTarget) release(); }, { passive: true });
  document.addEventListener('scroll', function () { if (cur) release(); }, { passive: true, capture: true });
  document.addEventListener('visibilitychange', release);
  window.addEventListener('blur', release);
  window.addEventListener('hashchange', release);

  /* ---- endless shop animations only run for items actually on screen ---- */
  if (!lite && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) { en.target.classList.toggle('vis', en.isIntersecting); });
    }, { rootMargin: '40px' });
    var seen = new WeakSet(), pend = 0;
    var scan = function () {
      pend = 0;
      var els = document.querySelectorAll('.sit:not(.frc)');
      for (var i = 0; i < els.length; i++) if (!seen.has(els[i])) { seen.add(els[i]); io.observe(els[i]); }
    };
    var queue = function () { if (!pend) pend = setTimeout(scan, 120); };
    try {
      new MutationObserver(queue).observe(document.body || root, { childList: true, subtree: true });
    } catch (_) {}
    queue();
  }

  window.APP3D = { toggle: function (on) { var o = on === undefined ? !root.classList.contains('d3-off') : !on; root.classList.toggle('d3-off', o); if (o) release(); return !o; } };
})();

