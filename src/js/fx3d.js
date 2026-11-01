/* GAME ARMN — 3D tilt (no animated background).
   Cards, tiles, shop items and the profile card lean toward your finger/cursor.
   Paused inside games (html.imm) and with reduced-motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var SEL = '.gc,.tile,.sit,.pc';
  var cur = null;
  function reset(el) {
    if (!el) return;
    el.classList.remove('is-tilting');
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--px', '0'); el.style.setProperty('--py', '0');
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
  document.addEventListener('pointermove', function (e) {
    if (root.classList.contains('imm')) return;
    var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (el !== cur) { reset(cur); cur = el; }
    if (el) tilt(el, e);
  }, { passive: true });
  function release() { reset(cur); cur = null; }
  document.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') release(); }, { passive: true });
  document.addEventListener('pointercancel', release, { passive: true });
  document.addEventListener('pointerleave', release, { passive: true });
  window.addEventListener('blur', release);
  window.APP3D = { toggle: function (on) { var off = on === undefined ? !root.classList.contains('d3-off') : !on; root.classList.toggle('d3-off', off); return !off; } };
})();
