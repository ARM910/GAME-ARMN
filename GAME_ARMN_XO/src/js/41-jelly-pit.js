/* ============================================================
   JELLY PIT — ابلع واكبر  (original hole-eating arcade for GAME ARMN)
   Drag to steer your jelly hole. Swallow candy pals smaller than you,
   grow, dodge bigger rival holes and beat them before the clock ends.
   Opens as a full-screen overlay: window.armnJelly.open()
   ============================================================ */
(function () {
  'use strict';
  var W = 2600, H = 2600, ROUND = 90;
  var isEn = function () { return document.documentElement.lang === 'en'; };
  var T = function (a, e) { return isEn() ? e : a; };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('armn_jelly_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('armn_jelly_' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* item tiers: emoji, radius, mass value, flees?  (smaller = easier) */
  var KINDS = [
    { e: '🍬', r: 11, m: 1, c: '#ff6fae' }, { e: '🍭', r: 13, m: 1.2, c: '#f472b6' }, { e: '🍓', r: 14, m: 1.4, c: '#ff4d6d' },
    { e: '🍇', r: 16, m: 1.8, c: '#a78bfa' }, { e: '🍪', r: 20, m: 3, c: '#d9a066' }, { e: '🍩', r: 24, m: 4.5, c: '#ff8fb3' },
    { e: '🧁', r: 28, m: 6, c: '#fcd34d' }, { e: '🧸', r: 34, m: 9, c: '#c08457', pal: 1 }, { e: '🍰', r: 40, m: 13, c: '#fda4af' },
    { e: '🍉', r: 50, m: 20, c: '#4ade80' }, { e: '🎂', r: 62, m: 32, c: '#f9a8d4' }, { e: '🛋️', r: 80, m: 55, c: '#8b5cf6' }
  ];
  var RIVAL_COL = ['#22d3ee', '#fb923c', '#4ade80', '#f472b6', '#facc15'];
  var RIVAL_NAMES = ['Gloop', 'Mochi', 'Boba', 'Pudi', 'Zuzu'];

  var root, cv, ctx, raf, st, keys = {}, joy = null, sprites = {}, dpr = 1, cw = 0, ch = 0;

  function sprite(emoji) {
    if (sprites[emoji]) return sprites[emoji];
    var c = document.createElement('canvas'); c.width = c.height = 96;
    var x = c.getContext('2d'); x.font = '72px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emoji, 48, 52);
    return (sprites[emoji] = c);
  }

  /* ---------- audio (tiny synth, optional) ---------- */
  var ac = null;
  function blip(f, d, t, v) {
    if (!st || st.mute) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(); o.type = t || 'sine'; o.frequency.value = f;
      g.gain.value = v || .05; g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d);
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
    } catch (e) {}
  }

  /* ---------- world ---------- */
  function holeR(h) { return 24 + Math.sqrt(h.mass) * 5.2; }
  function newHole(name, col, x, y, ai) {
    return { name: name, col: col, x: x, y: y, vx: 0, vy: 0, mass: 6, r: 0, score: 0, ai: ai, tx: x, ty: y, think: 0, dead: 0, wob: Math.random() * 6, fz: 0 };
  }
  function spawnItem(kindMax) {
    var k, tries = 0;
    /* weighted: lots of small stuff, a few giants */
    var roll = Math.random();
    k = Math.min(KINDS.length - 1, Math.floor(Math.pow(roll, 1.9) * (kindMax || KINDS.length)));
    var K = KINDS[k], x, y;
    do { x = rnd(80, W - 80); y = rnd(80, H - 80); tries++; } while (tries < 8 && st && st.holes.some(function (h) { return Math.hypot(h.x - x, h.y - y) < h.r + K.r + 60; }));
    return { k: k, K: K, x: x, y: y, vx: 0, vy: 0, ph: Math.random() * 6, fall: 0, by: null, flee: 0 };
  }
  function start() {
    var me = newHole(T('أنت', 'You'), '#c4b5fd', W / 2, H / 2, false);
    st = { holes: [me], me: me, items: [], parts: [], pops: [], pw: [], t: ROUND, over: false, combo: 0, comboT: 0, best: store.get('best', 0), mute: store.get('mute', false), cam: { x: W / 2, y: H / 2, z: 1 }, shake: 0, magnet: 0, boost: 0, banner: 0, feed: [] };
    for (var i = 0; i < 5; i++) {
      var a = i / 5 * 6.283 + .4;
      st.holes.push(newHole(RIVAL_NAMES[i], RIVAL_COL[i], W / 2 + Math.cos(a) * 900, H / 2 + Math.sin(a) * 900, true));
    }
    for (i = 0; i < 330; i++) st.items.push(spawnItem());
    st.banner = 2.2; st.holes.forEach(function (o) { o.fz = 3; });
    last = performance.now();
  }

  /* ---------- update ---------- */
  var last = 0;
  function addFx(x, y, col, n, spd) {
    for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = rnd(.3, 1) * (spd || 160); st.parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: rnd(.4, .8), t: 0, c: col, r: rnd(2, 5) }); }
  }
  function eat(h, it) {
    var gain = it.K.m;
    h.mass += gain * (h.ai ? .5 : 1);
    var pts = Math.round(gain * 10);
    if (!h.ai) {
      st.combo = st.comboT > 0 ? Math.min(st.combo + 1, 9) : 1; st.comboT = 1.4;
      var mult = 1 + Math.floor(st.combo / 3) * .5; pts = Math.round(pts * mult);
      h.score += pts; st.pops.push({ x: it.x, y: it.y, txt: '+' + pts + (mult > 1 ? ' x' + mult : ''), t: 0 });
      blip(380 + it.k * 60 + st.combo * 25, .14, 'triangle', .06);
      if (it.k >= 7) { st.shake = .25; blip(120, .3, 'sawtooth', .05); }
    } else h.score += Math.round(pts * .55);
    addFx(it.x, it.y, it.K.c, 10, 170);
    it.dead = 1;
  }
  function eatHole(a, b) { /* a swallows b */
    a.mass += b.mass * .4; a.score += Math.round(b.mass * 15);
    addFx(b.x, b.y, b.col, 40, 320);
    st.feed.unshift({ t: 3.5, txt: a.name + ' 🍽️ ' + b.name });
    if (a === st.me) { st.pops.push({ x: b.x, y: b.y, txt: T('ابتلعته! +', 'GOT HIM! +') + Math.round(b.mass * 15), t: 0 }); st.shake = .5; blip(90, .5, 'sawtooth', .08); }
    if (b === st.me) { st.shake = .8; blip(70, .7, 'sawtooth', .09); }
    b.dead = 3.2; b.mass = 6; b.x = -999; b.y = -999;
  }
  function respawn(h) {
    var x, y, n = 0;
    do { x = rnd(300, W - 300); y = rnd(300, H - 300); n++; } while (n < 20 && st.holes.some(function (o) { return o !== h && !o.dead && Math.hypot(o.x - x, o.y - y) < o.r + 400; }));
    h.x = x; h.y = y; h.vx = h.vy = 0; h.fz = 1.5; h.mass = 6; h.dead = 0; h.tx = x; h.ty = y;
  }
  function aiThink(h) {
    var best = null, bs = -1e9, R = h.r, i, o, d, s;
    /* flee from bigger rivals, hunt smaller ones, otherwise graze */
    var flee = null, fd = 520;
    for (i = 0; i < st.holes.length; i++) {
      o = st.holes[i]; if (o === h || o.dead) continue;
      d = Math.hypot(o.x - h.x, o.y - h.y);
      if (o.r > R * 1.12 && d < fd) { fd = d; flee = o; }
    }
    if (flee) { h.tx = h.x + (h.x - flee.x) * 3; h.ty = h.y + (h.y - flee.y) * 3; h.tx = clamp(h.tx, 60, W - 60); h.ty = clamp(h.ty, 60, H - 60); return; }
    for (i = 0; i < st.holes.length; i++) {
      o = st.holes[i]; if (o === h || o.dead || R < o.r * 1.18) continue;
      d = Math.hypot(o.x - h.x, o.y - h.y);
      if (d < 700) { s = 900 - d + o.mass * 3; if (s > bs) { bs = s; best = o; } }
    }
    var cand = st.items, step = 3;
    for (i = (Math.random() * step) | 0; i < cand.length; i += step) {
      var it = cand[i]; if (it.dead || it.fall || it.K.r > R * .78) continue;
      d = Math.hypot(it.x - h.x, it.y - h.y); if (d > 900) continue;
      s = it.K.m * 40 - d * .7; if (s > bs) { bs = s; best = it; }
    }
    if (best) { h.tx = best.x; h.ty = best.y; } else { h.tx = rnd(100, W - 100); h.ty = rnd(100, H - 100); }
  }
  function update(dt) {
    var me = st.me, i, j, h, it;
    if (st.banner > 0) st.banner -= dt;
    if (!st.over) { st.t -= dt; if (st.t <= 0) { st.t = 0; finish(); } }
    st.comboT -= dt; if (st.comboT <= 0) st.combo = 0;
    st.magnet = Math.max(0, st.magnet - dt); st.boost = Math.max(0, st.boost - dt); st.shake = Math.max(0, st.shake - dt);
    for (i = st.feed.length - 1; i >= 0; i--) { st.feed[i].t -= dt; if (st.feed[i].t <= 0) st.feed.splice(i, 1); }

    /* holes */
    for (i = 0; i < st.holes.length; i++) {
      h = st.holes[i];
      if (h.dead > 0) { h.dead -= dt; if (h.dead <= 0) respawn(h); continue; }
      h.fz = Math.max(0, h.fz - dt);
      h.r += (holeR(h) - h.r) * Math.min(1, dt * 6) || 0; if (!h.r) h.r = holeR(h);
      var spd = clamp(330 - h.r * .85, 140, 330), dx = 0, dy = 0;
      if (!h.ai) {
        if (joy) { dx = joy.dx; dy = joy.dy; }
        if (keys.l) dx -= 1; if (keys.r) dx += 1; if (keys.u) dy -= 1; if (keys.d) dy += 1;
        var m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; }
        if (st.boost > 0) spd *= 1.45;
      } else {
        h.think -= dt; if (h.think <= 0) { h.think = rnd(.25, .6); aiThink(h); }
        var ddx = h.tx - h.x, ddy = h.ty - h.y, dd = Math.hypot(ddx, ddy);
        if (dd > 8) { dx = ddx / dd; dy = ddy / dd; }
        spd *= .68;
      }
      if (st.frozen > 0 && h.ai) spd = 0;
      h.vx += (dx * spd - h.vx) * Math.min(1, dt * 9); h.vy += (dy * spd - h.vy) * Math.min(1, dt * 9);
      h.x = clamp(h.x + h.vx * dt, h.r * .4, W - h.r * .4); h.y = clamp(h.y + h.vy * dt, h.r * .4, H - h.r * .4);
      h.wob += dt * (3 + Math.hypot(h.vx, h.vy) * .012);
    }
    if (st.frozen > 0) st.frozen -= dt;

    /* hole vs hole */
    for (i = 0; i < st.holes.length; i++) for (j = i + 1; j < st.holes.length; j++) {
      var a = st.holes[i], b = st.holes[j]; if (a.dead || b.dead || a.fz > 0 || b.fz > 0) continue;
      var big = a.r >= b.r ? a : b, sm = big === a ? b : a;
      if (big.r > sm.r * 1.16 && Math.hypot(a.x - b.x, a.y - b.y) < big.r - sm.r * .35) eatHole(big, sm);
    }

    /* items */
    for (i = 0; i < st.items.length; i++) {
      it = st.items[i]; it.ph += dt * 3;
      if (it.fall) {
        it.fall += dt * 3.2; var tgt = it.by; it.x += (tgt.x - it.x) * Math.min(1, dt * 10); it.y += (tgt.y - it.y) * Math.min(1, dt * 10);
        if (it.fall >= 1) eat(tgt, it);
        continue;
      }
      /* little pals sense danger and scoot away */
      var near = null, nd = 1e9;
      for (j = 0; j < st.holes.length; j++) {
        h = st.holes[j]; if (h.dead) continue;
        var d = Math.hypot(h.x - it.x, h.y - it.y);
        if (d < nd) { nd = d; near = h; }
        if (h.fz > 0) continue;
        var magnet = !h.ai && st.magnet > 0;
        if (it.K.r < h.r * .78) {
          if (magnet && d < h.r * 3.2 && d > h.r * .5) { var pull = 340 * dt / Math.max(1, d / 80); it.x += (h.x - it.x) / d * pull; it.y += (h.y - it.y) / d * pull; }
          if (d < h.r * .62) { it.fall = .001; it.by = h; break; }
        }
      }
      if (it.fall) continue;
      if (it.K.pal && near && nd < near.r * 2.4 && it.K.r < near.r * .85) { it.flee = .5; }
      if (it.flee > 0 && near) {
        it.flee -= dt; var fx = it.x - near.x, fy = it.y - near.y, fm = Math.hypot(fx, fy) || 1;
        it.x = clamp(it.x + fx / fm * 120 * dt, 50, W - 50); it.y = clamp(it.y + fy / fm * 120 * dt, 50, H - 50);
      }
      if (it.K.r > (near ? near.r * .78 : 0) && near && nd < near.r + it.K.r) { /* bumped by a hole that is too small: nudge out */
        var px = it.x - near.x, py = it.y - near.y, pm = Math.hypot(px, py) || 1, over = near.r + it.K.r - nd;
        if (it.K.r > 60) over *= .15; it.x += px / pm * over * .1; it.y += py / pm * over * .1;
      }
    }
    var kept = [], eaten = 0;
    for (i = 0; i < st.items.length; i++) { if (st.items[i].dead) eaten++; else kept.push(st.items[i]); }
    st.items = kept;
    var maxK = Math.min(KINDS.length, 6 + Math.floor(Math.sqrt(Math.max.apply(null, st.holes.map(function (o) { return o.mass; }))) * .55));
    while (st.items.length < 330) st.items.push(spawnItem(maxK));

    /* power-ups */
    if (!st.over && Math.random() < dt * .09 && st.pw.length < 3) {
      var types = ['magnet', 'boost', 'freeze']; st.pw.push({ type: types[(Math.random() * 3) | 0], x: rnd(150, W - 150), y: rnd(150, H - 150), ph: 0 });
    }
    for (i = st.pw.length - 1; i >= 0; i--) {
      var p = st.pw[i]; p.ph += dt * 4;
      if (Math.hypot(p.x - me.x, p.y - me.y) < me.r * .8 && !me.dead) {
        if (p.type === 'magnet') st.magnet = 7; else if (p.type === 'boost') st.boost = 6; else st.frozen = 4;
        st.pops.push({ x: p.x, y: p.y, txt: { magnet: T('مغناطيس! 🧲', 'MAGNET! 🧲'), boost: T('سرعة! ⚡', 'SPEED! ⚡'), freeze: T('تجميد! 🧊', 'FREEZE! 🧊') }[p.type], t: 0 });
        addFx(p.x, p.y, '#fde047', 24, 260); blip(740, .3, 'square', .05); st.pw.splice(i, 1);
      }
    }

    /* fx */
    for (i = st.parts.length - 1; i >= 0; i--) { var q = st.parts[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .94; q.vy *= .94; if (q.t > q.l) st.parts.splice(i, 1); }
    for (i = st.pops.length - 1; i >= 0; i--) { st.pops[i].t += dt; if (st.pops[i].t > 1) st.pops.splice(i, 1); }

    /* camera */
    var zt = clamp(1.25 - Math.sqrt(me.mass) * .028, .42, 1.2) * Math.min(1, Math.min(cw, ch) / 520 + .35);
    st.cam.z += (zt - st.cam.z) * Math.min(1, dt * 2.5);
    if (!me.dead) { st.cam.x += (me.x - st.cam.x) * Math.min(1, dt * 6); st.cam.y += (me.y - st.cam.y) * Math.min(1, dt * 6); }
    hud();
  }

  /* ---------- render ---------- */
  function render(now) {
    var z = st.cam.z, sx = 0, sy = 0;
    if (st.shake > 0) { sx = rnd(-1, 1) * st.shake * 14; sy = rnd(-1, 1) * st.shake * 14; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#120a2b'; ctx.fillRect(0, 0, cw, ch);
    ctx.save(); ctx.translate(cw / 2 + sx, ch / 2 + sy); ctx.scale(z, z); ctx.translate(-st.cam.x, -st.cam.y);
    var vx0 = st.cam.x - cw / 2 / z, vy0 = st.cam.y - ch / 2 / z, vx1 = st.cam.x + cw / 2 / z, vy1 = st.cam.y + ch / 2 / z;

    /* arena floor: pastel jelly tiles */
    var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2a1752'); g.addColorStop(.5, '#3a1d6b'); g.addColorStop(1, '#17325e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 2; ctx.beginPath();
    for (var gx = Math.floor(vx0 / 130) * 130; gx < vx1; gx += 130) { ctx.moveTo(gx, vy0); ctx.lineTo(gx, vy1); }
    for (var gy = Math.floor(vy0 / 130) * 130; gy < vy1; gy += 130) { ctx.moveTo(vx0, gy); ctx.lineTo(vx1, gy); }
    ctx.stroke();
    ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(244,114,182,.85)'; ctx.shadowColor = '#f472b6'; ctx.shadowBlur = 24; ctx.strokeRect(0, 0, W, H); ctx.shadowBlur = 0;

    var i, it, h;
    /* holes (drawn under items so items on the rim look like they sit on the edge) */
    for (i = 0; i < st.holes.length; i++) { h = st.holes[i]; if (!h.dead) drawHole(h); }

    /* items sorted by y for fake depth */
    var vis = [];
    for (i = 0; i < st.items.length; i++) { it = st.items[i]; if (it.x > vx0 - 100 && it.x < vx1 + 100 && it.y > vy0 - 100 && it.y < vy1 + 100) vis.push(it); }
    vis.sort(function (a, b) { return a.y - b.y; });
    for (i = 0; i < vis.length; i++) {
      it = vis[i]; var s = it.K.r * 2.4, sc = 1, rot = Math.sin(it.ph) * (it.flee > 0 ? .5 : .08), yy = it.y;
      if (it.fall) { sc = 1 - it.fall; rot += it.fall * 6; }
      /* edible hint: ring glow when the player could swallow it */
      var edible = !it.fall && it.K.r < st.me.r * .78;
      ctx.save(); ctx.translate(it.x, yy + Math.sin(it.ph * .6) * 1.5); ctx.rotate(rot); ctx.scale(sc, sc);
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(0, it.K.r * .85, it.K.r * .8, it.K.r * .3, 0, 0, 6.283); ctx.fill();
      if (edible && it.K.r > 18) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, it.K.r * 1.15, 0, 6.283); ctx.stroke(); }
      ctx.drawImage(sprite(it.K.e), -s / 2, -s / 2, s, s);
      if (it.flee > 0) { ctx.font = '700 ' + Math.max(14, it.K.r * .8) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('!', 0, -it.K.r * 1.2); }
      ctx.restore();
    }

    /* power-ups */
    for (i = 0; i < st.pw.length; i++) {
      var p = st.pw[i], e = { magnet: '🧲', boost: '⚡', freeze: '🧊' }[p.type], pr = 26 + Math.sin(p.ph) * 3;
      ctx.save(); ctx.translate(p.x, p.y); ctx.shadowColor = '#fde047'; ctx.shadowBlur = 24; ctx.fillStyle = 'rgba(253,224,71,.25)';
      ctx.beginPath(); ctx.arc(0, 0, pr + 12, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      ctx.drawImage(sprite(e), -pr, -pr, pr * 2, pr * 2); ctx.restore();
    }

    /* particles + popups */
    for (i = 0; i < st.parts.length; i++) { var q = st.parts[i]; ctx.globalAlpha = 1 - q.t / q.l; ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.font = '900 22px system-ui,sans-serif';
    for (i = 0; i < st.pops.length; i++) { var o = st.pops[i]; ctx.globalAlpha = 1 - o.t; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.fillStyle = '#fde68a'; ctx.strokeText(o.txt, o.x, o.y - o.t * 50); ctx.fillText(o.txt, o.x, o.y - o.t * 50); }
    ctx.globalAlpha = 1;
    /* names above holes */
    ctx.font = '800 ' + Math.round(16 / Math.max(z, .6)) + 'px system-ui,sans-serif';
    for (i = 0; i < st.holes.length; i++) { h = st.holes[i]; if (h.dead) continue; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.65)'; ctx.fillStyle = '#fff'; ctx.strokeText(h.name, h.x, h.y - h.r - 14); ctx.fillText(h.name, h.x, h.y - h.r - 14); }
    ctx.restore();

    /* joystick */
    if (joy && joy.show) {
      ctx.globalAlpha = .55; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(joy.ox, joy.oy, 52, 0, 6.283); ctx.stroke();
      ctx.fillStyle = 'rgba(196,181,253,.7)'; ctx.beginPath(); ctx.arc(joy.ox + joy.dx * 40, joy.oy + joy.dy * 40, 24, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
    }
    drawMini();
  }
  function drawHole(h) {
    var r = h.r, n = 36, t = h.wob, i;
    ctx.save(); ctx.translate(h.x, h.y);
    var frozen = h.ai && st.frozen > 0;
    ctx.globalAlpha = h.fz > 0 ? (.5 + .5 * Math.sin(h.fz * 20)) : 1;
    /* soft jelly aura */
    ctx.shadowColor = frozen ? '#bae6fd' : h.col; ctx.shadowBlur = 34;
    ctx.beginPath();
    for (i = 0; i <= n; i++) { var a = i / n * 6.283, rr = r * (1.14 + Math.sin(a * 3 + t) * .035 + Math.sin(a * 5 - t * 1.3) * .025 + (h === st.me && st.magnet > 0 ? Math.sin(t * 4) * .03 : 0)); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
    var rg = ctx.createRadialGradient(0, -r * .3, r * .5, 0, 0, r * 1.2); rg.addColorStop(0, frozen ? '#e0f2fe' : h.col); rg.addColorStop(1, 'rgba(255,255,255,.35)');
    ctx.fillStyle = rg; ctx.fill(); ctx.shadowBlur = 0;
    /* the pit */
    ctx.beginPath();
    for (i = 0; i <= n; i++) { a = i / n * 6.283; rr = r * (1 + Math.sin(a * 3 + t) * .03 + Math.sin(a * 5 - t * 1.3) * .02); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
    var pg = ctx.createRadialGradient(0, 0, r * .1, 0, 0, r); pg.addColorStop(0, '#000'); pg.addColorStop(.75, '#0a0418'); pg.addColorStop(1, '#1a0f3a');
    ctx.fillStyle = pg; ctx.fill();
    /* shine on the jelly rim */
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = Math.max(2, r * .06); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, r * 1.07, 3.7, 4.6); ctx.stroke();
    /* cute eyes peeking from the pit */
    var ex = clamp(h.vx * .02, -r * .25, r * .25), ey = clamp(h.vy * .02, -r * .25, r * .25), er = Math.max(4, r * .14);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r * .3 + ex, -r * .05 + ey, er, 0, 6.283); ctx.arc(r * .3 + ex, -r * .05 + ey, er, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-r * .3 + ex * 1.5, -r * .05 + ey * 1.5, er * .5, 0, 6.283); ctx.arc(r * .3 + ex * 1.5, -r * .05 + ey * 1.5, er * .5, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  function drawMini() {
    var s = 86, x = cw - s - 10, y = 62, k = s / W;
    ctx.save(); ctx.globalAlpha = .75; ctx.fillStyle = 'rgba(10,6,28,.7)'; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, s, s, 10) : ctx.rect(x, y, s, s); ctx.fill(); ctx.stroke();
    for (var i = 0; i < st.holes.length; i++) { var h = st.holes[i]; if (h.dead) continue; ctx.fillStyle = h.col; ctx.beginPath(); ctx.arc(x + h.x * k, y + h.y * k, Math.max(2.5, h.r * k * 1.3), 0, 6.283); ctx.fill(); }
    ctx.restore();
  }

  /* ---------- HUD / UI ---------- */
  var el = {};
  function hud() {
    var me = st.me, sorted = st.holes.slice().sort(function (a, b) { return b.score - a.score; });
    el.time.textContent = Math.ceil(st.t);
    el.time.classList.toggle('low', st.t < 10);
    el.score.textContent = me.score;
    el.size.style.width = clamp((me.r / 220) * 100, 4, 100) + '%';
    el.combo.textContent = st.combo > 1 ? 'x' + st.combo + ' 🔥' : '';
    var fx = []; if (st.magnet > 0) fx.push('🧲 ' + Math.ceil(st.magnet)); if (st.boost > 0) fx.push('⚡ ' + Math.ceil(st.boost)); if (st.frozen > 0) fx.push('🧊 ' + Math.ceil(st.frozen));
    el.fx.textContent = fx.join('  ');
    var html = '';
    for (var i = 0; i < Math.min(5, sorted.length); i++) { var h = sorted[i]; html += '<li' + (h === me ? ' class="me"' : '') + '><i style="background:' + h.col + '"></i><span>' + h.name + '</span><b>' + h.score + '</b></li>'; }
    if (el.lb._h !== html) { el.lb.innerHTML = html; el.lb._h = html; }
    var f = st.feed.map(function (x) { return '<div>' + x.txt + '</div>'; }).join('');
    if (el.feed._h !== f) { el.feed.innerHTML = f; el.feed._h = f; }
    el.banner.style.opacity = st.banner > 0 ? Math.min(1, st.banner) : 0;
  }
  function finish() {
    st.over = true; blip(520, .5, 'triangle', .07);
    var sorted = st.holes.slice().sort(function (a, b) { return b.score - a.score; }), rank = sorted.indexOf(st.me) + 1, me = st.me;
    var newBest = me.score > st.best; if (newBest) { st.best = me.score; store.set('best', me.score); }
    var medal = ['🥇', '🥈', '🥉'][rank - 1] || '🎯';
    el.end.innerHTML = '<div class="jp-card"><div class="jp-medal">' + medal + '</div><h2>' + (rank === 1 ? T('أنت الأقوى!', 'You rule the pit!') : T('المركز ', 'Rank #') + rank) + '</h2>' +
      '<p class="jp-big">' + me.score + '</p><p class="jp-sub">' + (newBest ? T('🎉 رقم قياسي جديد!', '🎉 New personal best!') : T('أفضل نتيجة: ', 'Best: ') + st.best) + '</p>' +
      '<ol class="jp-rank">' + sorted.map(function (h, i) { return '<li' + (h === me ? ' class="me"' : '') + '><em>' + (i + 1) + '</em><i style="background:' + h.col + '"></i><span>' + h.name + '</span><b>' + h.score + '</b></li>'; }).join('') + '</ol>' +
      '<div class="jp-btns"><button class="jp-b pri" data-j="again">' + T('العب مرة ثانية', 'Play again') + '</button><button class="jp-b" data-j="exit">' + T('خروج', 'Exit') + '</button></div></div>';
    el.end.hidden = false;
  }

  function build() {
    root = document.createElement('div'); root.id = 'jpRoot'; root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.innerHTML = '<canvas id="jpCv"></canvas>' +
      '<div class="jp-top"><button class="jp-ib" data-j="exit" aria-label="' + T('خروج', 'Exit') + '">✕</button>' +
      '<div class="jp-stat"><small>' + T('الوقت', 'TIME') + '</small><b id="jpT">90</b></div>' +
      '<div class="jp-stat"><small>' + T('النقاط', 'SCORE') + '</small><b id="jpS">0</b><span id="jpC"></span></div>' +
      '<button class="jp-ib" data-j="mute" aria-label="sound">🔊</button></div>' +
      '<div class="jp-size"><i id="jpZ"></i></div><div class="jp-fx" id="jpFx"></div>' +
      '<ul class="jp-lb" id="jpLb"></ul><div class="jp-feed" id="jpFeed"></div>' +
      '<div class="jp-banner" id="jpBn"><b>' + T('ابلع الحلويات واكبر!', 'Swallow sweets & grow!') + '</b><small>' + T('اسحب بإصبعك للتحرك — ابتلع الأصغر منك وابتعد عن الأكبر', 'Drag to move — eat smaller things, dodge bigger holes') + '</small></div>' +
      '<div class="jp-end" id="jpEnd" hidden></div>';
    document.body.appendChild(root);
    cv = root.querySelector('#jpCv'); ctx = cv.getContext('2d');
    el = { time: root.querySelector('#jpT'), score: root.querySelector('#jpS'), combo: root.querySelector('#jpC'), size: root.querySelector('#jpZ'), fx: root.querySelector('#jpFx'), lb: root.querySelector('#jpLb'), feed: root.querySelector('#jpFeed'), banner: root.querySelector('#jpBn'), end: root.querySelector('#jpEnd') };
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-j]'); if (!b) return; var a = b.dataset.j;
      if (a === 'exit') close(); else if (a === 'again') { el.end.hidden = true; start(); }
      else if (a === 'mute') { st.mute = !st.mute; store.set('mute', st.mute); b.textContent = st.mute ? '🔇' : '🔊'; }
    });
    /* pointer joystick: floating origin where you first touch */
    cv.addEventListener('pointerdown', function (e) { if (!st || st.over) return; cv.setPointerCapture(e.pointerId); joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, dx: 0, dy: 0, show: true }; });
    cv.addEventListener('pointermove', function (e) {
      if (!joy || joy.id !== e.pointerId) return;
      var dx = e.clientX - joy.ox, dy = e.clientY - joy.oy, m = Math.hypot(dx, dy);
      if (m > 70) { joy.ox += dx / m * (m - 70); joy.oy += dy / m * (m - 70); m = 70; dx = e.clientX - joy.ox; dy = e.clientY - joy.oy; }
      var k = Math.min(1, m / 40); var mm = Math.hypot(dx, dy) || 1; joy.dx = dx / mm * k; joy.dy = dy / mm * k;
    });
    var up = function (e) { if (joy && joy.id === e.pointerId) joy = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    addEventListener('resize', resize);
    addEventListener('keydown', function (e) {
      if (root.hidden) return; var k = e.key.toLowerCase(), v = e.type === 'keydown';
      if (k === 'escape') close();
      if (k === 'arrowleft' || k === 'a') keys.l = v; if (k === 'arrowright' || k === 'd') keys.r = v; if (k === 'arrowup' || k === 'w') keys.u = v; if (k === 'arrowdown' || k === 's') keys.d = v;
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].indexOf(k) > -1) e.preventDefault(); e.stopPropagation();
    }, true);
    addEventListener('keyup', function (e) {
      var k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.l = false; if (k === 'arrowright' || k === 'd') keys.r = false; if (k === 'arrowup' || k === 'w') keys.u = false; if (k === 'arrowdown' || k === 's') keys.d = false;
    });
  }
  function resize() {
    if (!cv) return; dpr = Math.min(2, window.devicePixelRatio || 1); cw = root.clientWidth; ch = root.clientHeight;
    cv.width = cw * dpr; cv.height = ch * dpr; cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  }
  function loop(now) {
    if (root.hidden) return;
    var dt = clamp((now - last) / 1000, 0, .05); last = now;
    update(dt); render(now); raf = requestAnimationFrame(loop);
  }
  function open() {
    if (!root) build();
    root.hidden = false; document.documentElement.classList.add('jp-open'); resize(); el.end.hidden = true; keys = {}; joy = null;
    start(); root.querySelector('[data-j="mute"]').textContent = st.mute ? '🔇' : '🔊';
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  function close() { if (!root) return; root.hidden = true; document.documentElement.classList.remove('jp-open'); cancelAnimationFrame(raf); joy = null; }
  window.armnJelly = { open: open, close: close };
})();
