/* ARMN anime characters — 15 premium avatars (index 18..32)
   Every character is built from the same 3D-shaded rig: soft key light from the upper left,
   cyan rim light on the right, ambient-occlusion under the hair and chin, glossy eyes,
   and three depth layers (.z-bg / .z-mid / .z-fg) that the hub shifts for a parallax tilt. */
(function () {
  'use strict';
  var N = function (n) { return +n.toFixed(2); };

  /* name, skin, hair[hi,mid,lo], eye[top,bottom], cloth[hi,mid,lo], bg[inner,outer,glow], kind flags */
  var CFG = [
    /* 18 Mystic Unicorn */ { skin: ['#fff1ea', '#ffd9cf', '#f2aeb4'], hair: ['#ffd6fb', '#b99cff', '#5bc8ff'], eye: ['#6a3bd0', '#ff8fe6'], cloth: ['#ffffff', '#e5d7ff', '#9f86e8'], bg: ['#5a3a9c', '#1c1245', '#ff9be9'], style: 'long', ex: 'unicorn' },
    /* 19 Dragon Lord */ { skin: ['#ffe7d2', '#f7c8a6', '#d58f76'], hair: ['#ff7a4d', '#d8261d', '#4a0710'], eye: ['#ffcf3a', '#ff6a1a'], slit: 1, cloth: ['#5a5f78', '#2b2f46', '#10121f'], bg: ['#7a1d12', '#240609', '#ff8a2b'], style: 'spiky', ex: 'dragon' },
    /* 20 Frog Prince */ { skin: ['#ffeed9', '#f8d3b0', '#dca587'], hair: ['#b9f08a', '#4fb34c', '#1a5a2c'], eye: ['#1c8a4a', '#9df28a'], cloth: ['#ffe27a', '#37b560', '#126134'], bg: ['#2f9b6b', '#07312a', '#c9ff7a'], style: 'short', ex: 'frog' },
    /* 21 Fire Tiger */ { skin: ['#ffe4cc', '#f5c19a', '#d38e6a'], hair: ['#ffc16a', '#ff7a1a', '#a52a06'], eye: ['#ffd23a', '#ff8a1a'], slit: 1, cloth: ['#ff9a3d', '#e8561a', '#7d1d08'], bg: ['#c24a12', '#3a0f06', '#ffb347'], style: 'spiky', ex: 'tiger' },
    /* 22 Sun Lion */ { skin: ['#ffe6c9', '#f6c595', '#d2915f'], hair: ['#fff1a0', '#f2b631', '#9a5a0b'], eye: ['#b8691a', '#ffd25a'], cloth: ['#fff0b0', '#e9a82a', '#8a4f0c'], bg: ['#d7861c', '#4a1f05', '#fff2a0'], style: 'mane', ex: 'lion' },
    /* 23 Butterfly Fairy */ { skin: ['#fff3ee', '#ffdcd2', '#efb2bd'], hair: ['#fff0ff', '#e7a8ff', '#8a5ad8'], eye: ['#8a4fe0', '#7ff0ff'], cloth: ['#e9fdff', '#8fe0ff', '#4a8fe0'], bg: ['#6f4fc2', '#1b1250', '#7ff0ff'], style: 'long', ex: 'fairy' },
    /* 24 Kraken Captain */ { skin: ['#fff0e6', '#f7d1bd', '#d8998f'], hair: ['#ff9be6', '#b13fd3', '#4a1280'], eye: ['#2a6fe0', '#6ff0d8'], cloth: ['#7a2b94', '#3f1664', '#1a0733'], bg: ['#16798f', '#041a2b', '#53ffd8'], style: 'twin', ex: 'kraken' },
    /* 25 Great Shark */ { skin: ['#ffeadb', '#f5ccb0', '#d29b86'], hair: ['#8fe4ff', '#2a8fe0', '#0b3a8a'], eye: ['#0d5a8a', '#63ecff'], cloth: ['#cfeaff', '#4a8fc8', '#1a3f74'], bg: ['#1c78c8', '#031a3a', '#6fe8ff'], style: 'spiky', ex: 'shark' },
    /* 26 Moon Wolf */ { skin: ['#f4f0fa', '#dcd6ec', '#a9a3c8'], hair: ['#ffffff', '#c8d4ec', '#6c7aa8'], eye: ['#3a9ae8', '#b8f4ff'], cloth: ['#8a97c4', '#455083', '#1a1f45'], bg: ['#35408f', '#0a0d2a', '#d6e4ff'], style: 'long', ex: 'wolf' },
    /* 27 Night Owl */ { skin: ['#ffeedd', '#f4cfae', '#cc9a7c'], hair: ['#d7a06a', '#8a5a2e', '#3a2410'], eye: ['#ffb400', '#fff0a0'], cloth: ['#c7a373', '#7d5a38', '#35220f'], bg: ['#5a3f9a', '#120a33', '#ffd45a'], style: 'bob', ex: 'owl' },
    /* 28 Archmage */ { skin: ['#fff0e0', '#f3d1b3', '#cf9d83'], hair: ['#ffffff', '#dcdcf0', '#8a8ab8'], eye: ['#4a6bff', '#9fe0ff'], cloth: ['#8f5fe8', '#5a2fb5', '#241056'], bg: ['#4e2fa6', '#10062e', '#c58bff'], style: 'long', ex: 'mage' },
    /* 29 Count Vampire */ { skin: ['#fff4f4', '#f1d6dc', '#c79aae'], hair: ['#5a4a7a', '#241d3f', '#07050f'], eye: ['#ff3a4a', '#ffb0b0'], cloth: ['#d82a3c', '#7d0f24', '#2a0410'], bg: ['#7a1230', '#14030c', '#ff5a6a'], style: 'slick', ex: 'vampire' },
    /* 30 Alien Commander */ { skin: ['#d4ffbf', '#84e07a', '#2f9a62'], hair: ['#d4ffbf', '#84e07a', '#2f9a62'], eye: ['#000', '#0a1a20'], big: 1, cloth: ['#9fd0ff', '#3f6fd0', '#142a6a'], bg: ['#17408a', '#030c24', '#7dffb0'], style: 'none', ex: 'alien' },
    /* 31 The Reaper */ { skin: ['#f6f0ff', '#d9d0ec', '#9a8cc0'], hair: ['#3a2f5a', '#171230', '#05030c'], eye: ['#b86bff', '#ff9bff'], cloth: ['#3b3156', '#171230', '#05030c'], bg: ['#3a1a6a', '#05020f', '#b86bff'], style: 'none', ex: 'reaper' },
    /* 32 The Emperor */ { skin: ['#ffeedc', '#f6d0ae', '#d09a7c'], hair: ['#ffffff', '#e1e5f2', '#8f98b8'], eye: ['#ffb400', '#fff2a8'], cloth: ['#e63a4f', '#a3122c', '#4a0614'], bg: ['#9a1f3a', '#1d030c', '#ffd45a'], style: 'swoop', ex: 'emperor' }
  ];

  function art(i) {
    var C = CFG[i - 18] || CFG[0];
    var P = 'z' + i;
    var id = function (s) { return P + s; }, U = function (s) { return 'url(#' + P + s + ')'; };
    var stops = function (a) { return a.map(function (c, n) { return '<stop offset="' + N(n / (a.length - 1)) + '" stop-color="' + c + '"/>'; }).join(''); };
    var lg = function (s, a, x1, y1, x2, y2) { return '<linearGradient id="' + id(s) + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 == null ? 0 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '">' + stops(a) + '</linearGradient>'; };
    var rg = function (s, a, cx, cy, r, fx, fy) { return '<radialGradient id="' + id(s) + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + (fx != null ? ' fx="' + fx + '" fy="' + fy + '"' : '') + '>' + stops(a) + '</radialGradient>'; };
    var mir = function (g) { return g + '<g transform="translate(100 0) scale(-1 1)">' + g + '</g>'; };
    var OL = 'stroke="#2a1236" stroke-opacity=".42" stroke-width=".8" stroke-linejoin="round" stroke-linecap="round"';
    var spark = function (x, y, s, d, c) { return '<path d="M' + x + ' ' + N(y - s) + 'L' + N(x + s * .28) + ' ' + N(y - s * .28) + ' ' + N(x + s) + ' ' + y + ' ' + N(x + s * .28) + ' ' + N(y + s * .28) + ' ' + x + ' ' + N(y + s) + ' ' + N(x - s * .28) + ' ' + N(y + s * .28) + ' ' + N(x - s) + ' ' + y + ' ' + N(x - s * .28) + ' ' + N(y - s * .28) + 'z" fill="' + (c || '#fff') + '"><animate attributeName="opacity" values="0;1;0" dur="' + d + 's" repeatCount="indefinite"/></path>'; };

    var alien = C.ex === 'alien', reaper = C.ex === 'reaper';
    var defs = '<defs>' +
      rg('bg', [C.bg[0], C.bg[1]], .5, .38, .85) +
      rg('vig', ['#00000000', '#00000000', '#05030f99'], .5, .45, .75) +
      rg('glow', [C.bg[2] + 'cc', C.bg[2] + '00'], .5, .5, .5) +
      lg('hair', C.hair, 0, 0, .25, 1) +
      lg('hairrim', ['#ffffff00', '#ffffff00', C.bg[2] + 'aa'], 0, 0, 1, 0) +
      rg('skin', [C.skin[0], C.skin[1], C.skin[2]], .38, .3, .85, .3, .22) +
      lg('neck', [C.skin[2], C.skin[1]], 0, 0, 0, 1) +
      lg('cloth', C.cloth, .1, 0, .7, 1) +
      lg('iris', [C.eye[0], C.eye[1]], 0, 0, 0, 1) +
      lg('lid', ['#14091f', '#14091f00'], 0, 0, 0, 1) +
      lg('floor', ['#00000000', '#000000aa'], 0, 0, 0, 1) +
      lg('metal', ['#fff6c0', '#ffd23a', '#c98a0c', '#ffe680'], 0, 0, 1, 1) +
      '</defs>';

    /* ---------- BACKGROUND (depth layer 0) ---------- */
    var bg = '<g class="z-bg"><rect width="100" height="100" fill="' + U('bg') + '"/>' +
      '<circle cx="50" cy="44" r="46" fill="' + U('glow') + '" opacity=".7"/>' +
      '<circle cx="50" cy="46" r="34" fill="none" stroke="' + C.bg[2] + '" stroke-opacity=".35" stroke-width="1.2"/><circle cx="50" cy="46" r="40" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width=".6" stroke-dasharray="1.5 3"/>' +
      '<rect width="100" height="100" fill="url(#' + id('vig') + ')"/>' +
      '<circle cx="14" cy="20" r="5" fill="' + C.bg[2] + '" opacity=".18"/><circle cx="87" cy="30" r="7" fill="' + C.bg[2] + '" opacity=".14"/><circle cx="82" cy="78" r="4" fill="' + C.bg[2] + '" opacity=".2"/><circle cx="12" cy="66" r="3" fill="#fff" opacity=".16"/>' +
      spark(16, 34, 3, 2.7, '#fff') + spark(86, 18, 2.4, 3.3, '#fff') + spark(90, 58, 2, 2.2, '#fff') + '</g>';

    /* ---------- extras that sit BEHIND the character ---------- */
    var behind = '';
    var ex = C.ex;
    if (ex === 'fairy') {
      var wing = '<path d="M30 52C14 34 4 36 6 50C8 62 20 66 30 62Z" fill="url(#' + id('wg') + ')" ' + OL + '/><path d="M32 64C18 66 12 80 22 86C30 90 36 76 34 66Z" fill="url(#' + id('wg') + ')" opacity=".85" ' + OL + '/><path d="M12 46C18 50 24 54 30 56M10 54C16 58 22 60 30 60" stroke="#fff" stroke-opacity=".6" stroke-width=".6" fill="none"/>';
      defs += '<defs>' + lg('wg', ['#ff9bf0cc', '#7ff0ffcc', '#fff6ffcc'], 0, 0, 1, 1) + '</defs>';
      behind += mir(wing);
    }
    if (ex === 'mage') {
      behind += '<g><circle cx="82" cy="52" r="9" fill="#c58bff" opacity=".35"><animate attributeName="r" values="8;11;8" dur="2.4s" repeatCount="indefinite"/></circle><rect x="80.6" y="48" width="2.8" height="52" rx="1.4" fill="#6a4a2a"/><circle cx="82" cy="48" r="5" fill="#e7c8ff" ' + OL + '/><circle cx="80.3" cy="46.3" r="1.6" fill="#fff"/></g>';
    }
    if (ex === 'reaper') {
      behind += '<g><rect x="20" y="8" width="2.6" height="92" rx="1.3" fill="#5a4a7a" transform="rotate(14 21 54)"/><path d="M12 12C28 2 40 12 38 28C34 18 24 14 12 12Z" fill="#cdbfff" ' + OL + ' transform="rotate(14 21 54)"/></g>';
    }
    if (ex === 'wolf') {
      behind += '<circle cx="74" cy="26" r="16" fill="#f4f8ff"/><circle cx="80" cy="22" r="14" fill="' + C.bg[0] + '"/><circle cx="74" cy="26" r="16" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".8"/>';
    }
    if (ex === 'vampire') {
      behind += '<g fill="#14030c" opacity=".9"><path d="M8 26C12 20 16 22 18 26C20 22 24 22 26 28C22 28 20 32 18 34C16 30 12 28 8 26Z"/><path d="M78 14C82 10 86 12 88 16C90 12 94 12 96 18C92 18 90 22 88 24C86 20 82 18 78 14Z"/></g>';
    }
    if (ex === 'dragon') {
      behind += '<path d="M22 70C8 56 6 38 14 28C18 40 24 46 32 50Z" fill="#7a1d12" ' + OL + '/><path d="M78 70C92 56 94 38 86 28C82 40 76 46 68 50Z" fill="#7a1d12" ' + OL + '/>';
    }
    if (ex === 'lion') {
      /* sun rays behind the mane */
      var rays = ''; for (var r = 0; r < 12; r++) { rays += '<path d="M50 44L' + N(50 + Math.cos(r * 0.5236) * 60) + ' ' + N(44 + Math.sin(r * 0.5236) * 60) + 'L' + N(50 + Math.cos(r * 0.5236 + .2) * 60) + ' ' + N(44 + Math.sin(r * 0.5236 + .2) * 60) + 'Z"/>'; }
      behind += '<g fill="#fff3a0" opacity=".16">' + rays + '</g>';
    }

    /* ---------- BACK HAIR ---------- */
    var back = '';
    var st = C.style, H = U('hair');
    if (st === 'long') back = '<path d="M23 46C18 70 20 90 30 100L70 100C80 90 82 70 77 46C78 22 64 12 50 12C36 12 22 22 23 46Z" fill="' + H + '" ' + OL + '/>';
    if (st === 'bob') back = '<path d="M24 48C20 66 24 72 30 76L70 76C76 72 80 66 76 48C78 22 64 12 50 12C36 12 22 22 24 48Z" fill="' + H + '" ' + OL + '/>';
    if (st === 'mane') {
      var m = 'M50 2'; for (var a = 0; a < 16; a++) { var an = -Math.PI / 2 + a * Math.PI / 8, r1 = 49, r2 = 41; m += 'L' + N(50 + Math.cos(an + .1) * r1) + ' ' + N(46 + Math.sin(an + .1) * r1 * .98) + 'L' + N(50 + Math.cos(an + .2) * r2) + ' ' + N(46 + Math.sin(an + .2) * r2); }
      back = '<path d="' + m + 'Z" fill="' + H + '" ' + OL + '/>';
    }
    if (st === 'twin') back = '<path d="M26 40C16 54 8 70 14 90C22 82 24 70 28 56Z" fill="' + H + '" ' + OL + '/><path d="M74 40C84 54 92 70 86 90C78 82 76 70 72 56Z" fill="' + H + '" ' + OL + '/><path d="M24 46C22 24 36 12 50 12C64 12 78 24 76 46Z" fill="' + H + '" ' + OL + '/>' +
      '<g fill="#e8a0f5" opacity=".75"><circle cx="12" cy="86" r="2"/><circle cx="16" cy="78" r="1.6"/><circle cx="88" cy="86" r="2"/><circle cx="84" cy="78" r="1.6"/></g>';
    if (st === 'slick' || st === 'short' || st === 'spiky' || st === 'swoop') back = '<path d="M25 46C24 24 36 12 50 12C64 12 76 24 75 46Z" fill="' + H + '" ' + OL + '/>';
    if (reaper) back = '<path d="M16 100C14 70 18 30 50 10C82 30 86 70 84 100Z" fill="' + U('cloth') + '" ' + OL + '/>';

    /* ---------- BODY ---------- */
    var body = '<path d="M10 100C12 86 24 78 38 75L62 75C76 78 88 86 90 100Z" fill="' + U('cloth') + '" ' + OL + '/>' +
      '<path d="M16 100C18 90 26 84 36 80" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M90 100C88 88 80 82 70 78" stroke="' + C.bg[2] + '" stroke-opacity=".7" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    if (ex === 'emperor') body += '<path d="M10 100C12 86 24 78 38 75L50 92L62 75C76 78 88 86 90 100Z" fill="url(#' + id('fur') + ')"/><g fill="#fff" opacity=".9"><circle cx="30" cy="84" r="2.2"/><circle cx="24" cy="90" r="2"/><circle cx="70" cy="84" r="2.2"/><circle cx="76" cy="90" r="2"/><circle cx="36" cy="80" r="2"/><circle cx="64" cy="80" r="2"/></g><path d="M44 78L50 98L56 78Z" fill="#ffd23a" ' + OL + '/><circle cx="50" cy="86" r="2.4" fill="#3ad0ff" ' + OL + '/>';
    if (ex === 'emperor') defs += '<defs>' + lg('fur', ['#ffffff', '#dfe4f2'], 0, 0, 0, 1) + '</defs>';
    if (ex === 'vampire') body += '<path d="M30 76L22 60C26 66 34 72 42 74Z" fill="#14030c" ' + OL + '/><path d="M70 76L78 60C74 66 66 72 58 74Z" fill="#14030c" ' + OL + '/><path d="M42 75L50 92L58 75Z" fill="#fff4f4" ' + OL + '/><circle cx="50" cy="86" r="2" fill="#ff3a4a" ' + OL + '/>';
    if (ex === 'mage') body += '<path d="M40 75L50 96L60 75" fill="none" stroke="#ffd23a" stroke-width="1.6" stroke-linecap="round"/><g fill="#ffd23a"><circle cx="30" cy="90" r="1.3"/><circle cx="72" cy="88" r="1.3"/><circle cx="50" cy="98" r="1.3"/></g>';
    if (ex === 'owl') body += '<g fill="#fff0c8" opacity=".92"><path d="M34 76C38 82 42 82 44 76Z"/><path d="M44 76C48 84 52 84 56 76Z"/><path d="M56 76C58 82 62 82 66 76Z"/><path d="M28 86C32 92 36 92 38 86Z"/><path d="M44 90C48 98 52 98 56 90Z"/><path d="M62 86C64 92 68 92 72 86Z"/></g>';
    if (ex === 'shark') body += '<path d="M38 75L50 90L62 75" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><g stroke="#0b3a8a" stroke-opacity=".6" stroke-width="1" stroke-linecap="round"><path d="M22 90l5-2M24 94l5-2M78 90l-5-2M76 94l-5-2"/></g>';
    if (ex === 'wolf') body += '<path d="M30 76C40 86 60 86 70 76L66 72C58 78 42 78 34 72Z" fill="#e8f0ff" ' + OL + '/><g fill="#fff" opacity=".9"><path d="M30 76l-3 8 6-4z"/><path d="M70 76l3 8-6-4z"/></g>';
    if (ex === 'frog') body += '<path d="M36 75L50 86L64 75" fill="none" stroke="#fff6a0" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="88" r="3" fill="#ffe27a" ' + OL + '/>';
    if (ex === 'kraken') body += '<path d="M38 75L50 88L62 75" fill="none" stroke="#53ffd8" stroke-width="1.6" stroke-linecap="round"/><g fill="#ffd23a"><circle cx="50" cy="90" r="1.8"/><circle cx="34" cy="86" r="1.2"/><circle cx="66" cy="86" r="1.2"/></g>';
    if (ex === 'tiger' || ex === 'lion') body += '<path d="M38 75L50 88L62 75" fill="none" stroke="#fff4c0" stroke-width="1.8" stroke-linecap="round"/><g stroke="#2a0d05" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"><path d="M18 94l8-3M80 92l-8-3M24 88l6-2"/></g>';
    if (ex === 'dragon') body += '<g fill="#10121f" opacity=".7"><path d="M26 88l5-4 5 4-5 4zM64 88l5-4 5 4-5 4zM44 94l6-5 6 5-6 5z"/></g><path d="M40 75L50 84L60 75" fill="none" stroke="#ffcf3a" stroke-width="1.6" stroke-linecap="round"/>';
    if (ex === 'alien' || ex === 'unicorn' || ex === 'fairy') body += '<path d="M38 75L50 86L62 75" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.6" stroke-linecap="round"/><circle cx="50" cy="88" r="2.4" fill="' + C.bg[2] + '" ' + OL + '/>';
    if (reaper) body += '<path d="M36 76C40 84 60 84 64 76" fill="none" stroke="#b86bff" stroke-width="1.4" stroke-linecap="round"/>';

    var neck = '<path d="M43 62L43 78C46 81 54 81 57 78L57 62Z" fill="' + U('neck') + '"/><path d="M43 66C46 72 54 72 57 66L57 76C54 78 46 78 43 76Z" fill="#14091f" opacity=".18"/>';

    /* ---------- HEAD ---------- */
    var face = 'M30 46C30 31 38 24 50 24C62 24 70 31 70 46C70 58 62 70 50 74C38 70 30 58 30 46Z';
    var head = '<ellipse cx="50" cy="75" rx="14" ry="4" fill="#14091f" opacity=".28"/>' +
      '<path d="' + face + '" fill="' + U('skin') + '" ' + OL + '/>' +
      '<path d="M64 36C68 44 67 56 60 65" stroke="' + C.bg[2] + '" stroke-opacity=".55" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M32 52C34 62 42 70 50 73C44 66 38 60 36 50Z" fill="' + C.skin[2] + '" opacity=".35"/>';
    /* ears (side) */
    var ears = '';
    if (ex === 'unicorn' || ex === 'fairy' || ex === 'frog' || alien) {
      var ear = '<path d="M31 46C24 44 18 40 16 34C22 36 28 38 32 40Z" fill="' + U('skin') + '" ' + OL + '/>';
      ears += mir(ear);
    }
    /* eyes */
    var eyeAt = function (cx, cy, s, tilt) {
      var e = '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + tilt + ') scale(' + s + ')">';
      if (alien) {
        e += '<path d="M-7 -4C-3 -9 5 -8 7 -1C6 6 -1 10 -6 7C-9 4 -9 0 -7 -4Z" fill="#050912" ' + OL + '/>' +
          '<ellipse cx="-2.4" cy="-2.6" rx="2.4" ry="3" fill="#fff"/><circle cx="2.6" cy="3" r="1.1" fill="#9ff"/><path d="M-6 3C-4 6 0 7 3 5" stroke="' + C.bg[2] + '" stroke-width=".8" fill="none" opacity=".8"/>';
      } else {
        e += '<clipPath id="' + id('c' + cx) + '"><path d="M-6.8 0.4C-5.6 -5.6 -1.4 -7.2 2.2 -7C5.2 -6.8 7 -4.4 7.7 -1.6C7 3.6 3 7.4 -1 7.2C-4.6 6.8 -6.4 4 -6.8 0.4Z"/></clipPath>' +
          '<g clip-path="url(#' + id('c' + cx) + ')"><rect x="-9" y="-9" width="18" height="18" fill="#fffdfb"/>' +
          '<ellipse cx=".6" cy=".6" rx="4.9" ry="6.3" fill="' + U('iris') + '"/>' +
          '<ellipse cx=".6" cy=".6" rx="4.9" ry="6.3" fill="none" stroke="#14091f" stroke-opacity=".55" stroke-width=".9"/>' +
          (C.slit ? '<ellipse cx=".6" cy=".8" rx="1.2" ry="4.8" fill="#140a22"/>' : '<ellipse cx=".6" cy="1" rx="2.2" ry="3.3" fill="#140a22"/>') +
          '<ellipse cx=".6" cy="-2.6" rx="5.6" ry="3.6" fill="' + U('lid') + '" opacity=".85"/>' +
          '<ellipse cx=".6" cy="4.4" rx="3.6" ry="2.2" fill="' + C.eye[1] + '" opacity=".7"/>' +
          '<circle cx="-1.4" cy="-1.8" r="1.9" fill="#fff"/><circle cx="2.8" cy="3.2" r=".85" fill="#fff" opacity=".95"/><circle cx="-2.6" cy="2.2" r=".45" fill="#fff" opacity=".8"/></g>' +
          '<path d="M-7 .6C-6 -5.8 -1.6 -7.6 2.4 -7.3C5.4 -7 7.2 -4.6 8 -1.8C8.6 -2.6 9.2 -3.6 9.6 -4.8C8.8 -1.2 7.8 1 6.6 1.4C6.6 -2.6 3 -5.8 -1 -5.6C-4 -5.4 -6.2 -3.4 -7 .6Z" fill="#1b0d27"/>' +
          '<path d="M-5 5.6C-2.6 7.6 1.8 7.8 4.6 5.4" stroke="#1b0d27" stroke-opacity=".35" stroke-width=".6" fill="none" stroke-linecap="round"/>';
      }
      return e + '</g>';
    };
    var eyeS = alien ? 1.35 : .94;
    var eyes = eyeAt(40.2, 50, eyeS, alien ? -10 : 0) + '<g transform="translate(100 0) scale(-1 1)">' + eyeAt(40.2, 50, eyeS, alien ? -10 : 0) + '</g>';
    var brows = alien ? '' : '<path d="M35.4 41.2C38 39.4 41.6 39 44.6 40" stroke="' + C.hair[2] + '" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".9"/><path d="M64.6 41.2C62 39.4 58.4 39 55.4 40" stroke="' + C.hair[2] + '" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".9"/>';
    var nose = '<path d="M50 56.4C49.4 57.4 50.6 57.8 51 57" stroke="' + C.skin[2] + '" stroke-width=".9" fill="none" stroke-linecap="round"/>';
    var blush = alien ? '' : '<ellipse cx="36.5" cy="58" rx="4.2" ry="2.2" fill="#ff7fa0" opacity=".26"/><ellipse cx="63.5" cy="58" rx="4.2" ry="2.2" fill="#ff7fa0" opacity=".26"/>';
    var mouth;
    if (ex === 'shark') mouth = '<path d="M43 62C47 68 53 68 57 62C53 64 47 64 43 62Z" fill="#8a1230" ' + OL + '/><path d="M44 62.4l1.6 2.4 1.6-2.2 1.6 2.6 1.6-2.6 1.6 2.6 1.6-2.2 1.6 2.4" stroke="none" fill="#fff"/>';
    else if (ex === 'vampire' || ex === 'tiger' || ex === 'dragon' || ex === 'wolf') mouth = '<path d="M44 62C47 66 53 66 56 62C53 63.6 47 63.6 44 62Z" fill="#8a1230" ' + OL + '/><path d="M45.2 62.6l1.2 3 1.4-2.4zM54.8 62.6l-1.2 3-1.4-2.4z" fill="#fff"/>';
    else if (alien) mouth = '<path d="M46 64C48.5 66 51.5 66 54 64" stroke="#145a3a" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
    else mouth = '<path d="M45.4 62.4C47.6 66 52.4 66 54.6 62.4C52.4 63.6 47.6 63.6 45.4 62.4Z" fill="#a8343f" ' + OL + '/><path d="M47 64.6C49 65.8 51 65.8 53 64.6C52 64 48 64 47 64.6Z" fill="#ff8aa0"/>';
    var faceMarks = '';
    if (ex === 'tiger') faceMarks = '<g stroke="#2a0d05" stroke-opacity=".75" stroke-width="1.4" stroke-linecap="round"><path d="M31 50l5 1M31.6 54l5-.4M69 50l-5 1M68.4 54l-5-.4"/></g><path d="M50 30l-1.4 4M50 30l1.4 4" stroke="#2a0d05" stroke-opacity=".7" stroke-width="1.3" stroke-linecap="round"/>';
    if (ex === 'shark') faceMarks = '<g stroke="#0b3a8a" stroke-opacity=".5" stroke-width=".9" stroke-linecap="round"><path d="M31.4 52l4 .6M31.8 55l4 .4M68.6 52l-4 .6M68.2 55l-4 .4"/></g>';
    if (ex === 'wolf') faceMarks = '<path d="M50 28l-2 6M50 28l2 6" stroke="#8aa0d8" stroke-opacity=".8" stroke-width="1.2" stroke-linecap="round"/>';
    if (ex === 'vampire') faceMarks = '<path d="M36 66C42 70 46 72 50 73" stroke="#c79aae" stroke-opacity=".5" stroke-width=".8" fill="none"/>';
    if (ex === 'reaper') faceMarks = '<path d="M38 64C42 62 46 66 50 64C54 66 58 62 62 64" stroke="#b86bff" stroke-opacity=".6" stroke-width=".8" fill="none"/>';
    if (ex === 'mage' || ex === 'emperor') faceMarks = ''; /* beard/mustache drawn later */
    if (ex === 'alien') faceMarks = '<ellipse cx="50" cy="33" rx="8" ry="2.2" fill="#fff" opacity=".35"/>';

    /* ---------- FRONT HAIR ---------- */
    var front = '';
    var bang = 'M27 47C25 28 37 15 50 15C63 15 75 28 73 47C70 39 65 33 58 31C57 37 53 41 48 43C45 39 41 35 36 33C32 37 29 42 27 47Z';
    var spiky = 'M27 48C25 28 37 14 50 14C63 14 75 28 73 48L69.5 38 66.5 49 61.5 34 56 46 50 32 44 46 38.5 34 33.5 49 30.5 38Z';
    var shortB = 'M27 47C25 27 37 14 50 14C63 14 75 27 73 47C69 40 64 36 58 35C54 39 46 39 42 35C36 36 31 40 27 47Z';
    var slickB = 'M27 47C25 26 37 13 52 14C64 15 75 28 73 47C70 38 64 30 56 27C50 36 36 38 27 47Z';
    var sideLocks = '<path d="M29 44C25 56 25 66 28 76C32 66 33 54 33 44Z" fill="' + H + '" ' + OL + '/><path d="M71 44C75 56 75 66 72 76C68 66 67 54 67 44Z" fill="' + H + '" ' + OL + '/>';
    var shineArc = '<path d="M34 29C41 21 59 21 66 29" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M38 24C44 19 56 19 62 24" stroke="#fff" stroke-opacity=".3" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
    var forehead0 = '<path d="M33 40C40 44 60 44 67 40C64 32 56 28 50 28C44 28 36 32 33 40Z" fill="#14091f" opacity=".14"/>';
    if (st === 'long' || st === 'twin' || st === 'mane') front = sideLocks + '<path d="' + bang + '" fill="' + H + '" ' + OL + '/>' + shineArc;
    else if (st === 'bob') front = '<path d="M29 44C26 54 26 62 28 70C32 64 33 54 33 44Z" fill="' + H + '" ' + OL + '/><path d="M71 44C74 54 74 62 72 70C68 64 67 54 67 44Z" fill="' + H + '" ' + OL + '/><path d="' + bang + '" fill="' + H + '" ' + OL + '/>' + shineArc;
    else if (st === 'spiky') front = '<path d="' + spiky + '" fill="' + H + '" ' + OL + '/>' + shineArc;
    else if (st === 'short') front = '<path d="' + shortB + '" fill="' + H + '" ' + OL + '/>' + shineArc;
    else if (st === 'slick') front = '<path d="' + slickB + '" fill="' + H + '" ' + OL + '/>' + shineArc;
    else if (st === 'swoop') front = sideLocks + '<path d="' + slickB + '" fill="' + H + '" ' + OL + '/>' + shineArc;
    var strands = '<g fill="none" stroke="' + C.hair[2] + '" stroke-opacity=".38" stroke-width=".6" stroke-linecap="round"><path d="M40 20C37 26 36 31 36 34"/><path d="M46 17C44 24 44 30 45 36"/><path d="M54 17C56 24 56 30 55 36"/><path d="M60 20C63 26 64 31 64 34"/><path d="M30 50C28 58 28 66 29 72"/><path d="M70 50C72 58 72 66 71 72"/></g>';
    if (front) front = '<path d="M33 41C40 46 60 46 67 41C64 33 57 30 50 30C43 30 36 33 33 41Z" fill="#2a1236" opacity=".16"/>' + front + (alien ? '' : strands);
    if (reaper) front = '<path d="M26 48C24 26 36 12 50 12C64 12 76 26 74 48C70 38 64 32 58 30C56 36 52 40 50 42C48 40 44 36 42 30C36 32 30 38 26 48Z" fill="' + U('cloth') + '" ' + OL + '/><path d="M28 44C28 28 38 18 50 18" stroke="#b86bff" stroke-opacity=".7" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
    if (alien) front = '';

    /* ---------- ACCESSORIES IN FRONT ---------- */
    var acc = '';
    var gold = U('metal');
    if (ex === 'unicorn') acc = '<path d="M50 3L55 22L45 22Z" fill="' + gold + '" ' + OL + '/><path d="M46.6 18l7.2-2.4M47.6 13.4l5.4-1.8M48.6 9l3.4-1" stroke="#a8641a" stroke-width=".9" stroke-linecap="round"/><path d="M48 21L49.6 6" stroke="#fff" stroke-opacity=".8" stroke-width="1" stroke-linecap="round"/>' + mir('<path d="M28 36L18 20L34 30Z" fill="' + U('skin') + '" ' + OL + '/><path d="M28 34L21 24L31 30Z" fill="#ffb4d8"/>') + '<path d="M62 24l3-4 3 4-3 4z" fill="#ffd23a" ' + OL + '/>' + spark(76, 30, 3, 2.1, '#fff');
    if (ex === 'dragon') acc = mir('<path d="M33 22C26 14 28 4 38 2C32 8 34 14 40 18Z" fill="url(#' + id('horn') + ')" ' + OL + '/>');
    if (ex === 'dragon') defs += '<defs>' + lg('horn', ['#fff0c0', '#d9a03a', '#6a3a0c'], 0, 0, 1, 1) + '</defs>';
    if (ex === 'frog') acc = '<path d="M28 34C24 18 38 12 50 12C62 12 76 18 72 34C66 26 34 26 28 34Z" fill="#37b560" ' + OL + '/>' + mir('<circle cx="34" cy="16" r="8" fill="#5fd57a" ' + OL + '/><circle cx="34" cy="16" r="5.4" fill="#fff"/><circle cx="35.4" cy="16.6" r="3" fill="#141a2a"/><circle cx="34.4" cy="15" r="1.1" fill="#fff"/>') +
      '<path d="M38 14L40 6L45 11L50 4L55 11L60 6L62 14Z" fill="' + gold + '" ' + OL + '/><circle cx="50" cy="10" r="1.4" fill="#ff5a7a"/>';
    if (ex === 'tiger') acc = mir('<path d="M28 34L20 14L38 24Z" fill="#ff8a1a" ' + OL + '/><path d="M28 32L23 19L35 25Z" fill="#ffd6a0"/>') + '<g stroke="#2a0d05" stroke-opacity=".7" stroke-width="1.5" stroke-linecap="round"><path d="M42 18l-2 5M58 18l2 5M50 15v5"/></g>';
    if (ex === 'lion') acc = mir('<circle cx="28" cy="26" r="6" fill="#f2b631" ' + OL + '/><circle cx="28" cy="26" r="3.4" fill="#ffd9a0"/>') + '<path d="M38 20L40 9L45 15L50 6L55 15L60 9L62 20Z" fill="' + gold + '" ' + OL + '/><circle cx="50" cy="14" r="2" fill="#ff6a2a" ' + OL + '/>';
    if (ex === 'fairy') acc = '<path d="M42 20C40 12 36 8 32 6M58 20C60 12 64 8 68 6" stroke="#8a4fe0" stroke-width="1.2" fill="none" stroke-linecap="round"/><circle cx="32" cy="6" r="2.6" fill="#ff9bf0" ' + OL + '/><circle cx="68" cy="6" r="2.6" fill="#7ff0ff" ' + OL + '/><path d="M46 22l4-3 4 3-4 4z" fill="#7ff0ff" ' + OL + '/>' + spark(22, 28, 2.6, 1.9, '#fff') + spark(80, 40, 2, 2.6, '#fff');
    if (ex === 'kraken') acc = '<path d="M20 28C22 10 40 2 50 4C60 2 78 10 80 28C70 22 64 26 50 24C36 26 30 22 20 28Z" fill="#241046" ' + OL + '/><path d="M20 28C34 32 66 32 80 28C78 33 66 36 50 36C34 36 22 33 20 28Z" fill="#3f1664" ' + OL + '/><path d="M44 8L56 8L56 20L44 20Z" fill="none"/><circle cx="50" cy="18" r="4.4" fill="#fff6e8" ' + OL + '/><rect x="47.4" y="21" width="5.2" height="2.6" rx=".8" fill="#fff6e8" ' + OL + '/><circle cx="48.6" cy="17.6" r="1.1" fill="#241046"/><circle cx="51.4" cy="17.6" r="1.1" fill="#241046"/><path d="M26 26C40 20 60 20 74 26" stroke="#ffd23a" stroke-width="1.4" fill="none"/>';
    if (ex === 'shark') acc = '<path d="M50 6C44 14 44 20 48 24L58 24C58 16 56 10 50 6Z" fill="#2a8fe0" ' + OL + '/><path d="M50 8C47 14 47 19 49 23" stroke="#bff" stroke-opacity=".7" stroke-width="1" fill="none"/>';
    if (ex === 'wolf') acc = mir('<path d="M29 36L22 12L42 24Z" fill="#c8d4ec" ' + OL + '/><path d="M29 34L25 18L38 25Z" fill="#6c7aa8"/>');
    if (ex === 'owl') acc = mir('<path d="M30 30L20 8L40 22Z" fill="#8a5a2e" ' + OL + '/><path d="M30 28L24 14L37 23Z" fill="#d7a06a"/>') +
      '<g fill="none" stroke="#ffcf3a" stroke-width="1.7"><circle cx="40.6" cy="49" r="8.6"/><circle cx="59.4" cy="49" r="8.6"/><path d="M49 49h2"/></g><g fill="#fff" opacity=".16"><circle cx="40.6" cy="49" r="8.4"/><circle cx="59.4" cy="49" r="8.4"/></g><path d="M35 44C37 41 40 40 43 41" stroke="#fff" stroke-opacity=".7" stroke-width=".9" fill="none" stroke-linecap="round"/>';
    if (ex === 'mage') acc = '<path d="M16 34C30 38 70 38 84 34C80 26 66 24 50 24C34 24 20 26 16 34Z" fill="#5a2fb5" ' + OL + '/><path d="M26 28C32 18 40 8 54 -2C54 8 58 14 66 24Z" fill="url(#' + id('hat') + ')" ' + OL + '/><path d="M28 32C40 35 60 35 72 32" stroke="#ffd23a" stroke-width="1.6" fill="none"/>' + spark(52, 12, 3, 1.6, '#ffe680') + spark(44, 22, 1.8, 2.2, '#fff') +
      '<path d="M36 64C40 76 60 76 64 64C58 68 42 68 36 64Z" fill="#fff" ' + OL + '/><path d="M42 61C46 59 54 59 58 61C54 63 46 63 42 61Z" fill="#fff" ' + OL + '/>';
    if (ex === 'mage') defs += '<defs>' + lg('hat', ['#a47bff', '#5a2fb5', '#241056'], 0, 0, 1, 1) + '</defs>';
    if (ex === 'vampire') acc = '<path d="M60 22C70 24 74 34 73 44C70 36 66 32 60 30Z" fill="#14030c" opacity=".5"/><g fill="#ff3a4a" opacity=".9"><circle cx="50" cy="31" r="1.3"/></g>';
    if (ex === 'alien') acc = '<path d="M44 26C42 16 38 10 34 8M56 26C58 16 62 10 66 8" stroke="#2f9a62" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="34" cy="8" r="3" fill="#7dffb0" ' + OL + '><animate attributeName="opacity" values="1;.4;1" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="66" cy="8" r="3" fill="#7dffb0" ' + OL + '><animate attributeName="opacity" values="1;.4;1" dur="1.6s" begin=".8s" repeatCount="indefinite"/></circle>' +
      '<path d="M26 40C26 16 40 6 50 6C60 6 74 16 74 40" fill="none" stroke="#9fd0ff" stroke-opacity=".7" stroke-width="1.6"/><path d="M30 24C34 14 44 9 52 9" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    if (reaper) acc = '<g fill="#fff" opacity=".9"><path d="M34 52C38 58 44 60 50 60" stroke="#f6f0ff" stroke-width="0" /></g><path d="M36 62C40 66 60 66 64 62L62 70C56 74 44 74 38 70Z" fill="#f6f0ff" ' + OL + '/><path d="M42 64v5M46 65v6M50 65v6M54 65v6M58 64v5" stroke="#171230" stroke-width=".9"/>' + spark(80, 30, 2.6, 2.3, '#e7c8ff') + spark(18, 56, 2, 2.9, '#e7c8ff');
    if (ex === 'emperor') acc = '<path d="M30 28L32 8L41 18L50 3L59 18L68 8L70 28C60 31 40 31 30 28Z" fill="' + gold + '" ' + OL + '/><path d="M31 25C42 28 58 28 69 25" stroke="#a8641a" stroke-width="1" fill="none"/><circle cx="50" cy="19" r="2.8" fill="#ff3a5a" ' + OL + '/><circle cx="40" cy="22" r="1.8" fill="#3ad0ff" ' + OL + '/><circle cx="60" cy="22" r="1.8" fill="#3ad0ff" ' + OL + '/><circle cx="32" cy="8" r="1.8" fill="#fff6c0" ' + OL + '/><circle cx="68" cy="8" r="1.8" fill="#fff6c0" ' + OL + '/><circle cx="50" cy="3" r="1.8" fill="#fff6c0" ' + OL + '/>' +
      '<path d="M43 61C47 59 53 59 57 61" stroke="#e1e5f2" stroke-width="2" fill="none" stroke-linecap="round"/>';

    /* ---------- LIGHTING OVERLAY (the 3D look) ---------- */
    var light = '<path d="M30 46C30 31 38 24 50 24C62 24 70 31 70 46C70 58 62 70 50 74C38 70 30 58 30 46Z" fill="url(#' + id('ao') + ')" opacity=".26"/>';
    defs += '<defs>' + rg('ao', ['#ffffff00', '#ffffff00', '#14091f66'], .38, .3, .85) + rg('spec', ['#ffffffaa', '#ffffff00'], .5, .5, .5) + '</defs>';
    var floor = '<rect x="0" y="82" width="100" height="18" fill="' + U('floor') + '" opacity=".5"/>';
    var rim = '<path d="M8 100C10 84 20 76 32 73" stroke="' + C.bg[2] + '" stroke-opacity=".35" stroke-width=".8" fill="none"/>';
    var frame = '<rect x=".5" y=".5" width="99" height="99" rx="0" fill="none" stroke="#fff" stroke-opacity=".12"/>';

    return defs + bg +
      '<g class="z-mid">' + behind + back + body + neck + head + ears + faceMarks + blush + nose + eyes + brows + mouth + light + front + acc + rim + '</g>' +
      '<g class="z-fg"><ellipse cx="32" cy="30" rx="14" ry="9" fill="url(#' + id('spec') + ')" opacity=".25"/>' + floor + frame + '</g>';
  }
  window.animeArt3D = art;
})();
