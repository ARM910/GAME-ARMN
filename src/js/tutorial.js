/* GAME ARMN — first-run tutorial
   The first time a player enters a game, a short "how to play" card appears.
   Once dismissed it never appears again for that game (saved in localStorage "armnTut:<game>").
   The ❓ button inside a game can still reopen the full help. */
(function () {
  'use strict';
  var KEY = 'armnTut:';
  var ICON = { xo: '❌⭕', snake: '🐍', maze: '🧩', orbit: '🪐', bricks: '🧱', runner: '🏃', t2048: '🔢', memory: '🃏', blocks: '🧊', flip: '🔄' };
  var TXT = {
    xo: {
      t: ['إكس-أو', 'X-O'],
      s: [
        ['👆', 'اضغط على أي خانة فاضية لتضع قطعتك.', 'Tap any empty cell to place your piece.'],
        ['♻️', 'لكل لاعب 3 قطع فقط؛ الرابعة تمحو أقدم قطعة عندك.', 'Each player has only 3 pieces; the 4th erases your oldest one.'],
        ['🏆', 'صُفّ 3 قطع في خط (أفقي أو عمودي أو قطري) لتفوز.', 'Line up 3 pieces in a row, column or diagonal to win.'],
        ['🌍', 'تقدر تلعب ضد الكمبيوتر أو أونلاين مع صديق بكود غرفة.', 'Play the computer, or online with a friend using a room code.']
      ]
    },
    snake: {
      t: ['الدودة', 'Snake'],
      s: [
        ['👆', 'اسحب بإصبعك أو استخدم الأسهم لتغيير الاتجاه.', 'Swipe or use the arrow keys to steer.'],
        ['🍎', 'كل تفاحة تطوّلك وتزيد نقاطك.', 'Every apple makes you longer and scores points.'],
        ['⚠️', 'لا تصطدم بنفسك أو بالجدار (حسب نوع الجدار).', 'Do not hit yourself or the wall (depending on wall mode).'],
        ['⚙️', 'من زر الإعدادات غيّر السرعة والحجم والعقبات.', 'Use the settings button to change speed, size and obstacles.']
      ]
    },
    maze: {
      t: ['المتاهة', 'Maze'],
      s: [
        ['🕹️', 'حرّك اللاعب بالسحب أو الأسهم داخل المتاهة.', 'Move with swipes or arrow keys through the maze.'],
        ['🔑', 'اجمع المفاتيح والجواهر ثم اعبر البوابة.', 'Collect keys and gems, then reach the gate.'],
        ['👾', 'تجنّب الأعداء، لديك عدد محدود من الأرواح.', 'Avoid enemies — you only have a few lives.'],
        ['⭐', 'تقدمك يُحفظ لكل مرحلة وتحصل على نجوم حسب أدائك.', 'Progress is saved per level and you earn stars.']
      ]
    },
    orbit: {
      t: ['مدار', 'Orbit'],
      s: [
        ['🪐', 'أنت تدور حول كوكب.', 'You circle around a planet.'],
        ['👆', 'اضغط في اللحظة المناسبة لتنطلق نحو الكوكب التالي.', 'Tap at the right moment to launch to the next planet.'],
        ['💣', 'تجنّب الألغام ولا تخرج عن المسار.', 'Avoid mines and do not drift off course.'],
        ['⭐', 'التقط النجوم لزيادة النتيجة.', 'Grab stars to boost your score.']
      ]
    },
    bricks: {
      t: ['الطوب', 'Bricks'],
      s: [
        ['👆', 'حرّك المضرب بإصبعك أو الماوس يميناً ويساراً.', 'Drag the paddle left and right with your finger or mouse.'],
        ['⚽', 'ارتدّ الكرة لتكسر الطوب ولا تدعها تسقط.', 'Bounce the ball to break bricks; do not let it fall.'],
        ['🎁', 'التقط الهدايا الساقطة للحصول على مزايا.', 'Catch falling gifts for power-ups.'],
        ['🏁', 'حطّم كل الطوب لتنهي المرحلة.', 'Clear every brick to finish the level.']
      ]
    },
    runner: {
      t: ['العدّاء', 'Runner'],
      s: [
        ['👆', 'اضغط على الشاشة أو مسطرة المسافة لتقفز.', 'Tap the screen or press Space to jump.'],
        ['🌵', 'اقفز فوق العوائق على الأرض.', 'Jump over obstacles on the ground.'],
        ['🦅', 'انحنِ تحت الطائرات (اسحب للأسفل أو سهم لأسفل).', 'Duck under flyers (swipe down or press the down arrow).'],
        ['⚡', 'السرعة تزيد مع الوقت، اقطع مسافة أطول!', 'Speed rises over time — go as far as you can!']
      ]
    },
    t2048: {
      t: ['2048', '2048'],
      s: [
        ['👆', 'اسحب في أي اتجاه لتتحرك كل المربعات.', 'Swipe in any direction to slide all tiles.'],
        ['➕', 'مربعان بنفس الرقم يندمجان ويتضاعفان.', 'Two tiles with the same number merge and double.'],
        ['🎯', 'هدفك الوصول إلى المربع 2048.', 'Your goal is to reach the 2048 tile.'],
        ['🧠', 'خطّط للحركات حتى لا تمتلئ اللوحة.', 'Plan ahead so the board does not fill up.']
      ]
    },
    memory: {
      t: ['الذاكرة', 'Memory'],
      s: [
        ['👆', 'اضغط على بطاقتين لتقلبهما.', 'Tap two cards to flip them.'],
        ['✅', 'إذا تطابقتا تبقيان مكشوفتين.', 'If they match they stay face up.'],
        ['❌', 'إذا اختلفتا تُقلبان من جديد، فتذكّر أماكنهما.', 'If not they flip back — remember where they were.'],
        ['🏆', 'طابق كل الأزواج بأقل عدد من الحركات.', 'Match every pair in as few moves as you can.']
      ]
    },
    blocks: {
      t: ['المكعبات', 'Blocks'],
      s: [
        ['👆', 'حرّك القطعة يميناً ويساراً بالسحب أو الأسهم.', 'Move the piece left/right with swipes or arrows.'],
        ['🔄', 'اضغط على القطعة أو سهم الأعلى لتدويرها.', 'Tap the piece or press up to rotate it.'],
        ['⬇️', 'اسحب للأسفل لإنزالها أسرع.', 'Swipe down to drop it faster.'],
        ['✨', 'أكمل صفاً كاملاً ليختفي وتحصل على نقاط.', 'Complete a full row to clear it and score.']
      ]
    },
    flip: {
      t: ['قلب الجاذبية', 'Gravity Flip'],
      s: [
        ['👆', 'اضغط في أي مكان لقلب الجاذبية بين الأرض والسقف.', 'Tap anywhere to flip gravity between floor and ceiling.'],
        ['🔺', 'تفادَ الأشواك في الأرض والسقف.', 'Dodge spikes on the floor and ceiling.'],
        ['⭐', 'التقط النجوم لرفع نتيجتك.', 'Collect stars to raise your score.'],
        ['⚡', 'كلما طال بقاؤك زادت السرعة.', 'The longer you survive, the faster it gets.']
      ]
    }
  };

  var css = '.tut{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(3,6,20,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:tutIn .25s ease both}' +
    '.tut[hidden]{display:none}' +
    '.tut-c{width:min(420px,100%);max-height:92vh;overflow:auto;border-radius:24px;padding:22px 18px 18px;color:#eaf1ff;text-align:center;background:linear-gradient(170deg,#18285a,#0b1230 70%);border:1px solid rgba(124,198,255,.45);box-shadow:0 30px 70px -20px #000,0 0 0 1px rgba(255,255,255,.06) inset,0 0 40px -10px rgba(60,160,255,.5)}' +
    '.tut-ic{font-size:44px;line-height:1;filter:drop-shadow(0 6px 8px rgba(0,0,0,.5))}' +
    '.tut-h{margin:8px 0 2px;font-size:22px;font-weight:900}' +
    '.tut-sub{margin:0 0 14px;font-size:13px;opacity:.7}' +
    '.tut-l{list-style:none;margin:0 0 16px;padding:0;display:flex;flex-direction:column;gap:9px;text-align:start}' +
    '.tut-l li{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:14.5px;line-height:1.55}' +
    '.tut-l li b{flex:0 0 38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:linear-gradient(160deg,#2b4fa8,#14246a)}' +
    '.tut-go{width:100%;border:0;border-radius:16px;padding:13px;font:inherit;font-weight:900;font-size:16px;color:#04112a;cursor:pointer;background:linear-gradient(180deg,#8be0ff,#2f9bff);box-shadow:0 4px 0 #0c4d9a,0 12px 20px -6px rgba(0,0,0,.6)}' +
    '.tut-go:active{transform:translateY(3px);box-shadow:0 1px 0 #0c4d9a}' +
    '@keyframes tutIn{from{opacity:0}to{opacity:1}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var box = document.createElement('div'); box.className = 'tut'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
  document.body.appendChild(box);
  var openFor = null;

  function lang() { try { var l = JSON.parse(localStorage.getItem('armn:lang')); if (l === 'en') return 'en'; } catch (e) { } return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  function seen(g) { try { return localStorage.getItem(KEY + g) === '1'; } catch (e) { return false; } }
  function mark(g) { try { localStorage.setItem(KEY + g, '1'); } catch (e) { } }

  function show(g) {
    var d = TXT[g]; if (!d) return;
    var en = lang() === 'en', i = en ? 1 : 0;
    box.dir = en ? 'ltr' : 'rtl';
    box.innerHTML = '<div class="tut-c"><div class="tut-ic">' + ICON[g] + '</div><h2 class="tut-h">' + (en ? 'How to play ' : 'كيف تلعب ') + d.t[i] + '</h2>' +
      '<p class="tut-sub">' + (en ? 'This tip appears only once.' : 'هذه التعليمات تظهر مرة واحدة فقط.') + '</p><ul class="tut-l">' +
      d.s.map(function (r) { return '<li><b>' + r[0] + '</b><span>' + r[en ? 2 : 1] + '</span></li>'; }).join('') +
      '</ul><button type="button" class="tut-go">' + (en ? 'Got it, let’s play' : 'فهمت، يلا نلعب') + '</button></div>';
    box.hidden = false; openFor = g;
    var btn = box.querySelector('.tut-go'); btn.focus();
    btn.onclick = close;
  }
  function close() { if (openFor) mark(openFor); openFor = null; box.hidden = true; }
  document.addEventListener('keydown', function (e) { if (!box.hidden && (e.key === 'Escape' || e.key === 'Enter')) close(); });

  function check() {
    var h = (location.hash || '').replace('#', '');
    if (!TXT[h]) { if (!box.hidden && openFor && openFor !== h) { box.hidden = true; openFor = null; } return; }
    if (seen(h) || openFor === h) return;
    setTimeout(function () { if ((location.hash || '').replace('#', '') === h && !seen(h)) show(h); }, 350);
  }
  window.addEventListener('hashchange', check);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check); else check();
})();
