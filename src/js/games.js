(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const store={
  get(k,d){try{const v=localStorage.getItem('armn:'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('armn:'+k,JSON.stringify(v))}catch(e){}}
};

/* ---------- language ---------- */
const T={
ar:{back:'رجوع',sound:'الصوت',tagline:'اختر لعبتك',xo_name:'إكس-أو أونلاين',snake_name:'الدودة',
 xo_desc:'ثلاث قطع فقط على اللوحة. القطعة الرابعة تمحو أقدم قطعة عندك.',snake_desc:'كل تفاحة تجعلك أطول. لا تصطدم بنفسك ولا بالجدار.',
 play:'العب',badge_open:'مفتوحة المصدر',badge_touch:'لمس وكيبورد',options:'الخيارات',
 xo_draw:'تعادل',undo:'تراجع',hint:'تلميح',newround:'جولة جديدة',resetscores:'تصفير النتائج',
 opt_mode:'نمط اللعب',mode_ai:'ضد الكمبيوتر',mode_pvp:'لاعبان',opt_diff:'الصعوبة',d_easy:'سهل',d_med:'متوسط',d_hard:'صعب',
 opt_me:'تلعب بـ',opt_first:'من يبدأ',f_alt:'بالتناوب',opt_max:'عدد القطع لكل لاعب',opt_old:'إظهار القطعة التي ستختفي',
 opt_note:'القطعة الباهتة هي التي ستختفي عند وضع قطعتك التالية. الفوز بثلاث قطع في خط واحد.',
 you:'أنت',cpu:'الكمبيوتر',pl1:'لاعب 1',pl2:'لاعب 2',turn_you:'دورك',turn_cpu:'الكمبيوتر يفكر…',turn_x:'دور X',turn_o:'دور O',
 win_you:'فزت!',win_cpu:'فاز الكمبيوتر',win_x:'فاز X!',win_o:'فاز O!',draw_msg:'تعادل',next:'الجولة التالية',
 sc_score:'النقاط',sc_best:'الأفضل',sc_len:'الطول',slowmo:'تبريد',pause:'إيقاف مؤقت',restart:'إعادة',
 opt_size:'حجم اللوحة',s_small:'صغير',s_med:'وسط',s_big:'كبير',opt_speed:'السرعة',sp_chill:'هادئ',sp_normal:'عادي',sp_fast:'سريع',sp_insane:'جنوني',
 opt_walls:'الجدران',w_solid:'تقتل',w_wrap:'عبور',opt_obst:'صخور عشوائية',opt_power:'مكافآت: ذهبية وتبريد',opt_ramp:'تزداد السرعة تدريجياً',
 opt_dpad:'أزرار الاتجاهات',opt_fps:'عرض الإطارات FPS',
 sn_note:'التفاحة الذهبية تعطي 50 نقطة، والنجمة الزرقاء تبطئ الدودة 5 ثوان.',
 ready:'جاهز؟',ready_sub:'اسحب بإصبعك أو استخدم الأسهم أو الأزرار',start:'ابدأ',paused:'متوقفة',paused_sub:'خذ استراحة قصيرة',resume:'أكمل',
 over:'انتهت اللعبة',again:'العب مجدداً',newbest:'رقم قياسي جديد!',yourscore:'نقاطك'},
en:{back:'Back',sound:'Sound',tagline:'Pick your game',xo_name:'X-O Online',snake_name:'Snake',
 xo_desc:'Only three pieces on the board. The fourth erases your oldest one.',snake_desc:'Every apple makes you longer. Do not hit yourself or the wall.',
 play:'Play',badge_open:'Open source',badge_touch:'Touch + keyboard',options:'Options',
 xo_draw:'Draw',undo:'Undo',hint:'Hint',newround:'New round',resetscores:'Reset scores',
 opt_mode:'Mode',mode_ai:'Vs computer',mode_pvp:'Two players',opt_diff:'Difficulty',d_easy:'Easy',d_med:'Medium',d_hard:'Hard',
 opt_me:'You play',opt_first:'Who starts',f_alt:'Alternate',opt_max:'Pieces per player',opt_old:'Show the piece that will vanish',
 opt_note:'The faded piece disappears when you place your next one. Get three in a row to win.',
 you:'You',cpu:'Computer',pl1:'Player 1',pl2:'Player 2',turn_you:'Your turn',turn_cpu:'Computer is thinking…',turn_x:"X's turn",turn_o:"O's turn",
 win_you:'You win!',win_cpu:'Computer wins',win_x:'X wins!',win_o:'O wins!',draw_msg:'Draw',next:'Next round',
 sc_score:'Score',sc_best:'Best',sc_len:'Length',slowmo:'Slow-mo',pause:'Pause',restart:'Restart',
 opt_size:'Board size',s_small:'Small',s_med:'Medium',s_big:'Large',opt_speed:'Speed',sp_chill:'Chill',sp_normal:'Normal',sp_fast:'Fast',sp_insane:'Insane',
 opt_walls:'Walls',w_solid:'Deadly',w_wrap:'Wrap around',opt_obst:'Random rocks',opt_power:'Bonuses: gold apple and slow-mo',opt_ramp:'Speed ramps up',
 opt_dpad:'On-screen D-pad',opt_fps:'Show FPS',
 sn_note:'A golden apple gives 50 points. The blue star slows the snake for 5 seconds.',
 ready:'Ready?',ready_sub:'Swipe, use the arrow keys, or tap the D-pad',start:'Start',paused:'Paused',paused_sub:'Take a short break',resume:'Resume',
 over:'Game over',again:'Play again',newbest:'New best score!',yourscore:'Your score'}
};
Object.assign(T.ar,{
 full:'ملء الشاشة',opts_btn:'الخيارات',close:'إغلاق',badge_full:'شاشة كاملة',
 maze_name:'المتاهة',maze_desc:'30 مرحلة من السهل إلى الصعب: مفاتيح وجواهر وأعداء وظلام.',
 orbit_name:'مدار',orbit_desc:'لعبة من ابتكاري. دُر حول الكواكب ثم أفلت في اللحظة المناسبة.',
 level:'المرحلة',mz_time:'الوقت',mz_gems:'جواهر',mz_keys:'مفاتيح',mz_lives:'أرواح',mz_levels:'المراحل',mz_pick:'اختر مرحلتك',stars_w:'نجمة',
 mz_how:'اسحب بإصبعك أو استخدم الأسهم. اجمع المفاتيح لفتح البوابة الذهبية.',mz_clear:'أنجزت المرحلة!',mz_fail:'خسرت كل أرواحك',mz_next:'المرحلة التالية',mz_replay:'أعد المرحلة',mz_retry:'حاول مجدداً',
 mz_need:'اجمع كل المفاتيح أولاً',mz_par:'الوقت المثالي',mz_best:'أفضل وقت',mz_fogc:'ظلام',mz_foes:'أعداء',hint_left:'تلميح',
 opt_lives:'عدد الأرواح',opt_hints:'التلميحات (3 لكل مرحلة)',opt_map:'الخريطة المصغرة',opt_fog:'الظلام في المراحل المتقدمة',opt_unlock:'فتح كل المراحل',resetprog:'مسح التقدم',resetprog2:'اضغط مرة أخرى للتأكيد',
 mz_note:'ثلاث نجوم: أنهِ المرحلة، اجمع كل الجواهر، ثم أنهِ قبل الوقت المثالي.',
 sn_skin:'شكل الدودة',sk_mint:'نعناع',sk_sky:'سماء',sk_coral:'مرجان',sk_gold:'ذهب',sk_rainbow:'قوس قزح',opt_haptic:'اهتزاز',
 opt_series:'نظام المباراة',ser_0:'مفتوحة',ser_3:'أفضل من 3',ser_5:'أفضل من 5',match_you:'ربحت المباراة!',match_cpu:'خسرت المباراة',match_x:'فاز X بالمباراة',match_o:'فاز O بالمباراة',
 or_stars:'نجوم',or_launch:'أفلت',or_hint:'اضغط في أي مكان أو مسطرة المسافة لتنطلق من المدار',or_aim:'خط التصويب',or_mines:'ألغام',or_trail:'ذيل المذنّب',
 or_note:'تحلّق حول كوكب ثم تفلت لتلتقط الكوكب التالي. السقوط في الفراغ أو ملامسة لغم ينهي اللعبة. الالتقاط القريب من الحلقة يرفع التسلسل.',
 or_ready_s:'اضغط لتنطلق من المدار نحو الكوكب التالي',or_perfect:'مثالي',mz_gateopen:'البوابة الذهبية مفتوحة'});
Object.assign(T.en,{
 full:'Fullscreen',opts_btn:'Options',close:'Close',badge_full:'Full screen',
 maze_name:'Maze',maze_desc:'30 levels from easy to brutal: keys, gems, enemies and fog.',
 orbit_name:'Orbit',orbit_desc:'My own invention. Circle a planet, then let go at the right moment.',
 level:'Level',mz_time:'Time',mz_gems:'Gems',mz_keys:'Keys',mz_lives:'Lives',mz_levels:'Levels',mz_pick:'Choose a level',stars_w:'stars',
 mz_how:'Swipe or use the arrow keys. Collect keys to open the golden gate.',mz_clear:'Level cleared!',mz_fail:'Out of lives',mz_next:'Next level',mz_replay:'Replay',mz_retry:'Try again',
 mz_need:'Collect every key first',mz_par:'Par time',mz_best:'Best time',mz_fogc:'Fog',mz_foes:'Enemies',hint_left:'Hint',
 opt_lives:'Lives',opt_hints:'Hints (3 per level)',opt_map:'Minimap',opt_fog:'Fog in late levels',opt_unlock:'Unlock all levels',resetprog:'Reset progress',resetprog2:'Tap again to confirm',
 mz_note:'Three stars: finish, grab every gem, then beat the par time.',
 sn_skin:'Snake skin',sk_mint:'Mint',sk_sky:'Sky',sk_coral:'Coral',sk_gold:'Gold',sk_rainbow:'Rainbow',opt_haptic:'Vibration',
 opt_series:'Match',ser_0:'Endless',ser_3:'Best of 3',ser_5:'Best of 5',match_you:'You win the match!',match_cpu:'Computer wins the match',match_x:'X wins the match',match_o:'O wins the match',
 or_stars:'Stars',or_launch:'Launch',or_hint:'Tap anywhere or press Space to leave the orbit',or_aim:'Aim line',or_mines:'Mines',or_trail:'Comet trail',
 or_note:'Circle a planet, then release to catch the next one. Falling into space or touching a mine ends the run. Catching close to the ring builds your streak.',
 or_ready_s:'Tap to leave the orbit toward the next planet',or_perfect:'Perfect',mz_gateopen:'The golden gate is open'});
T.ar.opt_lead='الفارق الذي ينهي المباراة (ثم تعود النقاط 0)';T.en.opt_lead='Lead that ends the match (scores reset to 0)';
const COARSE=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
const REDUCED=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const drawerOpen=()=>!!$('.drawer.open');
/* confetti (shared) */
const fx=$('#fx'),fxc=fx.getContext('2d');let fxP=[],fxRaf=0;
function confetti(){
  if(REDUCED)return;
  const W=fx.width=innerWidth,H=fx.height=innerHeight,cols=['#f09a8a','#86c3e6','#7fd6a8','#f0cb7a','#b9a8ec'];
  for(let i=0;i<120;i++)fxP.push({x:W/2+(Math.random()-.5)*W*.3,y:H*.55,vx:(Math.random()-.5)*15,vy:-Math.random()*17-6,r:Math.random()*6.28,vr:(Math.random()-.5)*.4,s:5+Math.random()*6,c:rnd(cols),l:1});
  if(!fxRaf)fxRaf=requestAnimationFrame(fxLoop);
}
function fxLoop(){
  fxc.clearRect(0,0,fx.width,fx.height);
  fxP=fxP.filter(p=>p.l>0&&p.y<fx.height+30);
  for(const p of fxP){p.vy+=.45;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.l-=.006;
    fxc.save();fxc.globalAlpha=Math.min(1,p.l*2);fxc.translate(p.x,p.y);fxc.rotate(p.r);fxc.fillStyle=p.c;fxc.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);fxc.restore()}
  fxRaf=fxP.length?requestAnimationFrame(fxLoop):0;
  if(!fxP.length)fxc.clearRect(0,0,fx.width,fx.height);
}
let lang=store.get('lang','ar'); if(!T[lang])lang='ar';
const t=k=>(T[lang]&&T[lang][k])||T.en[k]||k;
function applyLang(){
  document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  $$('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
  $$('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));
  $('#btnLang').textContent=lang==='ar'?'EN':'عربي';
  document.dispatchEvent(new Event('langchange'));
}
$('#btnLang').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';store.set('lang',lang);applyLang()});

/* ---------- sound ---------- */
let soundOn=store.get('sound',true), actx=null;
function tone(f,d=.1,type='sine',v=.05,when=0,slide=0){
  if(!soundOn)return;
  try{
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    if(actx.state==='suspended')actx.resume();
    const o=actx.createOscillator(),g=actx.createGain(),t0=actx.currentTime+when;
    o.type=type;o.frequency.setValueAtTime(f,t0);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t0+d);
    g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
    o.connect(g);g.connect(actx.destination);o.start(t0);o.stop(t0+d+.03);
  }catch(e){}
}
const btnSound=$('#btnSound');
const paintSound=()=>btnSound.classList.toggle('off',!soundOn);
paintSound();
btnSound.addEventListener('click',()=>{soundOn=!soundOn;store.set('sound',soundOn);paintSound();tone(660,.08)});

/* ---------- option binder ---------- */
function bindOpts(game,opts,onChange){
  $$('[data-game="'+game+'"]').forEach(el=>{
    const k=el.dataset.opt;
    if(el.classList.contains('seg')){
      const paint=()=>$$('button',el).forEach(b=>{const on=String(opts[k])===b.dataset.v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
      paint();
      el.addEventListener('click',e=>{
        const b=e.target.closest('button'); if(!b)return;
        const v=b.dataset.v; opts[k]=isNaN(v)?v:Number(v);
        store.set(game+'-opts',opts);paint();tone(520,.05,'triangle',.03);onChange(k);
      });
    }else if(el.classList.contains('tgl')){
      const paint=()=>el.setAttribute('aria-checked',String(!!opts[k]));
      paint();
      el.addEventListener('click',()=>{opts[k]=!opts[k];store.set(game+'-opts',opts);paint();tone(480,.05,'triangle',.03);onChange(k)});
    }
  });
}

/* ---------- X-O: vanishing pieces ---------- */
const XO=(()=>{
  const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const ORDER=[4,0,2,6,8,1,3,5,7];
  const opts=Object.assign({mode:'ai',diff:'hard',me:'X',first:'X',max:3,showOld:true,series:0,lead:0},store.get('xo-opts',{}));
  const mw={X:0,O:0};
  const score=Object.assign({X:0,O:0,D:0},store.get('xo-score',{}));
  /* permanent wins counter: one number that only ever goes up (old builds split wins between 'xo-wins' and the resettable 'xo-score', so wins were lost on reset / match end) */
  if(!store.get('xo-wins-v2',0)){store.set('xo-wins',(+store.get('xo-wins',0)||0)+(+score.X||0));store.set('xo-wins-v2',1)}
  const addWin=()=>store.set('xo-wins',(+store.get('xo-wins',0)||0)+1);
  const boardEl=$('#board');
  boardEl.innerHTML=Array.from({length:9},(_,i)=>'<button class="cell" data-i="'+i+'" aria-label="'+(i+1)+'"></button>').join('')+
    '<svg class="winline" viewBox="0 0 300 300" hidden><line x1="0" y1="0" x2="0" y2="0"/></svg>';
  const cells=$$('.cell',boardEl), wl=$('.winline',boardEl), wline=$('line',wl);
  let st=null, round=0, aiTimer=0, ovTimer=0, ghostTimer=0, hintTimer=0, on=false;
  let onlineRoom=null, onlineSide=null, onlinePoll=null, onlineBusy=false, onlineAdvanceTimer=0, onlineAdvancedRound=0, onlineAdvanceRetries=0, onlineFinished=false, onlineMatch={X:0,O:0,D:0}, onlineWriteAt=0, pollToken=0, onlineHbTimer=0, hbN=0, lastOppHb=null, lastOppAt=0, lastReactKey=null, lastReactAt=0, lastPly=0, lastHasOpp=false, onlineNames={X:'',O:''};

  const other=w=>w==='X'?'O':'X';
  const isAI=w=>opts.mode==='ai'&&w!==opts.me;
  const winLine=q=>{if(q.length<3)return null;for(const L of LINES)if(L.every(i=>q.includes(i)))return L;return null};
  const mark=w=>w==='X'
    ?'<svg class="mk" viewBox="0 0 100 100"><path class="x" d="M24 24L76 76"/><path class="x x2" d="M76 24L24 76"/></svg>'
    :'<svg class="mk" viewBox="0 0 100 100"><circle class="o" cx="50" cy="50" r="27"/></svg>';

  /* search */
  function applyMove(xq,oq,w,m){
    const mine=(w==='X'?xq:oq).concat(m); if(mine.length>opts.max)mine.shift();
    return w==='X'?[mine,oq]:[xq,mine];
  }
  function heur(xq,oq,w){
    let s=0;
    for(const L of LINES){let a=0,b=0;for(const i of L){if(xq.includes(i))a++;else if(oq.includes(i))b++}
      if(a&&!b)s+=[0,1,6,50][a];else if(b&&!a)s-=[0,1,6,50][b]}
    return w==='X'?s:-s;
  }
  function nega(xq,oq,w,depth,alpha,beta){
    if(depth===0)return heur(xq,oq,w);
    const moves=ORDER.filter(i=>!xq.includes(i)&&!oq.includes(i));
    let best=-1e9;
    for(const m of moves){
      const [nx,no]=applyMove(xq,oq,w,m);
      const s=winLine(w==='X'?nx:no)?1000+depth:-nega(nx,no,other(w),depth-1,-beta,-alpha);
      if(s>best)best=s; if(best>alpha)alpha=best; if(alpha>=beta)break;
    }
    return best;
  }
  function search(w,depth){
    const xq=st.q.X,oq=st.q.O,free=ORDER.filter(i=>!xq.includes(i)&&!oq.includes(i));
    let bestS=-1e9,list=[];
    for(const m of free){
      const [nx,no]=applyMove(xq,oq,w,m);
      const s=winLine(w==='X'?nx:no)?1000+depth:-nega(nx,no,other(w),depth-1,-1e9,1e9);
      if(s>bestS){bestS=s;list=[m]}else if(s===bestS)list.push(m);
    }
    return rnd(list);
  }
  function pickAI(){
    const w=st.turn,free=ORDER.filter(i=>!st.q.X.includes(i)&&!st.q.O.includes(i));
    if(opts.diff==='easy')return Math.random()<.55?rnd(free):search(w,1);
    if(opts.diff==='med')return Math.random()<.18?rnd(free):search(w,3);
    return search(w,7);
  }

  /* flow */
  function starter(){return opts.first==='alt'?(round%2===0?'X':'O'):opts.first}
  function newRound(){
    clearTimeout(aiTimer);clearTimeout(ovTimer);clearTimeout(ghostTimer);
    st={q:{X:[],O:[]},turn:starter(),over:false,win:null,line:null,draw:false,ply:0,hist:[],ghost:-1,ghostWho:''};
    round++;
    const ov=$('.bov',boardEl); if(ov)ov.remove();
    wl.toggleAttribute('hidden',true);
    render();maybeAI();
  }
  function maybeAI(){
    clearTimeout(aiTimer);
    if(!st||st.over||!isAI(st.turn))return;
    aiTimer=setTimeout(()=>{if(st.over||!isAI(st.turn))return;place(pickAI())},560);
  }
  function place(i){
    if(onlineRoom){remotePlace(i);return}
    if(st.over)return;
    const w=st.turn,q=st.q[w];
    if(st.q.X.includes(i)||st.q.O.includes(i))return;
    st.hist.push({X:st.q.X.slice(),O:st.q.O.slice(),turn:w,ply:st.ply});
    q.push(i);st.ghost=-1;
    let vanished=false;
    if(q.length>opts.max){st.ghost=q.shift();st.ghostWho=w;vanished=true;
      clearTimeout(ghostTimer);ghostTimer=setTimeout(()=>{st.ghost=-1;render()},430)}
    st.ply++;
    tone(w==='X'?460:340,.12,'triangle',.06);
    if(vanished)tone(220,.2,'sine',.035,.06,-120);
    const line=winLine(q);
    if(line){finish(w,line)}
    else if(st.ply>=80){finish(null,null)}
    else st.turn=other(w);
    render();maybeAI();
  }
  function finish(w,line){
    st.over=true;st.win=w;st.line=line;st.draw=!w;
    score[w||'D']++;store.set('xo-score',score);
    if(w&&(opts.mode==='ai'?w===opts.me:w==='X'))addWin();   /* count the HUMAN's win (not always X), immediately */
    st.matchWin=null;
    if(opts.lead&&Math.abs(score.X-score.O)>=opts.lead){st.matchWin=score.X>score.O?'X':'O';score.X=score.O=score.D=0;store.set('xo-score',score);mw.X=mw.O=0}
    if(w&&opts.series){mw[w]++;if(mw[w]>=Math.ceil(opts.series/2)){st.matchWin=w;mw.X=mw.O=0}}
    if(line){
      placeLine(line);
      const mineWin=opts.mode==='pvp'||w===opts.me;
      if(mineWin){confetti();[523,659,784,1047].forEach((f,k)=>tone(f,.18,'triangle',.06,k*.09))}
      else{[330,262,196].forEach((f,k)=>tone(f,.22,'sawtooth',.03,k*.12))}
    }
    clearTimeout(ovTimer);
    ovTimer=setTimeout(showOver,line?950:300);
  }
  function showOver(){
    if(!st.over)return;
    const d=document.createElement('div');d.className='bov';
    d.innerHTML='<div><h2></h2><button class="btn primary"></button></div>';
    $('h2',d).textContent=statusText();$('button',d).textContent=onlineRoom?(st.matchOver?'انتهت الغرفة':'الجولة التالية تلقائياً') : t('next');
    if(onlineRoom){$('button',d).disabled=true;}else $('button',d).addEventListener('click',()=>newRound());
    boardEl.appendChild(d);$('button',d).focus({preventScroll:true});
  }
  function undo(){
    if(!st.hist.length||st.over||isAI(st.turn))return;
    clearTimeout(aiTimer);
    let s;
    do{s=st.hist.pop()}while(opts.mode==='ai'&&st.hist.length&&s.turn!==opts.me);
    st.q={X:s.X,O:s.O};st.turn=s.turn;st.ply=s.ply;st.ghost=-1;
    render();maybeAI();
  }
  function hint(){
    if(st.over||isAI(st.turn))return;
    const m=search(st.turn,6);
    cells.forEach(c=>c.classList.remove('hint'));
    void boardEl.offsetWidth;cells[m].classList.add('hint');
    clearTimeout(hintTimer);hintTimer=setTimeout(()=>cells[m].classList.remove('hint'),2200);
  }

  /* view */
  function matchText(w){
    if(opts.mode==='ai')return w===opts.me?t('match_you'):t('match_cpu');
    return t('match_'+w.toLowerCase());
  }
  function statusText(){
    if(onlineRoom&&!st.matchOver){
      if(st.over)return st.draw?t('draw_msg'):(st.win===onlineSide?rankText('فزت بالجولة!','You won the round!'):rankText('فاز الخصم بالجولة','The opponent won the round'));
      return st.turn===onlineSide?t('turn_you'):rankText('دور الخصم…','Opponent\'s turn…');
    }
    if(st.over){
      if(st.matchOver)return st.draw?'انتهت الغرفة بالتعادل!':'انتهت جميع جولات الغرفة!';
      if(st.draw)return t('draw_msg');
      if(st.matchWin)return matchText(st.matchWin);
      if(opts.mode==='ai')return st.win===opts.me?t('win_you'):t('win_cpu');
      return t('win_'+st.win.toLowerCase());
    }
    if(opts.mode==='ai')return st.turn===opts.me?t('turn_you'):t('turn_cpu');
    return t('turn_'+st.turn.toLowerCase());
  }
  function render(){
    cells.forEach((c,i)=>{
      const who=st.q.X.includes(i)?'X':st.q.O.includes(i)?'O':'';
      const ghost=!who&&st.ghost===i;
      const key=who||(ghost?'g'+st.ghostWho:'');
      if(c.dataset.k!==key){c.dataset.k=key;c.innerHTML=key?mark(key.slice(-1)):''}
      c.classList.toggle('fX',who==='X');c.classList.toggle('fO',who==='O');c.classList.toggle('ghost',ghost);c.setAttribute('aria-label',(i+1)+(who?' '+who:''));
      const q=who?st.q[who]:null;
      c.classList.toggle('old',!!q&&opts.showOld&&!st.over&&q.length>=opts.max&&q[0]===i);
      c.classList.toggle('win',!!st.line&&st.line.includes(i));
    });
    ['X','O'].forEach(w=>{
      $('#pips'+w).innerHTML=Array.from({length:opts.max},(_,k)=>'<i class="'+(k<st.q[w].length?'f':'')+'"></i>').join('');
      $('#sb'+w).classList.toggle('turn',!st.over&&st.turn===w);
      $('#sc'+w).textContent=onlineRoom?onlineMatch[w]:score[w];
      $('#lbl'+w).textContent=onlineRoom?((onlineNames[w]||t(w==='X'?'pl1':'pl2'))+(w===onlineSide?' ('+t('you')+')':'')):(opts.mode==='ai'?(opts.me===w?t('you'):t('cpu')):t(w==='X'?'pl1':'pl2'));
    });
    $('#scD').textContent=onlineRoom?onlineMatch.D:score.D;
    $('#xoStatus').textContent=statusText()+(opts.series&&!st.over?'   ·   X '+mw.X+' – '+mw.O+' O':'');
    $('#xoUndo').disabled=st.over||!st.hist.length||isAI(st.turn);
    $('#xoHint').disabled=st.over||isAI(st.turn);
    $('#ogDiff').hidden=$('#ogMe').hidden=opts.mode!=='ai';
  }

  function paintRemote(room){
    if(!room||!room.state)return;
    const wasOver=!!(st&&st.over);
    updateOnlineHeader(room);
    const z=room.state;
    onlineMatch={X:+(z.roundWins&&z.roundWins.X)||0,O:+(z.roundWins&&z.roundWins.O)||0,D:+(z.roundWins&&z.roundWins.D)||0};
    st={q:{X:Array.isArray(z.X)?z.X:[],O:Array.isArray(z.O)?z.O:[]},turn:z.turn==='O'?'O':'X',over:!!z.over,win:z.win||null,line:z.line||null,draw:!!z.draw,ply:+z.ply||0,hist:[],ghost:-1,ghostWho:'',matchOver:!!z.matchOver};
    if(st.ply>lastPly&&!st.over&&st.turn===onlineSide)tone(onlineSide==='X'?340:460,.12,'triangle',.06);
    lastPly=st.ply;
    render();
    if(st.over&&st.line)drawLine(st.line);else wl.toggleAttribute('hidden',true);
    if(st.over&&!wasOver){
      if(st.win&&st.win===onlineSide){confetti();[523,659,784,1047].forEach((f,k)=>tone(f,.18,'triangle',.06,k*.09))}
      else if(st.win){[330,262,196].forEach((f,k)=>tone(f,.22,'sawtooth',.03,k*.12))}
      else tone(300,.2,'sine',.05);
    }
    if(!st.over)onlineAdvanceRetries=0;
    if(st.over&&!wasOver&&onlineRoom&&!st.matchOver)saveXoRank(room);   /* record every round immediately */
    if(st.matchOver){finishOnlineRoom(room);return;}
    if(st.over && onlineRoom){
      /* watchdog: whenever the round is over and no advance is pending, schedule one.
         X (host) advances fast; O is a delayed fallback so both never write at the same moment. */
      clearTimeout(ovTimer);
      if(!onlineAdvanceTimer && !onlineBusy){
        onlineAdvancedRound=+z.roundNo||1;
        scheduleAdvance(onlineSide==='X'?350:1400);
      }
    }
    onlineMsg('الغرفة '+onlineRoom+' — الجولة '+(+z.roundNo||1)+' من '+(+room.rounds||1)+' — النتائج: X '+onlineMatch.X+' / O '+onlineMatch.O+' — '+(st.over?'جارٍ تجهيز الجولة التالية…':'الدور: '+st.turn));
  }
  function scheduleAdvance(ms){
    clearTimeout(onlineAdvanceTimer);
    onlineAdvanceTimer=setTimeout(()=>{onlineAdvanceTimer=0;remoteNextRound()},ms);
  }
  async function remoteNextRound(){
    if(!onlineRoom||!st.over||st.matchOver)return;
    if(onlineBusy){scheduleAdvance(250);return}
    onlineBusy=true;
    try{
      const room=await window.armnOnlineApi.db('GET','rooms/'+onlineRoom);
      if(!room||!room.state||!room.state.over||room.state.matchOver)return;
      const n=(+room.state.roundNo||1)+1;
      if(n>+(room.rounds||1))return;
      const first=room.first||'X';
      const turn=first==='alt'?(n%2===0?'O':'X'):first;
      const next={X:[],O:[],turn,ply:0,over:false,win:null,line:null,draw:false,roundNo:n,
        roundWins:room.state.roundWins||{X:0,O:0,D:0},matchOver:false};
      await window.armnOnlineApi.db('PUT','rooms/'+onlineRoom+'/state',next);onlineWriteAt=Date.now();
      onlineAdvanceRetries=0;
      onlineAdvancedRound=0;
      paintRemote({...room,state:next});
    }catch(e){
      /* note: L() lives in another script scope, so use rankText here (the old call threw and stopped retries) */
      try{onlineMsg(rankText('تعذّر بدء الجولة التالية. جارٍ إعادة المحاولة…','Could not start the next round. Retrying…'))}catch(_){}
      if(onlineRoom&&st.over&&!st.matchOver){
        const delay=Math.min(4000,500*Math.pow(2,Math.min(onlineAdvanceRetries++,3)));
        scheduleAdvance(delay);
      }
    }finally{onlineBusy=false}
  }
  async function remotePlace(i){
    if(onlineBusy||!onlineRoom||st.over||st.turn!==onlineSide||st.q.X.includes(i)||st.q.O.includes(i))return;
    onlineBusy=true;
    try{
      const room=await window.armnOnlineApi.db('GET','rooms/'+onlineRoom);
      if(!room||!room.state)throw new Error('ROOM');
      if(room.status!=='playing'||!room.playerO){onlineMsg('بانتظار دخول الخصم قبل بدء اللعب.');return}
      const z=room.state;
      if(z.over||z.matchOver||z.turn!==onlineSide){paintRemote(room);return}
      const x=(z.X||[]).slice(), o=(z.O||[]).slice(), q=onlineSide==='X'?x:o;
      if(x.includes(i)||o.includes(i)){paintRemote(room);return}
      q.push(i);if(q.length>+(room.pieces||3))q.shift();
      const line=winLine(q),ply=(+z.ply||0)+1,over=!!line||ply>=80;
      const isDraw=!line&&ply>=80;
      const roundWins={X:+(z.roundWins&&z.roundWins.X)||0,O:+(z.roundWins&&z.roundWins.O)||0,D:+(z.roundWins&&z.roundWins.D)||0};
      if(line)roundWins[onlineSide]++;else if(isDraw)roundWins.D++;
      const roundNo=+z.roundNo||1, matchOver=over&&roundNo>=+(room.rounds||1);
      const next={X:x,O:o,turn:onlineSide==='X'?'O':'X',ply,over,win:line?onlineSide:null,line:line||null,draw:isDraw,roundNo,roundWins,matchOver};
      await window.armnOnlineApi.db('PUT','rooms/'+onlineRoom+'/state',next);onlineWriteAt=Date.now();tone(onlineSide==='X'?460:340,.12,'triangle',.06);
      paintRemote({...room,state:next});
    }catch(e){onlineMsg('تعذّر إرسال الحركة. تأكد من قواعد Firebase واتصالك.');}
    finally{onlineBusy=false}
  }
  function updateOnlineHeader(room){
    const bar=$('#xoMatchBar');bar.hidden=false;
    $('#xoMatchCode').textContent=onlineRoom||'------';
    const meX=onlineSide==='X',oppKey=meX?'playerO':'playerX';
    const hasOpp=!!(room&&room[oppKey]);
    bar.classList.toggle('full',hasOpp&&!room.left); /* room is full -> hide the room code + invite to save screen space */
    onlineNames={X:(room&&room.playerXName)||'',O:(room&&room.playerOName)||''};
    const myName=window.armnOnlineApi.name||'أنت';
    const mA=room&&room[meX?'playerXAvatar':'playerOAvatar'];
    setAv($('#xoAvatarMe'),(mA===undefined||mA==='')?window.armnOnlineApi.avatar:mA);
    const oA=room&&room[meX?'playerOAvatar':'playerXAvatar'];
    if(hasOpp)setAv($('#xoAvatarOpp'),(oA===undefined||oA==='')?'🎮':oA);else $('#xoAvatarOpp').textContent='❔';
    /* presence: the opponent bumps a counter every ~4s; if it stops changing for 20s they are offline */
    const oppHb=room&&room['hb'+(meX?'O':'X')];
    if(oppHb!==lastOppHb){lastOppHb=oppHb;lastOppAt=Date.now()}
    const oppLive=hasOpp&&!room.left&&(lastOppHb==null||Date.now()-lastOppAt<20000); /* no heartbeat ever seen (e.g. DB rules block it) => assume online */
    $('#xoNameMe').textContent=myName;$('#xoSideMe').textContent=onlineSide||'X';
    $('#xoNameOpp').textContent=hasOpp?((room[meX?'playerOName':'playerXName'])||'الخصم'):'بانتظار الخصم';
    $('#xoSideOpp').textContent=meX?'O':'X';
    $('#xoDotMe').classList.add('online');
    $('#xoDotOpp').classList.toggle('online',oppLive);
    const z=(room&&room.state)||{};
    let w;
    if(!hasOpp)w='بانتظار دخول اللاعب الآخر… أرسل له كود الغرفة.';
    else if(room.left)w='غادر الخصم الغرفة.';
    else if(!oppLive)w='الخصم غير متصل حالياً… قد يعود، أو يمكنك الخروج.';
    else w='الجولة '+(+z.roundNo||1)+' من '+(+room.rounds||1)+' · '+(z.over?'جارٍ تجهيز الجولة التالية…':(z.turn===onlineSide?'دورك':'دور الخصم'));
    $('#xoMatchWait').textContent=w;
  }
  async function enterOnlineRoom(code,side,room){
    onlineRoom=code;onlineSide=side;onlineFinished=false;onlineAdvanceRetries=0;$('#xo').classList.add('online-room');onlineMatch={X:+(room.state&&room.state.roundWins&&room.state.roundWins.X)||0,O:+(room.state&&room.state.roundWins&&room.state.roundWins.O)||0,D:+(room.state&&room.state.roundWins&&room.state.roundWins.D)||0};onlineAdvancedRound=0;clearTimeout(onlineAdvanceTimer);opts.mode='pvp';opts.max=+(room.pieces||3);opts.showOld=room.showOld!==false;opts.first=room.first||'X';opts.series=0;opts.lead=0;mw.X=mw.O=0;lastOppHb=null;lastOppAt=Date.now();lastPly=+(room.state&&room.state.ply)||0;lastReactKey=(room.react&&room.react.k)||null;lastHasOpp=!!room.playerO;onlineWriteAt=0;wl.toggleAttribute('hidden',true);
    $('#xoRoomRounds').disabled=true;$('#xoRoomPieces').disabled=true;
    onlinePanel.hidden=true;$('#xo').classList.remove('online-lobby');
    try{window.armnRoomTheme&&window.armnRoomTheme(room.playerXTheme)}catch(_){}   /* both players see the room creator's equipped skin */
    updateOnlineHeader(room);paintRemote(room);
    if(room.state&&room.state.over&&!room.state.matchOver){
      onlineAdvancedRound=Math.max(0,(+room.state.roundNo||1)-1);
      scheduleAdvance(350);
    }
    clearInterval(onlinePoll);
    onlinePoll=null;startHeartbeat();pollLoop(++pollToken);
    try{if(window.armnXoChat)window.armnXoChat.open(code,side,room)}catch(_){}
    onlineMsg((room.playerO?'اللاعبان متصلان، بدأت الجولة.':'تم إنشاء الغرفة. بانتظار دخول الخصم.')+(side==='O'&&+room.playerXTheme>0?' 🎨 الروم بشكل منشئ الغرفة.':''));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function stopOnline(){try{window.armnRoomTheme&&window.armnRoomTheme(null)}catch(_){}try{if(window.armnXoChat)window.armnXoChat.close()}catch(_){}pollToken++;clearInterval(onlineHbTimer);onlineHbTimer=0;onlineNames={X:'',O:''};clearInterval(onlinePoll);clearTimeout(onlineAdvanceTimer);onlineAdvanceTimer=0;onlinePoll=null;onlineRoom=null;onlineSide=null;onlineMatch={X:0,O:0,D:0};$('#xoRoomRounds').disabled=false;$('#xoRoomPieces').disabled=false;$('#xoMatchBar').hidden=true}

  /* ---- online helpers ---- */
  function setAv(el,v){if(typeof v==='number'&&window.armnAvatarHtml)el.innerHTML=window.armnAvatarHtml(v);else el.textContent=(v&&typeof v==='string')?v:'👤'}
  function zeroScores(){
    score.X=score.O=score.D=0;store.set('xo-score',score);mw.X=mw.O=0;
  }
  /* the board grid follows the page direction (RTL in Arabic: cell 0 is on the RIGHT), so the SVG line must be mirrored to match the squares */
  function placeLine(line){
    const rtl=getComputedStyle(boardEl).direction==='rtl';
    const c=[47,150,253],P=i=>[rtl?300-c[i%3]:c[i%3],c[Math.floor(i/3)]];
    const a=P(line[0]),b=P(line[2]),dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1,ex=dx/n*24,ey=dy/n*24;
    wline.setAttribute('x1',a[0]-ex);wline.setAttribute('y1',a[1]-ey);wline.setAttribute('x2',b[0]+ex);wline.setAttribute('y2',b[1]+ey);
    wl.toggleAttribute('hidden',false);
  }
  function drawLine(line){placeLine(line)}
  function bigReact(e,name){const d=document.createElement('div');d.className='xo-bigreact';d.innerHTML='<div><em></em><b></b></div>';d.querySelector('em').textContent=e;d.querySelector('b').textContent=name||'';document.body.appendChild(d);setTimeout(()=>d.remove(),1600);try{navigator.vibrate&&navigator.vibrate(60)}catch(_){}tone(660,.1,'triangle',.05);tone(880,.12,'triangle',.05,.09)}
  function floatReact(e){
    const d=document.createElement('div');d.className='xo-float';d.textContent=e;d.style.left=(12+Math.random()*70)+'%';
    boardEl.appendChild(d);setTimeout(()=>d.remove(),1800);
  }
  function startHeartbeat(){
    clearInterval(onlineHbTimer);
    const beat=()=>{if(!onlineRoom||document.hidden)return;const o={};o['hb'+onlineSide]=++hbN;window.armnOnlineApi.db('PATCH','rooms/'+onlineRoom,o).catch(()=>{})};
    beat();onlineHbTimer=setInterval(beat,4000);
  }
  const sleepMs=ms=>new Promise(r=>setTimeout(r,ms));
  async function pollLoop(tok){
    let fails=0;
    while(onlineRoom&&tok===pollToken){
      if(!document.hidden){
        const started=Date.now();
        try{
          const latest=await window.armnOnlineApi.db('GET','rooms/'+onlineRoom);
          if(tok!==pollToken||!onlineRoom)break;
          if(latest===null){onlineExit(rankText('الغرفة لم تعد موجودة.','The room no longer exists.'));break}
          if(latest&&latest.state){
            fails=0;
            if(started>=onlineWriteAt)paintRemote(latest);
            if(tok===pollToken&&onlineRoom)roomMeta(latest);
          }
        }catch(e){if(++fails===3&&onlineRoom)$('#xoMatchWait').textContent='الاتصال ضعيف… جارٍ إعادة المحاولة'}
      }
      await sleepMs(!lastHasOpp?1000:(st&&!st.over&&st.turn===onlineSide?700:350));
    }
  }
  function roomMeta(room){
    try{if(window.armnXoChat)window.armnXoChat.sync(room,onlineSide,onlineRoom)}catch(_){}
    const had=lastHasOpp;lastHasOpp=!!room.playerO;
    if(!had&&lastHasOpp){tone(660,.1,'triangle',.06);tone(880,.12,'triangle',.05,.08)}
    if(room.left&&room.left!==onlineSide&&!onlineFinished&&!(room.state&&room.state.matchOver)){
      onlineExit(rankText('غادر الخصم الغرفة. الجولات التي فزت بها محفوظة في الترتيب.','The opponent left. Rounds you already won are saved in the ranking.'));return;
    }
    const r=room.react;
    if(r&&r.k&&r.k!==lastReactKey){lastReactKey=r.k;if(r.s!==onlineSide){const em=String(r.e||'').slice(0,4);floatReact(em);bigReact(em,onlineNames[r.s]||'')}}
  }
  function onlineExit(msg){
    stopOnline();
    $('#xo').classList.remove('online-room');$('#xoMatchBar').hidden=true;
    mw.X=mw.O=0;
    Object.assign(opts,{mode:'ai',max:3,showOld:true,first:'X'},store.get('xo-opts',{}));
    newRound();
    onlinePanel.hidden=false;$('#xo').classList.add('online-lobby');
    if(msg)onlineMsg(msg);
    loadXoRank();
  }

  /* events */
  boardEl.addEventListener('click',e=>{
    const c=e.target.closest('.cell');if(!c||st.over||isAI(st.turn))return;
    const i=Number(c.dataset.i);
    if(st.q.X.includes(i)||st.q.O.includes(i)){tone(150,.08,'square',.025);return}
    place(i);
  });
  $('#xoNew').addEventListener('click',()=>{if(onlineRoom){onlineMsg('لإعادة الجولة، أعد إنشاء غرفة جديدة حالياً.');return}newRound()});
  const onlinePanel=$('#xoOnlinePanel'),onlineStatus=$('#xoOnlineStatus');
  const onlineMsg=(msg)=>{onlineStatus.textContent=msg};
  const rankText=(ar,en)=>document.documentElement.lang==='ar'?ar:en;
  const rankEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rankRows=$('#xoRankRows');
  async function loadXoRank(){
    if(!rankRows)return;
    rankRows.textContent=rankText('جارٍ تحميل الترتيب…','Loading leaderboard…');
    try{
      let data;
      try{data=await window.armnOnlineApi.db('GET','lb/online_xo',undefined,{auth:false,q:'orderBy=%22wins%22'})}
      catch(_){data=await window.armnOnlineApi.db('GET','lb/online_xo',undefined,{auth:false})} /* fallback if .indexOn is missing */
      const grouped=new Map();
      Object.entries(data||{}).forEach(([user,v])=>{
        if(!user||!v||!Number.isFinite(+v.wins)||+v.wins<=0)return;
        const name=String(v.name||user||rankText('لاعب','Player')).slice(0,24);
        const g=grouped.get(name)||{wins:0,av:null,fr:''};g.wins+=Math.max(0,+v.wins||0);if(Number.isInteger(+v.av))g.av=+v.av;if(typeof v.fr==='string'&&v.fr)g.fr=window.armnFrameOk?window.armnFrameOk(v.fr):'';grouped.set(name,g);
      });
      const rows=[...grouped].map(([name,g])=>({name,wins:g.wins,av:g.av,fr:g.fr}))
        .sort((a,b)=>b.wins-a.wins||a.name.localeCompare(b.name)).slice(0,10);
      const avh=r=>{const a=window.armnRankAvatar?window.armnRankAvatar(r.name,r.av):'';return r.fr&&r.fr!=='none'?'<span class="rk-avr ring fr-'+r.fr+'"><span class="rk-av">'+a+'</span></span>':'<span class="rk-av">'+a+'</span>'};
      const rankHtml=rows.length?rows.map((r,i)=>'<div class="rk-row r'+(i+1)+'"><span class="rk-n">'+(i+1)+'</span>'+avh(r)+'<span class="rk-nm">'+rankEsc(r.name)+'</span><b class="rk-sc">'+r.wins+' <small>'+rankText('فوز','wins')+'</small></b></div>').join(''):'<p style="color:var(--mut);font-size:13px;margin:4px 0">'+rankText('لا يوجد ترتيب بعد — كن أول لاعب!','No ranking yet — be the first player!')+'</p>';
      rankRows.innerHTML=rankHtml;
      window.armnXoTopMarkup='<section id="xoHomeRank" style="border-top:1px solid var(--line);margin-top:10px;padding-top:10px"><h3>🌍 '+rankText('تصنيف X-O العالمي','X-O global ranking')+'</h3>'+rankHtml+'</section>';
      if(window.armnRenderHomeLeaderboard)window.armnRenderHomeLeaderboard();
    }catch(e){
      const msg=rankText('تعذّر تحميل الترتيب العالمي لـ X-O.','Could not load the X-O global ranking.');
      rankRows.textContent=msg;
      window.armnXoTopMarkup='<section id="xoHomeRank" style="border-top:1px solid var(--line);margin-top:10px;padding-top:10px"><h3>🌍 '+rankText('تصنيف X-O العالمي','X-O global ranking')+'</h3><p style="color:var(--mut);font-size:13px">'+msg+'</p></section>';
      if(window.armnRenderHomeLeaderboard)window.armnRenderHomeLeaderboard();
    }
  }
  window.armnLoadXoRank=loadXoRank;
  window.armnXoState={get room(){return onlineRoom},get side(){return onlineSide}};
  /* records ONE finished round (or the match summary) into lb/online_xo immediately */
  let xoCounted={room:null,wins:0};
  async function putXo(path,body){
    const api=window.armnOnlineApi;let off=0;try{off=+localStorage.getItem('armnhub:noav')||0}catch(_){}
    if(Date.now()<off)return api.db('PUT',path,body);
    try{return await api.db('PUT',path,Object.assign({av:api.avatar,fr:api.frame||''},body))}
    catch(e){if(e&&(e.status===401||e.status===403||e.status===400)){try{localStorage.setItem('armnhub:noav',String(Date.now()+864e5))}catch(_){}return api.db('PUT',path,body)}throw e}
  }
  async function saveXoRank(room,opts2){
    opts2=opts2||{};
    const uid=window.armnOnlineApi.uid;
    const rawName=String(window.armnOnlineApi.name||'').trim();
    const playerKey=rawName.replace(/[.#$\[\]\/]/g,'_').slice(0,40);   /* Firebase keys cannot contain . # $ [ ] / */
    if(!uid||!playerKey||rawName==='أنت'||!onlineRoom)return;
    if(xoCounted.room!==onlineRoom)xoCounted={room:onlineRoom,wins:0};
    const z=room.state||{};
    const total=+(z.roundWins&&z.roundWins[onlineSide])||0;
    const add=Math.max(0,total-xoCounted.wins);          /* wins not yet saved */
    const isFinal=!!opts2.final;
    if(!add&&!isFinal)return;
    xoCounted.wins+=add;                                  /* mark before await to avoid double count */
    try{
      const path='lb/online_xo/'+playerKey;
      const old=await window.armnOnlineApi.db('GET',path);
      const recent=old&&old.recent&&typeof old.recent==='object'?old.recent:{};
      let matches=Math.max(0,+((old&&old.matches)||0));
      if(isFinal&&!recent[onlineRoom]){recent[onlineRoom]=1;matches++}
      const keys=Object.keys(recent);
      if(keys.length>40)delete recent[keys[0]];
      await putXo(path,{
        name:rawName.slice(0,24),
        wins:Math.max(0,+((old&&old.wins)||0))+add,
        matches,
        recent,updatedAt:Date.now()
      });
      if(window.armnLoadXoRank)loadXoRank();
    }catch(e){
      xoCounted.wins-=add;                                /* retry on next round/final */
      onlineMsg(rankText('تعذّر حفظ الترتيب العالمي. راجع صلاحيات lb/online_xo في Firebase.','Could not save the global ranking. Check Firebase rules for lb/online_xo.'))}
  }
  function showRoomResult(info){
    const old=document.getElementById('xoResult');if(old)old.remove();
    const kind=info.mine>info.theirs?'win':info.mine<info.theirs?'lose':'draw';
    const ico=kind==='win'?'🏆':kind==='lose'?'💔':'🤝';
    const title=kind==='win'?rankText('فزت بالمباراة!','You won the match!'):kind==='lose'?rankText('خسرت المباراة','You lost the match'):rankText('انتهت المباراة بالتعادل','The match ended in a draw');
    const d=document.createElement('div');d.className='xo-res';d.id='xoResult';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
    d.innerHTML='<div class="xo-res-card '+kind+'"><div class="xo-res-ico"></div><h2></h2>'+
      '<div class="xo-res-vs"><div><small class="n1"></small><b class="s1"></b></div><i>–</i><div><small class="n2"></small><b class="s2"></b></div></div>'+
      '<div class="xo-res-draws"></div><div class="xo-res-act"><button class="btn primary" type="button"></button><button class="btn xo-res-exit" type="button"></button></div></div>';
    d.querySelector('.xo-res-ico').textContent=ico;
    d.querySelector('h2').textContent=title;
    d.querySelector('.n1').textContent=info.myName+' ('+rankText('أنت','you')+')';
    d.querySelector('.n2').textContent=info.oppName;
    d.querySelector('.s1').textContent=info.mine;
    d.querySelector('.s2').textContent=info.theirs;
    d.querySelector('.xo-res-draws').textContent=info.draws?rankText('تعادل: ','Draws: ')+info.draws:'';
    const btn=d.querySelector('.xo-res-act .primary'),exb=d.querySelector('.xo-res-exit');btn.textContent=rankText('روم آخر','Another room');exb.textContent=rankText('خروج','Exit');
    exb.addEventListener('click',()=>{d.remove();zeroScores();mw.X=mw.O=0;onlineMatch={X:0,O:0,D:0};Object.assign(opts,{mode:'ai',max:3,showOld:true,first:'X'},store.get('xo-opts',{}));newRound();onlinePanel.hidden=true;$('#xo').classList.remove('online-lobby','online-room');location.hash='#home'});
    btn.addEventListener('click',()=>{
      d.remove();
      /* fresh start, exactly like opening a new room: counters at zero, clean board, no lobby */
      zeroScores();mw.X=mw.O=0;onlineMatch={X:0,O:0,D:0};
      Object.assign(opts,{mode:'ai',max:3,showOld:true,first:'X'},store.get('xo-opts',{}));
      newRound();
      onlinePanel.hidden=true;$('#xo').classList.remove('online-lobby');
      window.scrollTo({top:0,behavior:'smooth'});
    });
    document.body.appendChild(d);
    try{btn.focus({preventScroll:true})}catch(_){}
  }
  async function finishOnlineRoom(room){
    if(onlineFinished||!onlineRoom)return;
    onlineFinished=true;
    clearTimeout(onlineAdvanceTimer);clearInterval(onlinePoll);
    const t0=Date.now();
    const wins=room.state&&room.state.roundWins||{X:0,O:0,D:0};
    const side=onlineSide,oppSide=side==='X'?'O':'X';
    const mine=+(wins[side]||0),theirs=+(wins[oppSide]||0),draws=+(wins.D||0);
    const myName=(window.armnOnlineApi&&window.armnOnlineApi.name)||rankText('أنت','You');
    const oppName=(room[oppSide==='X'?'playerXName':'playerOName'])||rankText('الخصم','Opponent');
    try{await saveXoRank(room,{final:true})}catch(_){}
    /* let the player see the winning line for a moment before the result screen */
    const wait=1100-(Date.now()-t0);if(wait>0)await sleepMs(wait);
    stopOnline();
    $('#xo').classList.remove('online-room');
    $('#xoMatchBar').hidden=true;
    onlinePanel.hidden=true;$('#xo').classList.remove('online-lobby');
    showRoomResult({mine,theirs,draws,myName,oppName});
    loadXoRank();
  }
  $('#xoRankRefresh').addEventListener('click',loadXoRank);
  $('#xoReact').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const pop=$('#xoReactPop'),more=$('#xoReactMore');
    if(b===more){pop.hidden=!pop.hidden;more.setAttribute('aria-expanded',String(!pop.hidden));more.textContent=pop.hidden?'+':'×';return}
    pop.hidden=true;more.setAttribute('aria-expanded','false');more.textContent='+';
    if(!onlineRoom)return;
    const now=Date.now();if(now-lastReactAt<1200)return;lastReactAt=now;
    const em=b.textContent,k=Math.random().toString(36).slice(2);
    lastReactKey=k;floatReact(em);
    window.armnOnlineApi.db('PATCH','rooms/'+onlineRoom,{react:{s:onlineSide,e:em,k}}).catch(()=>{});
  });
  document.addEventListener('click',e=>{const pop=$('#xoReactPop');if(pop&&!pop.hidden&&!e.target.closest('#xoReact')){pop.hidden=true;const m=$('#xoReactMore');m.setAttribute('aria-expanded','false');m.textContent='+'}});
  $('#xoShareRoom').addEventListener('click',async()=>{
    const code=$('#xoMatchCode').textContent;if(!code||code==='------')return;
    const url=location.href.split(/[?#]/)[0]+'?room='+code+'#xo',text='العب X-O أونلاين معي! كود الغرفة: '+code;
    try{if(navigator.share)await navigator.share({title:'GAME ARMN',text,url});else{await navigator.clipboard.writeText(text+'\n'+url);$('#xoMatchWait').textContent='تم نسخ الدعوة'}}catch(e){}
  });
  let leaveArm=0;
  $('#xoLeaveRoom').addEventListener('click',async e=>{
    const b=e.currentTarget;
    if(!leaveArm){b.textContent='تأكيد الخروج؟';leaveArm=setTimeout(()=>{leaveArm=0;b.textContent='خروج من الغرفة'},3000);return}
    clearTimeout(leaveArm);leaveArm=0;b.textContent='خروج من الغرفة';
    const code=onlineRoom,side=onlineSide;if(!code)return;
    onlineExit(rankText('غادرت الغرفة.','You left the room.'));
    try{await window.armnOnlineApi.db('PATCH','rooms/'+code,{left:side})}catch(_){}
  });
  $('#xoOnlineOpen').addEventListener('click',()=>{onlinePanel.hidden=false;$('#xo').classList.add('online-lobby');loadXoRank();window.scrollTo({top:0,behavior:'smooth'});});
  $('#xoOnlineClose').addEventListener('click',()=>{onlinePanel.hidden=true;$('#xo').classList.remove('online-lobby');});
  $('#xoCopyRoomCode').addEventListener('click',async()=>{const code=$('#xoMatchCode').textContent;if(!code||code==='------')return;try{await navigator.clipboard.writeText(code);$('#xoMatchWait').textContent='تم نسخ كود الغرفة: '+code}catch(e){$('#xoMatchWait').textContent='كود الغرفة: '+code+' — انسخه يدوياً'}});
  $('#xoTestConnection').addEventListener('click',async()=>{
    const b=$('#xoTestConnection');b.disabled=true;onlineMsg('جارٍ فحص الاتصال بقاعدة Firebase…');
    try{
      const r=await fetch('https://armn-25ff3-default-rtdb.firebaseio.com/meta/connection_test.json',{method:'GET',cache:'no-store'});
      if(r.status===401||r.status===403)throw Object.assign(new Error('DENIED'),{status:r.status});
      if(!r.ok)throw Object.assign(new Error('HTTP'),{status:r.status});
      await r.json();
      onlineMsg('✓ نجح الاتصال بقاعدة Firebase! القاعدة استجابت للطلب. يمكنك الانتقال إلى تجهيز نظام الغرف.');
    }catch(e){
      const code=e&&e.status;
      onlineMsg(code===401||code===403?'وصلنا إلى Firebase لكن القواعد رفضت القراءة. راجع إضافة meta/connection_test ثم اضغط نشر.':code?'وصلنا إلى Firebase لكن ظهر خطأ HTTP '+code+'.':'تعذر تنفيذ طلب الاتصال. افحص الإنترنت، أو جرّب فتح الموقع من استضافة HTTPS بدلاً من content://.');
    }finally{b.disabled=false}
  });
  $('#xoCreateRoom').addEventListener('click',async()=>{
    if(!window.armnOnlineApi||!window.armnOnlineApi.uid){onlineMsg('سجّل الدخول إلى حسابك أولاً حتى تنشئ غرفة أونلاين.');return}
    const b=$('#xoCreateRoom');b.disabled=true;onlineMsg('جارٍ إنشاء الغرفة…');
    try{
      let code='';for(let n=0;n<8;n++){code=Math.random().toString(36).slice(2,8).toUpperCase();const old=await window.armnOnlineApi.db('GET','rooms/'+code);if(!old)break;code=''}
      if(!code)throw new Error('CODE');
      const first=$('#xoRoomStarter').value;const room={playerX:window.armnOnlineApi.uid,playerXName:window.armnOnlineApi.name,playerXAvatar:window.armnOnlineApi.avatar,playerXFrame:window.armnOnlineApi.frame,playerXTheme:window.armnOnlineApi.theme|0,playerO:'',playerOName:'',playerOAvatar:'',status:'waiting',rounds:+$('#xoRoomRounds').value,pieces:+$('#xoRoomPieces').value,showOld:$('#xoRoomBlink').value==='1',first,createdAt:Date.now(),state:{X:[],O:[],turn:first==='O'?'O':'X',ply:0,over:false,win:null,line:null,draw:false,roundNo:1,roundWins:{X:0,O:0,D:0},matchOver:false}};
      try{await window.armnOnlineApi.db('PUT','rooms/'+code,room)}
      catch(e){if(e&&(e.status===400||e.status===401||e.status===403)){delete room.playerXTheme;await window.armnOnlineApi.db('PUT','rooms/'+code,room)}else throw e} /* database rules may not know the skin field yet: create the room without it */
      $('#xoRoomCode').value=code;await enterOnlineRoom(code,'X',room);
      onlineMsg('تم إنشاء الغرفة '+code+'! أرسل الكود لصديقك لينضم.');
    }catch(e){onlineMsg(e&&e.status===401||e&&e.status===403?'Firebase رفض إنشاء الغرفة (صلاحيات rooms). نحتاج تعديل القواعد بشكل محدود.':e&&e.status?'فشل إنشاء الغرفة: خطأ Firebase HTTP '+e.status+'.':'فشل إنشاء الغرفة: '+(e&&e.message||'تحقق من الاتصال وتسجيل الدخول')+'.');}
    finally{b.disabled=false}
  });
  $('#xoJoinRoom').addEventListener('click',async()=>{
    const code=$('#xoRoomCode').value.trim().toUpperCase();
    if(!/^[A-Z0-9]{6}$/.test(code)){onlineMsg('أدخل كود غرفة صحيحاً من 6 خانات.');return}
    if(!window.armnOnlineApi||!window.armnOnlineApi.uid){onlineMsg('سجّل الدخول إلى حسابك أولاً حتى تنضم.');return}
    const b=$('#xoJoinRoom');b.disabled=true;onlineMsg('جارٍ البحث عن الغرفة…');
    try{
      const room=await window.armnOnlineApi.db('GET','rooms/'+code);
      if(!room){onlineMsg('الغرفة غير موجودة. تأكد من الكود.');return}
      if(room.left){onlineMsg('هذه الغرفة أُغلقت.');return}
      if(room.playerX===window.armnOnlineApi.uid){await enterOnlineRoom(code,'X',room);return}
      if(room.playerO&&room.playerO!==window.armnOnlineApi.uid){onlineMsg('الغرفة ممتلئة بالفعل.');return}
      if(room.status!=='waiting'&&!room.playerO){onlineMsg('هذه الغرفة غير متاحة للانضمام.');return}
      await window.armnOnlineApi.db('PATCH','rooms/'+code,{playerO:window.armnOnlineApi.uid,playerOName:window.armnOnlineApi.name,playerOAvatar:window.armnOnlineApi.avatar,playerOFrame:window.armnOnlineApi.frame,status:'playing'});
      room.playerO=window.armnOnlineApi.uid;room.playerOName=window.armnOnlineApi.name;room.playerOAvatar=window.armnOnlineApi.avatar;room.status='playing';await enterOnlineRoom(code,'O',room);
    }catch(e){onlineMsg(e&&e.status===401||e&&e.status===403?'Firebase رفض الانضمام بسبب صلاحيات rooms.':e&&e.status?'تعذّر الانضمام: Firebase HTTP '+e.status+'.':'تعذّر الانضمام: '+(e&&e.message||'تحقق من الاتصال')+'.');}
    finally{b.disabled=false}
  });

  $('#xoUndo').addEventListener('click',undo);
  $('#xoHint').addEventListener('click',hint);
  $('#xoReset').addEventListener('click',()=>{zeroScores();newRound()});
  window.addEventListener('keydown',e=>{
    if(!on||e.ctrlKey||e.metaKey||e.altKey)return;
    if(/^[1-9]$/.test(e.key)&&!st.over&&!isAI(st.turn)){const i=Number(e.key)-1;if(!st.q.X.includes(i)&&!st.q.O.includes(i))place(i)}
    else if(e.key==='z'||e.key==='Z')undo();
    else if(e.key==='h'||e.key==='H')hint();
    else if(e.key==='n'||e.key==='N')newRound();
  });
  bindOpts('xo',opts,k=>{if(k==='showOld')render();else{mw.X=mw.O=0;newRound()}});
  document.addEventListener('langchange',()=>{if(st){render();const ov=$('.bov h2',boardEl);if(ov){ov.textContent=statusText();$('.bov button',boardEl).textContent=t('next')}}});
  newRound();
  try{
    const rc=new URLSearchParams(location.search).get('room');
    if(rc&&/^[A-Za-z0-9]{6}$/.test(rc)){
      $('#xoRoomCode').value=rc.toUpperCase();
      if(!location.hash||location.hash==='#home')location.hash='xo';
      onlinePanel.hidden=false;$('#xo').classList.add('online-lobby');
      onlineMsg('تم إدخال كود الغرفة '+rc.toUpperCase()+' — سجّل دخولك ثم اضغط «انضمام إلى غرفة».');
    }
  }catch(e){}
  return{pause(){},active(v){
    const was=on;on=v;
    if(!v){
      clearTimeout(aiTimer);
      {const rs=document.getElementById('xoResult');if(rs)rs.remove()}
      if(onlineRoom){
        const code=onlineRoom,side=onlineSide;
        stopOnline();onlinePanel.hidden=true;$('#xo').classList.remove('online-lobby','online-room');
        Object.assign(opts,{mode:'ai',max:3,showOld:true,first:'X'},store.get('xo-opts',{}));
        window.armnOnlineApi.db('PATCH','rooms/'+code,{left:side}).catch(()=>{});
        zeroScores();newRound();
      }else if(was){
        /* leaving the game always zeroes the offline scoreboard */
        zeroScores();newRound();
      }
    }else maybeAI();
  }};
})();

/* ---------- Snake: 60 FPS canvas, smooth interpolation ---------- */
const SN=(()=>{
  const opts=Object.assign({size:20,speed:'normal',walls:'solid',obst:false,power:true,ramp:true,dpad:COARSE,fps:true,skin:'mint',haptic:true},store.get('snake-opts',{}));
  const buzz=ms=>{if(opts.haptic&&navigator.vibrate){try{navigator.vibrate(ms)}catch(e){}}};
  const STEP={chill:150,normal:112,fast:82,insane:56};
  const cv=$('#cv'),ctx=cv.getContext('2d'),wrap=$('#cvWrap'),ov=$('#snOv');
  let N=20,W=0,cell=15,dpr=1,bg=null;
  let cur=[],prev=[],dir={x:1,y:0},queue=[],acc=0,gt=0,state='ready',ovKind='ready',ovTimer=0;
  let apple=null,bonus=null,obs=[],pend=0,slowUntil=0,score=0,eaten=0,parts=[],flash=0,best=0,newBest=false;
  let on=false,raf=0,last=0,frames=0,fpsT=0,shownScore=-1,combo=0,lastEat=-1e9,pops=[];
  const bestKey=()=>'best-'+opts.walls+'-'+opts.speed;
  const base=()=>STEP[opts.speed]*(opts.ramp?Math.max(.55,1-eaten*.018):1);
  const stepNow=()=>base()*(gt<slowUntil?1.6:1);

  function resize(){
    const r=wrap.getBoundingClientRect(); if(!r.width)return;
    W=r.width;dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=cv.height=Math.round(W*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);cell=W/N;
    bg=document.createElement('canvas');bg.width=bg.height=cv.width;
    const b=bg.getContext('2d');b.scale(dpr,dpr);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){b.fillStyle=(x+y)%2?'#101b22':'#12202a';b.fillRect(x*cell,y*cell,cell+.5,cell+.5)}
  }
  function spawn(type){
    const free=[];
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      if(cur.some(s=>s.x===x&&s.y===y)||obs.some(o=>o.x===x&&o.y===y))continue;
      if(apple&&apple.x===x&&apple.y===y)continue; if(bonus&&bonus.x===x&&bonus.y===y)continue;
      free.push({x,y});
    }
    if(!free.length)return null;
    const p=rnd(free);return{x:p.x,y:p.y,type,born:gt,ttl:type==='apple'?0:8000};
  }
  function reset(){
    clearTimeout(ovTimer);
    N=opts.size;best=store.get(bestKey(),0);const m=Math.floor(N/2);
    cur=[{x:m,y:m},{x:m-1,y:m},{x:m-2,y:m}];prev=cur.map(s=>({x:s.x,y:s.y}));
    dir={x:1,y:0};queue=[];acc=0;gt=0;pend=0;slowUntil=0;score=0;eaten=0;parts=[];bonus=null;apple=null;newBest=false;obs=[];flash=0;combo=0;lastEat=-1e9;pops=[];
    if(opts.obst){
      const cnt=Math.round(N*.55);let tries=0;
      while(obs.length<cnt&&tries++<500){
        const x=1+Math.floor(Math.random()*(N-2)),y=1+Math.floor(Math.random()*(N-2));
        if(Math.abs(y-m)<=1||obs.some(o=>Math.abs(o.x-x)<=1&&Math.abs(o.y-y)<=1))continue;
        obs.push({x,y});
      }
    }
    apple=spawn('apple');state='ready';resize();hud();overlay('ready');
  }
  function overlay(k){
    ovKind=k;ov.hidden=false;
    const T_=$('#ovT'),S=$('#ovS'),B=$('#ovBig'),btn=$('#ovBtn');B.hidden=true;
    if(k==='ready'){T_.textContent=t('ready');S.textContent=t('ready_sub');btn.textContent=t('start')}
    else if(k==='paused'){T_.textContent=t('paused');S.textContent=t('paused_sub');btn.textContent=t('resume')}
    else{T_.textContent=t('over');S.textContent=newBest?t('newbest'):t('yourscore');B.hidden=false;B.textContent=score;btn.textContent=t('again')}
  }
  function start(){state='running';ov.hidden=true;last=0;tone(440,.08,'triangle',.05);tone(660,.1,'triangle',.05,.08)}
  function pause(){if(state!=='running')return;state='paused';overlay('paused')}
  function resume(){if(state!=='paused')return;state='running';ov.hidden=true;last=0}
  function toggle(){
    if(state==='running')pause();else if(state==='paused')resume();
    else if(state==='ready')start();else if(state==='over'){reset();start()}
  }
  function steer(dx,dy){
    if(state==='over'||state==='paused')return;
    const ref=queue.length?queue[queue.length-1]:dir;
    if((dx===ref.x&&dy===ref.y)||(dx===-ref.x&&dy===-ref.y))return;
    if(queue.length<2)queue.push({x:dx,y:dy});
    if(state==='ready')start();
  }
  function burst(a,color,n=14){
    for(let i=0;i<n;i++){const an=Math.random()*6.283,sp=2+Math.random()*4.5;
      parts.push({x:a.x+.5,y:a.y+.5,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:.65,max:.65,c:color})}
  }
  function die(){
    state='over';flash=1;
    burst(cur[0],'#f09a8a',22);
    wrap.classList.remove('shake');void wrap.offsetWidth;wrap.classList.add('shake');
    buzz(60);tone(220,.35,'sawtooth',.05,0,-150);tone(140,.4,'square',.03,.08,-60);
    if(score>best){best=score;newBest=score>0;store.set(bestKey(),best)}
    hud();clearTimeout(ovTimer);ovTimer=setTimeout(()=>{if(state==='over'){overlay('over');if(newBest)confetti()}},520);
  }
  function tick(){
    if(queue.length)dir=queue.shift();
    const h=cur[0];let nx=h.x+dir.x,ny=h.y+dir.y;
    if(opts.walls==='wrap'){nx=(nx+N)%N;ny=(ny+N)%N}
    else if(nx<0||ny<0||nx>=N||ny>=N)return die();
    const hitApple=!!apple&&nx===apple.x&&ny===apple.y;
    const hitBonus=!!bonus&&nx===bonus.x&&ny===bonus.y;
    const gold=hitBonus&&bonus.type==='gold';
    const total=pend+(hitApple?1:0)+(gold?2:0);
    const body=total>0?cur:cur.slice(0,-1);
    if(body.some(s=>s.x===nx&&s.y===ny)||obs.some(o=>o.x===nx&&o.y===ny))return die();
    prev=cur.map(s=>({x:s.x,y:s.y}));
    cur.unshift({x:nx,y:ny});
    if(total>0){prev.push({x:prev[prev.length-1].x,y:prev[prev.length-1].y});pend=total-1}else{cur.pop()}
    if(hitApple){
      combo=gt-lastEat<3200?Math.min(5,combo+1):1;lastEat=gt;const gain=10*combo;
      score+=gain;eaten++;burst(apple,'#f09a8a');tone(660+combo*40,.08,'triangle',.06);tone(880+combo*40,.1,'triangle',.05,.07);
      pops.push({x:apple.x+.5,y:apple.y+.2,txt:'+'+gain,life:.9,max:.9,c:'#f09a8a'});buzz(12);
      apple=null;apple=spawn('apple');
      if(opts.power&&!bonus&&eaten%4===0)bonus=spawn(Math.random()<.65?'gold':'slow');
    }else if(hitBonus){
      if(gold){score+=50;burst(bonus,'#f0cb7a',22);pops.push({x:bonus.x+.5,y:bonus.y+.2,txt:'+50',life:1.1,max:1.1,c:'#f0cb7a'});buzz(25);[784,988,1175,1568].forEach((f,k)=>tone(f,.12,'triangle',.05,k*.06))}
      else{slowUntil=gt+5000;score+=20;burst(bonus,'#86c3e6',22);tone(520,.25,'sine',.06,0,-300)}
      bonus=null;
    }
    if(!apple&&!bonus)return die();
    hud();
  }
  function hud(){
    if(score!==shownScore){const el=$('#hScore');el.textContent=score;if(shownScore>=0&&score>shownScore){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump')}shownScore=score}
    $('#hBest').textContent=Math.max(best,score);$('#hLen').textContent=cur.length;
  }
  function view(){$('#dpad').hidden=!opts.dpad;$('#fpsTag').hidden=!opts.fps}

  function update(dt){
    if(state==='running'){
      gt+=dt;acc+=dt;let g=0,s=stepNow();
      while(acc>=s&&state==='running'&&g++<4){acc-=s;tick();s=stepNow()}
      if(state!=='running')acc=0;
      if(bonus&&gt-bonus.born>bonus.ttl)bonus=null;
      $('#slowTag').hidden=!(gt<slowUntil);
    }
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vx*=.96;p.vy*=.96;p.life-=dt/1000;if(p.life<=0)parts.splice(i,1)}
    if(flash>0)flash=Math.max(0,flash-dt/450);
    for(let i=pops.length-1;i>=0;i--){pops[i].life-=dt/1000;pops[i].y-=dt/900;if(pops[i].life<=0)pops.splice(i,1)}
    const cb=$('#comboTag'),live=state==='running'&&combo>1&&gt-lastEat<3200;
    if(cb.hidden===live)cb.hidden=!live;
    if(live)cb.textContent='x'+combo;
  }
  function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
  const SKINS={mint:[[159,245,200],[143,240,189],[59,143,108]],sky:[[190,230,252],[134,195,230],[48,110,160]],coral:[[255,210,200],[240,154,138],[150,70,62]],gold:[[255,236,180],[240,203,122],[150,110,40]]};
  function skinCol(k,i){
    if(opts.skin==='rainbow')return 'hsl('+((i*22+gt/12)%360)+',70%,66%)';
    const s=SKINS[opts.skin]||SKINS.mint,a=s[1],b=s[2];
    return 'rgb('+Math.round(a[0]+(b[0]-a[0])*k)+','+Math.round(a[1]+(b[1]-a[1])*k)+','+Math.round(a[2]+(b[2]-a[2])*k)+')';
  }
  function skinHead(){const s=SKINS[opts.skin];return s?'rgb('+s[0].join(',')+')':'#fff4d6'}
  function drawBonus(b,now){
    const cx=(b.x+.5)*cell,cy=(b.y+.5)*cell,rem=1-(gt-b.born)/b.ttl;
    if(rem<.28&&Math.floor(now/130)%2)return;
    const col=b.type==='gold'?'#f0cb7a':'#86c3e6',r=cell*.36*(1+Math.sin(now/180)*.07);
    ctx.save();ctx.shadowColor=col;ctx.shadowBlur=cell*.7;ctx.fillStyle=col;ctx.beginPath();
    if(b.type==='gold'){for(let i=0;i<10;i++){const a=-1.5708+i*.6283,rad=i%2?r*.5:r*1.1;ctx.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad)}ctx.closePath();ctx.fill()}
    else{ctx.arc(cx,cy,r,0,6.2832);ctx.fill();ctx.restore();ctx.save();ctx.strokeStyle='#0c1318';ctx.lineWidth=Math.max(1.5,cell*.07);ctx.lineCap='round';
      for(let i=0;i<3;i++){const a=i*1.0472+now/1200;ctx.beginPath();ctx.moveTo(cx-Math.cos(a)*r*.7,cy-Math.sin(a)*r*.7);ctx.lineTo(cx+Math.cos(a)*r*.7,cy+Math.sin(a)*r*.7);ctx.stroke()}}
    ctx.restore();
    ctx.strokeStyle=col;ctx.lineWidth=Math.max(2,cell*.07);ctx.beginPath();ctx.arc(cx,cy,cell*.47,-1.5708,-1.5708+6.2832*Math.max(0,rem));ctx.stroke();
  }
  function draw(now){
    if(!W)return;
    ctx.clearRect(0,0,W,W);if(bg)ctx.drawImage(bg,0,0,W,W);
    ctx.save();ctx.lineWidth=3;ctx.strokeStyle=opts.walls==='solid'?'rgba(240,154,138,.5)':'rgba(127,214,168,.4)';
    if(opts.walls==='wrap')ctx.setLineDash([9,9]);ctx.strokeRect(1.5,1.5,W-3,W-3);ctx.restore();
    for(const o of obs){const x=o.x*cell,y=o.y*cell;ctx.fillStyle='#364a58';rr(x+cell*.08,y+cell*.08,cell*.84,cell*.84,cell*.22);ctx.fill();ctx.fillStyle='#2a3b46';rr(x+cell*.2,y+cell*.24,cell*.6,cell*.6,cell*.16);ctx.fill()}
    if(apple){
      const cx=(apple.x+.5)*cell,cy=(apple.y+.5)*cell,r=cell*.34*(1+Math.sin(now/240)*.05);
      ctx.save();ctx.shadowColor='rgba(240,154,138,.6)';ctx.shadowBlur=cell*.55;ctx.fillStyle='#f09a8a';ctx.beginPath();ctx.arc(cx,cy,r,0,6.2832);ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(cx-r*.35,cy-r*.35,r*.26,0,6.2832);ctx.fill();
      ctx.fillStyle='#7fd6a8';ctx.beginPath();ctx.ellipse(cx+r*.4,cy-r*1.05,r*.42,r*.2,-.6,0,6.2832);ctx.fill();
    }
    if(bonus)drawBonus(bonus,now);
    const t_=state==='running'?Math.min(1,acc/stepNow()):1;
    const P=cur.map((c,i)=>{const a=prev[i]||c;
      if(Math.abs(a.x-c.x)>1||Math.abs(a.y-c.y)>1)return{x:c.x+.5,y:c.y+.5,j:1};
      return{x:a.x+(c.x-a.x)*t_+.5,y:a.y+(c.y-a.y)*t_+.5}});
    const L=P.length;ctx.lineCap='round';ctx.lineJoin='round';
    for(let i=L-1;i>=1;i--){
      const a=P[i],b=P[i-1];
      if(a.j||b.j||Math.abs(a.x-b.x)>1.5||Math.abs(a.y-b.y)>1.5)continue;
      const k=i/(L-1);ctx.strokeStyle=skinCol(k,i);ctx.lineWidth=cell*(.8-.28*k);
      ctx.beginPath();ctx.moveTo(a.x*cell,a.y*cell);ctx.lineTo(b.x*cell,b.y*cell);ctx.stroke();
    }
    const hd=P[0],hx=hd.x*cell,hy=hd.y*cell,px=-dir.y,py=dir.x;
    ctx.save();ctx.shadowColor=skinHead();ctx.shadowBlur=cell*.55;ctx.fillStyle=skinHead();ctx.beginPath();ctx.arc(hx,hy,cell*.45,0,6.2832);ctx.fill();ctx.restore();
    for(const s of[-1,1]){
      const ex=hx+dir.x*cell*.14+px*s*cell*.2,ey=hy+dir.y*cell*.14+py*s*cell*.2;
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,cell*.12,0,6.2832);ctx.fill();
      ctx.fillStyle='#0c1318';ctx.beginPath();ctx.arc(ex+dir.x*cell*.04,ey+dir.y*cell*.04,cell*.06,0,6.2832);ctx.fill();
    }
    for(const p of parts){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x*cell,p.y*cell,cell*.1*(.4+p.life/p.max),0,6.2832);ctx.fill()}
    ctx.globalAlpha=1;
    ctx.textAlign='center';ctx.font='700 '+Math.round(cell*.78)+'px JetBrains Mono, monospace';
    for(const p of pops){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.c;ctx.fillText(p.txt,p.x*cell,p.y*cell)}
    ctx.globalAlpha=1;
    if(flash>0){ctx.fillStyle='rgba(240,154,138,'+(flash*.3)+')';ctx.fillRect(0,0,W,W)}
    if(gt<slowUntil&&state==='running'){ctx.fillStyle='rgba(134,195,230,.07)';ctx.fillRect(0,0,W,W)}
  }
  function frame(ts){
    if(!on){raf=0;return}
    raf=requestAnimationFrame(frame);
    const dt=Math.min(50,last?ts-last:16.7);last=ts;
    update(dt);draw(ts);frames++;
    if(!fpsT)fpsT=ts;
    if(ts-fpsT>500){if(opts.fps)$('#fpsTag').textContent=Math.round(frames*1000/(ts-fpsT))+' FPS';frames=0;fpsT=ts}
  }

  /* input */
  const KD={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
  window.addEventListener('keydown',e=>{
    if(!on||drawerOpen()||e.ctrlKey||e.metaKey||e.altKey)return;
    const k=e.key.length===1?e.key.toLowerCase():e.key,d=KD[k];
    if(d){e.preventDefault();steer(d[0],d[1])}
    else if(k===' '||k==='p'||k==='Escape'||(k==='Enter'&&state!=='running')){e.preventDefault();toggle()}
  });
  let sx=0,sy=0,sid=null;
  wrap.addEventListener('pointerdown',e=>{if(e.target.closest('.ov'))return;sx=e.clientX;sy=e.clientY;sid=e.pointerId});
  wrap.addEventListener('pointermove',e=>{
    if(sid!==e.pointerId)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))>22){
      if(Math.abs(dx)>Math.abs(dy))steer(dx>0?1:-1,0);else steer(0,dy>0?1:-1);
      sx=e.clientX;sy=e.clientY;
    }
  });
  ['pointerup','pointercancel','pointerleave'].forEach(n=>wrap.addEventListener(n,()=>{sid=null}));
  const DM={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  $$('#dpad button').forEach(b=>{
    b.addEventListener('pointerdown',e=>{e.preventDefault();const m=DM[b.dataset.d];steer(m[0],m[1])});
    b.addEventListener('click',e=>{if(e.detail===0){const m=DM[b.dataset.d];steer(m[0],m[1])}});
  });
  $('#ovBtn').addEventListener('click',toggle);
  $('#snPause').addEventListener('click',()=>{if(state==='running')pause();else if(state==='paused')resume()});
  $('#snRestart').addEventListener('click',()=>{reset()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(wrap);
  window.addEventListener('resize',resize);
  bindOpts('snake',opts,k=>{if(k==='dpad'||k==='fps')view();else reset()});
  document.addEventListener('langchange',()=>{overlay(ovKind);if(state!=='over'&&state!=='paused'&&state!=='ready')ov.hidden=true;if(state==='over'&&ov.hidden)ov.hidden=true});
  view();reset();
  return{pause,active(v){
    on=v;
    if(v){resize();last=0;fpsT=0;frames=0;if(!raf)raf=requestAnimationFrame(frame)}
    else{pause();if(raf)cancelAnimationFrame(raf);raf=0}
  }};
})();


/* ---------- Maze: 30 levels, 60 FPS ---------- */
const MZ=(()=>{
  const SPEED=6.2,VIEW=15,DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
  const opts=Object.assign({lives:3,hints:true,map:true,fog:true,unlock:false,dpad:COARSE,fps:true},store.get('maze-opts',{}));
  let prog=store.get('maze-prog',null);
  if(!prog||!Array.isArray(prog.stars)||prog.stars.length!==30)prog={stars:Array(30).fill(0),time:Array(30).fill(0)};
  if(!Array.isArray(prog.time))prog.time=Array(30).fill(0);
  const WORLDS=[{h:158,n:['الواحة','Oasis']},{h:200,n:['الجليد','Frost']},{h:40,n:['الكثبان','Dunes']},{h:10,n:['الجمر','Embers']},{h:262,n:['منتصف الليل','Midnight']}];
  const wIdx=n=>Math.floor((n-1)/6);
  const wName=n=>WORLDS[wIdx(n)].n[lang==='ar'?0:1];
  const wrap=$('#mzWrap'),cv=$('#mzCv'),ctx=cv.getContext('2d'),mapC=$('#mzMap'),mctx=mapC.getContext('2d'),ov=$('#mzOv'),toastEl=$('#mzToast');
  const fogC=document.createElement('canvas'),fctx=fogC.getContext('2d');
  let W=0,dpr=1,L=null,S=null,C=null,on=false,raf=0,last=0,frames=0,fpsT=0,fc=0,ovTimer=0,hintAcc=0;

  /* ----- generation ----- */
  function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
  function params(n){
    const cw=5+Math.round((n-1)*.48);
    return{n,cw,ch:cw,seed:n*7919+104729,braid:n<8?.14:n<18?.09:.05,
      gems:Math.min(13,3+Math.floor(n/3)),keys:n<8?0:n<16?1:n<24?2:3,
      foes:n<11?0:1+Math.floor((n-11)/5),foeSpeed:2.6+n*.06,fog:n<21?0:Math.max(3.6,6.6-(n-21)*.32)};
  }
  function bfs(g,w,h,sx,sy){
    const d=new Int32Array(w*h).fill(-1),q=[sy*w+sx];d[q[0]]=0;
    for(let i=0;i<q.length;i++){const c=q[i],x=c%w,y=(c/w)|0;
      for(const [dx,dy] of DIRS){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const k=ny*w+nx;if(g[k]||d[k]>=0)continue;d[k]=d[c]+1;q.push(k)}}
    return d;
  }
  function build(n){
    const p=params(n),R=rng(p.seed),w=2*p.cw+1,h=2*p.ch+1,g=new Uint8Array(w*h).fill(1);
    const seen=new Uint8Array(p.cw*p.ch),stack=[[0,0]];g[w+1]=0;seen[0]=1;
    while(stack.length){
      const [cx,cy]=stack[stack.length-1],c=[];
      for(const [dx,dy] of DIRS){const nx=cx+dx,ny=cy+dy;if(nx>=0&&ny>=0&&nx<p.cw&&ny<p.ch&&!seen[ny*p.cw+nx])c.push([dx,dy,nx,ny])}
      if(!c.length){stack.pop();continue}
      const [dx,dy,nx,ny]=c[Math.floor(R()*c.length)];
      seen[ny*p.cw+nx]=1;g[(2*cy+1+dy)*w+(2*cx+1+dx)]=0;g[(2*ny+1)*w+(2*nx+1)]=0;stack.push([nx,ny]);
    }
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      if(g[y*w+x]&&((x%2===1&&y%2===0)||(x%2===0&&y%2===1))&&R()<p.braid)g[y*w+x]=0;
    }
    const d=bfs(g,w,h,1,1);let ex=1,ey=1,md=0;
    const cells=[];
    for(let y=1;y<h;y+=2)for(let x=1;x<w;x+=2){const k=y*w+x;if(d[k]>md){md=d[k];ex=x;ey=y}cells.push([x,y])}
    const used=new Set(['1,1',ex+','+ey]),deg=(x,y)=>DIRS.filter(([dx,dy])=>!g[(y+dy)*w+(x+dx)]).length;
    const free=cells.filter(([x,y])=>!used.has(x+','+y));
    const take=(pred,count)=>{
      const out=[],pool=free.filter(([x,y])=>!used.has(x+','+y)&&pred(x,y));
      for(let i=pool.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
      for(const [x,y] of pool){if(out.length>=count)break;out.push({x,y});used.add(x+','+y)}
      return out;
    };
    const keys=take((x,y)=>deg(x,y)===1&&d[y*w+x]>md*.3,p.keys);
    while(keys.length<p.keys)keys.push(...take(()=>true,1));
    const gems=take(()=>true,p.gems);
    const foes=take((x,y)=>d[y*w+x]>Math.max(10,md*.4),p.foes);
    while(foes.length<p.foes)foes.push(...take(()=>true,1));
    keys.forEach(k=>k.got=false);gems.forEach(k=>k.got=false);
    /* par: greedy tour over keys and gems, then the exit */
    let pos=[1,1],tour=0,rest=keys.concat(gems);
    while(rest.length){
      const dd=bfs(g,w,h,pos[0],pos[1]);let bi=0,bd=1e9;
      rest.forEach((it,i)=>{const v=dd[it.y*w+it.x];if(v<bd){bd=v;bi=i}});
      tour+=bd;pos=[rest[bi].x,rest[bi].y];rest.splice(bi,1);
    }
    tour+=bfs(g,w,h,pos[0],pos[1])[ey*w+ex];
    return{p,w,h,g,exit:{x:ex,y:ey},keys,gems,foes,maxDist:md,par:Math.round(tour*1.25/SPEED+4)};
  }

  /* ----- helpers ----- */
  const wall=(x,y)=>x<0||y<0||x>=L.w||y>=L.h||L.g[y*L.w+x]===1;
  const open=(x,y)=>!wall(x,y);
  const posOf=a=>[a.tx+.5+a.dx*a.p,a.ty+.5+a.dy*a.p];
  function palette(n){
    const h=WORLDS[wIdx(n)].h;
    return{h,top:'hsl('+h+' 24% 30%)',hi:'hsl('+h+' 34% 46%)',front:'hsl('+h+' 26% 20%)',shade:'hsl('+h+' 30% 14%)',f1:'hsl('+h+' 22% 11%)',f2:'hsl('+h+' 22% 13%)',acc:'hsl('+h+' 62% 72%)'};
  }
  function move(a,dist,pick,arrive){
    let guard=0;
    while(dist>1e-6&&guard++<10){
      if(a.dx===0&&a.dy===0){
        const d=pick(a);
        if(!d||(!d[0]&&!d[1])||!open(a.tx+d[0],a.ty+d[1]))break;
        a.dx=d[0];a.dy=d[1];a.p=0;
      }
      const room=1-a.p;
      if(dist<room){a.p+=dist;break}
      dist-=room;a.tx+=a.dx;a.ty+=a.dy;a.p=0;
      const d=pick(a);
      if(d&&(d[0]||d[1])&&open(a.tx+d[0],a.ty+d[1])){a.dx=d[0];a.dy=d[1]}
      else if(!open(a.tx+a.dx,a.ty+a.dy)){a.dx=0;a.dy=0}
      if(arrive){arrive(a);if(S.state!=='running')break}
    }
  }
  const pickPlayer=()=>(S.want[0]||S.want[1])?S.want:null;
  function pickFoe(a){
    const opts_=DIRS.filter(([dx,dy])=>open(a.tx+dx,a.ty+dy)&&!(dx===-a.dx&&dy===-a.dy&&(a.dx||a.dy)));
    if(!opts_.length)return[-a.dx,-a.dy];
    const pl=S.pl,dist=Math.abs(pl.tx-a.tx)+Math.abs(pl.ty-a.ty);
    if(dist<=9&&S.inv<=0&&Math.random()<.68){
      let best=opts_[0],bd=1e9;
      for(const d of opts_){const v=Math.abs(pl.tx-(a.tx+d[0]))+Math.abs(pl.ty-(a.ty+d[1]));if(v<bd){bd=v;best=d}}
      return best;
    }
    return rnd(opts_);
  }
  function pathTo(sx,sy,tx,ty){
    const w=L.w,par=new Int32Array(w*L.h).fill(-2),q=[sy*w+sx];par[q[0]]=-1;
    for(let i=0;i<q.length;i++){const c=q[i];if(c===ty*w+tx)break;const x=c%w,y=(c/w)|0;
      for(const [dx,dy] of DIRS){const nx=x+dx,ny=y+dy;if(!open(nx,ny))continue;const k=ny*w+nx;if(par[k]!==-2)continue;par[k]=c;q.push(k)}}
    const out=[];let c=ty*w+tx;if(par[c]===-2)return out;
    while(c!==-1){out.push([c%w+.5,((c/w)|0)+.5]);c=par[c]}
    return out.reverse();
  }

  /* ----- level flow ----- */
  const isOpen=n=>opts.unlock||n===1||prog.stars[n-2]>0;
  function startLevel(n){
    clearTimeout(ovTimer);
    L=build(n);C=palette(n);
    S={n,pl:{tx:1,ty:1,dx:0,dy:0,p:0},want:[0,0],t:0,state:'ready',keys:0,gems:0,lives:opts.lives,hits:0,inv:0,hintT:0,hintPath:null,hintsLeft:3,
      foes:L.foes.map(f=>({tx:f.x,ty:f.y,dx:0,dy:0,p:0,hx:f.x,hy:f.y})),parts:[],flash:0,trail:[],ex:new Uint8Array(L.w*L.h),camx:0,camy:0,toastT:0,secShown:-1,ovKind:''};
    $('#maze').style.setProperty('--acc',C.acc);
    $('#mzSel').hidden=true;$('#mzPlay').hidden=false;
    $('#mzKeysT').hidden=!L.keys.length;
    mapC.hidden=!(opts.map&&(L.w>VIEW||(L.p.fog&&opts.fog)));
    $('#mzLvl').textContent=t('level')+' '+n+' · '+wName(n);
    view();resize();camSnap();hud(true);overlay('ready');
  }
  function showSelect(){
    clearTimeout(ovTimer);
    if(S&&S.state==='running')S.state='paused';
    S=null;$('#mzPlay').hidden=true;$('#mzSel').hidden=false;$('#maze').style.removeProperty('--acc');buildSelect();
  }
  function start(){if(S.state!=='ready')return;S.state='running';ov.hidden=true;last=0;tone(440,.08,'triangle',.05);tone(660,.1,'triangle',.05,.08)}
  function pause(){if(S&&S.state==='running'){S.state='paused';overlay('paused')}}
  function resume(){if(S&&S.state==='paused'){S.state='running';ov.hidden=true;last=0}}
  function toast(msg){toastEl.textContent=msg;toastEl.hidden=false;S.toastT=1.6}
  function burst(x,y,col,n=14){for(let i=0;i<n;i++){const a=Math.random()*6.283,sp=1.5+Math.random()*3.5;S.parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.7,max:.7,c:col})}}
  function arrivePlayer(a){
    const x=a.tx,y=a.ty;
    for(const k of L.keys)if(!k.got&&k.x===x&&k.y===y){k.got=true;S.keys++;burst(x+.5,y+.5,'#f0cb7a',18);tone(880,.1,'triangle',.06);tone(1175,.14,'triangle',.05,.08);hud();if(S.keys===L.keys.length)toast(t('mz_gateopen'))}
    for(const k of L.gems)if(!k.got&&k.x===x&&k.y===y){k.got=true;S.gems++;burst(x+.5,y+.5,'#86c3e6',12);tone(700+S.gems*30,.09,'triangle',.05);hud()}
    if(x===L.exit.x&&y===L.exit.y){
      if(S.keys>=L.keys.length)win();
      else if(S.toastT<=0){toast(t('mz_need'));tone(180,.15,'square',.03)}
    }
  }
  function hit(){
    S.hits++;S.flash=1;wrap.classList.remove('shake');void wrap.offsetWidth;wrap.classList.add('shake');
    tone(200,.3,'sawtooth',.05,0,-120);if(navigator.vibrate){try{navigator.vibrate(50)}catch(e){}}
    const p=posOf(S.pl);burst(p[0],p[1],'#f09a8a',20);
    if(opts.lives<99){S.lives--;if(S.lives<=0){S.lives=0;hud();return lose()}}
    const pl=S.pl;pl.tx=1;pl.ty=1;pl.dx=pl.dy=0;pl.p=0;S.want=[0,0];S.inv=2;
    S.foes.forEach(f=>{f.tx=f.hx;f.ty=f.hy;f.dx=f.dy=0;f.p=0});
    hud();
  }
  function lose(){
    S.state='lost';clearTimeout(ovTimer);ovTimer=setTimeout(()=>{if(S&&S.state==='lost')overlay('lost')},650);
  }
  function win(){
    S.state='won';S.stars=1;
    if(S.gems===L.gems.length){S.stars=2;if(S.t<=L.par)S.stars=3}
    const i=S.n-1;prog.stars[i]=Math.max(prog.stars[i],S.stars);
    if(!prog.time[i]||S.t<prog.time[i])prog.time[i]=Math.round(S.t*10)/10;
    store.set('maze-prog',prog);
    [523,659,784,1047].forEach((f,k)=>tone(f,.2,'triangle',.06,k*.1));
    burst(L.exit.x+.5,L.exit.y+.5,'#f0cb7a',30);
    clearTimeout(ovTimer);ovTimer=setTimeout(()=>{if(S&&S.state==='won'){overlay('won');confetti()}},700);
  }
  function steer(dx,dy){
    if(!S||(S.state!=='running'&&S.state!=='ready'))return;
    if(S.state==='ready')start();
    const a=S.pl;
    if((a.dx||a.dy)&&dx===-a.dx&&dy===-a.dy){a.tx+=a.dx;a.ty+=a.dy;a.p=1-a.p;a.dx=-a.dx;a.dy=-a.dy}
    S.want=[dx,dy];
  }
  function hintNow(){
    if(!S||S.state!=='running'||!opts.hints||S.hintsLeft<=0)return;
    S.hintsLeft--;S.hintT=4;hintAcc=1;hudHint();tone(600,.12,'sine',.05);
  }
  function computeHint(){
    const pl=S.pl;let tx=L.exit.x,ty=L.exit.y;
    if(S.keys<L.keys.length){
      const d=bfs(L.g,L.w,L.h,pl.tx,pl.ty);let bd=1e9;
      for(const k of L.keys)if(!k.got){const v=d[k.y*L.w+k.x];if(v<bd){bd=v;tx=k.x;ty=k.y}}
    }
    S.hintPath=pathTo(pl.tx,pl.ty,tx,ty);
  }

  /* ----- HUD and overlays ----- */
  const fmt=s=>{s=Math.floor(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  function hud(force){
    if(!S)return;
    $('#mzGems').textContent=S.gems+'/'+L.gems.length;
    $('#mzKeys').textContent=S.keys+'/'+L.keys.length;
    $('#mzLives').textContent=opts.lives>=99?'∞':'♥'.repeat(Math.max(0,S.lives));
    $('#mzLives').style.color='var(--coral)';
    const sec=Math.floor(S.t);if(force||sec!==S.secShown){S.secShown=sec;$('#mzTime').textContent=fmt(S.t)}
    hudHint();
  }
  function hudHint(){
    const b=$('#mzHintB');b.textContent=t('hint_left')+(opts.hints?' ('+(S?S.hintsLeft:3)+')':'');
    b.disabled=!opts.hints||!S||S.hintsLeft<=0;
  }
  function view(){$('#mzDpad').hidden=!opts.dpad;$('#mzFps').hidden=!opts.fps;hudHint()}
  function overlay(kind){
    S.ovKind=kind;ov.hidden=false;
    const nm=wName(S.n),head='<div class="kick">'+t('level')+' '+S.n+' · '+nm+'</div>';
    if(kind==='ready'){
      const chips=['<span class="chip">'+L.gems.length+' '+t('mz_gems')+'</span>'];
      if(L.keys.length)chips.push('<span class="chip">'+L.keys.length+' '+t('mz_keys')+'</span>');
      if(L.foes.length)chips.push('<span class="chip">'+L.foes.length+' '+t('mz_foes')+'</span>');
      if(L.p.fog&&opts.fog)chips.push('<span class="chip">'+t('mz_fogc')+'</span>');
      chips.push('<span class="chip">'+t('mz_par')+' '+fmt(L.par)+'</span>');
      ov.innerHTML='<div>'+head+'<h2>'+t('ready')+'</h2><div class="goals">'+chips.join('')+'</div><p>'+t('mz_how')+'</p><div class="btns"><button class="btn primary" data-act="go">'+t('start')+'</button><button class="btn" data-act="levels">'+t('mz_levels')+'</button></div></div>';
    }else if(kind==='paused'){
      ov.innerHTML='<div>'+head+'<h2>'+t('paused')+'</h2><div class="btns"><button class="btn primary" data-act="resume">'+t('resume')+'</button><button class="btn" data-act="levels">'+t('mz_levels')+'</button></div></div>';
    }else if(kind==='won'){
      const st=[1,2,3].map(i=>'<i class="'+(i<=S.stars?'f':'')+'" style="--d:'+(i*.2)+'s"></i>').join('');
      ov.innerHTML='<div>'+head+'<h2>'+t('mz_clear')+'</h2><div class="stars">'+st+'</div><div class="stat"><span>'+fmt(S.t)+'</span><span>'+t('mz_par')+' '+fmt(L.par)+'</span><span>'+S.gems+'/'+L.gems.length+' '+t('mz_gems')+'</span></div><div class="btns">'+(S.n<30&&isOpen(S.n+1)?'<button class="btn primary" data-act="next">'+t('mz_next')+'</button>':'')+'<button class="btn" data-act="retry">'+t('mz_replay')+'</button><button class="btn" data-act="levels">'+t('mz_levels')+'</button></div></div>';
    }else{
      ov.innerHTML='<div>'+head+'<h2>'+t('mz_fail')+'</h2><div class="btns"><button class="btn primary" data-act="retry">'+t('mz_retry')+'</button><button class="btn" data-act="levels">'+t('mz_levels')+'</button></div></div>';
    }
    const b=$('.btn.primary',ov);if(b)b.focus({preventScroll:true});
  }
  ov.addEventListener('click',e=>{
    const b=e.target.closest('[data-act]');if(!b||!S)return;
    const a=b.dataset.act;
    if(a==='go')start();else if(a==='resume')resume();else if(a==='levels')showSelect();
    else if(a==='retry')startLevel(S.n);else if(a==='next')startLevel(S.n+1);
  });
  function buildSelect(){
    let done=0,stars=0,html='';
    prog.stars.forEach(s=>{if(s>0)done++;stars+=s});
    $('#mzProg').textContent=done+'/30 · '+stars+'/90 '+t('stars_w');
    const lock='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';
    WORLDS.forEach((wd,wi)=>{
      let ws=0;
      let btns='';
      for(let k=1;k<=6;k++){
        const n=wi*6+k,s=prog.stars[n-1],ok=isOpen(n);ws+=s;
        btns+='<button class="lv'+(ok?'':' lock')+(s?' done':'')+'" data-n="'+n+'" '+(ok?'':'aria-disabled="true" ')+'aria-label="'+t('level')+' '+n+'">'+
          (ok?'<b>'+n+'</b>':lock)+'<span class="st">'+[1,2,3].map(i=>'<i class="'+(i<=s?'f':'')+'"></i>').join('')+'</span></button>';
      }
      html+='<div class="world" style="--w:hsl('+wd.h+' 62% 72%)"><h3>'+wd.n[lang==='ar'?0:1]+'<small>'+ws+'/18</small></h3><div class="lv-grid">'+btns+'</div></div>';
    });
    $('#mzWorlds').innerHTML=html;
  }
  $('#mzWorlds').addEventListener('click',e=>{
    const b=e.target.closest('.lv');if(!b)return;
    const n=Number(b.dataset.n);
    if(!isOpen(n)){tone(160,.1,'square',.03);return}
    tone(520,.06,'triangle',.04);startLevel(n);
  });

  /* ----- sizing and camera ----- */
  function resize(){
    const r=wrap.getBoundingClientRect();if(!r.width)return;
    W=r.width;dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=cv.height=fogC.width=fogC.height=Math.round(W*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);fctx.setTransform(dpr,0,0,dpr,0,0);
    const m=Math.round(96*dpr);mapC.width=mapC.height=m;mctx.setTransform(m/96,0,0,m/96,0,0);
  }
  function camTarget(){
    const vt=Math.min(L.w,VIEW),p=posOf(S.pl);
    return[Math.max(0,Math.min(L.w-vt,p[0]-vt/2)),Math.max(0,Math.min(L.h-vt,p[1]-vt/2))];
  }
  function camSnap(){const c=camTarget();S.camx=c[0];S.camy=c[1]}

  /* ----- update ----- */
  function update(dt){
    if(!S)return;
    const s=dt/1000;
    if(S.state==='running'){
      S.t+=s;if(S.inv>0)S.inv-=s;
      move(S.pl,SPEED*s,pickPlayer,arrivePlayer);
      if(S.state==='running'){
        for(const f of S.foes)move(f,L.p.foeSpeed*s,pickFoe,null);
        if(S.inv<=0){const p=posOf(S.pl);for(const f of S.foes){const q=posOf(f);if(Math.hypot(p[0]-q[0],p[1]-q[1])<.62){hit();break}}}
      }
      if(S.hintT>0){S.hintT-=s;hintAcc-=s;if(hintAcc<=0){computeHint();hintAcc=.25}if(S.hintT<=0)S.hintPath=null}
      const sec=Math.floor(S.t);if(sec!==S.secShown){S.secShown=sec;$('#mzTime').textContent=fmt(S.t)}
    }
    if(S.toastT>0){S.toastT-=s;if(S.toastT<=0)toastEl.hidden=true}
    if(S.flash>0)S.flash=Math.max(0,S.flash-s/.45);
    for(let i=S.parts.length-1;i>=0;i--){const p=S.parts[i];p.x+=p.vx*s;p.y+=p.vy*s;p.vx*=.95;p.vy*=.95;p.life-=s;if(p.life<=0)S.parts.splice(i,1)}
    const pp=posOf(S.pl);
    if(S.state==='running'){
      const l=S.trail[S.trail.length-1];
      if(!l||Math.hypot(pp[0]-l[0],pp[1]-l[1])>.14){S.trail.push(pp);if(S.trail.length>14)S.trail.shift()}
    }
    const px=Math.floor(pp[0]),py=Math.floor(pp[1]);
    for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){if(x*x+y*y>10)continue;const nx=px+x,ny=py+y;if(nx>=0&&ny>=0&&nx<L.w&&ny<L.h)S.ex[ny*L.w+nx]=1}
    const c=camTarget(),k=1-Math.exp(-s*8);
    S.camx+=(c[0]-S.camx)*k;S.camy+=(c[1]-S.camy)*k;
  }

  /* ----- draw ----- */
  function drawKey(cx,cy,ts,now){
    const bob=Math.sin(now/260)*ts*.04,r=ts*.15;
    ctx.save();ctx.translate(cx,cy+bob);ctx.rotate(-.7);ctx.shadowColor='#f0cb7a';ctx.shadowBlur=ts*.4;
    ctx.strokeStyle='#f0cb7a';ctx.lineWidth=ts*.07;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(-ts*.15,0,r,0,6.2832);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-ts*.15+r,0);ctx.lineTo(ts*.28,0);ctx.moveTo(ts*.2,0);ctx.lineTo(ts*.2,ts*.1);ctx.moveTo(ts*.28,0);ctx.lineTo(ts*.28,ts*.12);ctx.stroke();
    ctx.restore();
  }
  function drawGem(cx,cy,ts,now){
    const r=ts*.2*(1+Math.sin(now/300+cx)*.06);
    ctx.save();ctx.translate(cx,cy);ctx.shadowColor='#86c3e6';ctx.shadowBlur=ts*.4;
    ctx.fillStyle='#86c3e6';ctx.beginPath();ctx.moveTo(0,-r*1.3);ctx.lineTo(r,0);ctx.lineTo(0,r*1.3);ctx.lineTo(-r,0);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(0,-r*1.3);ctx.lineTo(r*.4,-r*.2);ctx.lineTo(0,r*.1);ctx.lineTo(-r*.55,-r*.25);ctx.closePath();ctx.fill();
    ctx.restore();
  }
  function drawExit(cx,cy,ts,now){
    const openG=S.keys>=L.keys.length,col=openG?'#f0cb7a':'#6b7c85',r=ts*.36;
    ctx.save();ctx.translate(cx,cy);
    if(openG){ctx.shadowColor=col;ctx.shadowBlur=ts*.7}
    ctx.strokeStyle=col;ctx.lineWidth=ts*.08;ctx.setLineDash([ts*.2,ts*.14]);ctx.lineDashOffset=-now/(openG?40:200);
    ctx.beginPath();ctx.arc(0,0,r,0,6.2832);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=openG?'rgba(240,203,122,'+(.28+Math.sin(now/220)*.1)+')':'rgba(107,124,133,.25)';
    ctx.beginPath();ctx.arc(0,0,r*.72,0,6.2832);ctx.fill();
    if(!openG){ctx.shadowBlur=0;ctx.fillStyle=col;ctx.fillRect(-ts*.09,-ts*.02,ts*.18,ts*.14);ctx.strokeStyle=col;ctx.lineWidth=ts*.04;ctx.beginPath();ctx.arc(0,-ts*.02,ts*.07,Math.PI,0);ctx.stroke()}
    ctx.restore();
  }
  function drawFoe(f,ts,now,camx,camy){
    const p=posOf(f),x=(p[0]-camx)*ts,y=(p[1]-camy)*ts,r=ts*.34,pl=posOf(S.pl);
    ctx.save();ctx.shadowColor='rgba(240,154,138,.7)';ctx.shadowBlur=ts*.45;ctx.fillStyle='#f09a8a';
    ctx.beginPath();ctx.arc(x,y-r*.1,r,Math.PI,0);ctx.lineTo(x+r,y+r*.8);
    for(let i=0;i<3;i++){const x1=x+r-(i*2+1)*r/3,x2=x+r-(i+1)*2*r/3,w=Math.sin(now/120+i*2)*r*.12;ctx.quadraticCurveTo(x1,y+r*(.4+w/r),x2,y+r*.8)}
    ctx.closePath();ctx.fill();ctx.restore();
    let dx=pl[0]-p[0],dy=pl[1]-p[1];const n=Math.hypot(dx,dy)||1;dx/=n;dy/=n;
    for(const sd of[-1,1]){
      const ex=x+sd*r*.38,ey=y-r*.2;
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,r*.26,0,6.2832);ctx.fill();
      ctx.fillStyle='#0c1318';ctx.beginPath();ctx.arc(ex+dx*r*.1,ey+dy*r*.1,r*.12,0,6.2832);ctx.fill();
    }
  }
  function draw(now){
    if(!S||!W)return;
    const vt=Math.min(L.w,VIEW),ts=W/vt,cx=S.camx,cy=S.camy;
    ctx.clearRect(0,0,W,W);
    const x0=Math.max(0,Math.floor(cx)),y0=Math.max(0,Math.floor(cy)),x1=Math.min(L.w-1,Math.ceil(cx+vt)),y1=Math.min(L.h-1,Math.ceil(cy+vt));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      if(L.g[y*L.w+x]===1)continue;
      ctx.fillStyle=(x+y)%2?C.f1:C.f2;ctx.fillRect((x-cx)*ts,(y-cy)*ts,ts+.5,ts+.5);
    }
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      if(L.g[y*L.w+x]!==1)continue;
      const X=(x-cx)*ts,Y=(y-cy)*ts;
      ctx.fillStyle=C.top;ctx.fillRect(X,Y,ts+.5,ts+.5);
      if(!wall(x,y-1)){ctx.fillStyle=C.hi;ctx.fillRect(X,Y,ts+.5,Math.max(1.5,ts*.07))}
      if(!wall(x,y+1)){ctx.fillStyle=C.front;ctx.fillRect(X,Y+ts,ts+.5,ts*.3);ctx.fillStyle=C.shade;ctx.fillRect(X,Y+ts+ts*.26,ts+.5,ts*.06)}
    }
    if(S.hintPath&&S.hintPath.length>1){
      ctx.save();ctx.strokeStyle='rgba(240,203,122,.8)';ctx.lineWidth=ts*.12;ctx.lineCap='round';ctx.setLineDash([ts*.16,ts*.24]);ctx.lineDashOffset=-now/50;
      ctx.beginPath();const pp=posOf(S.pl);ctx.moveTo((pp[0]-cx)*ts,(pp[1]-cy)*ts);
      for(let i=1;i<S.hintPath.length;i++)ctx.lineTo((S.hintPath[i][0]-cx)*ts,(S.hintPath[i][1]-cy)*ts);
      ctx.stroke();ctx.restore();
    }
    drawExit((L.exit.x+.5-cx)*ts,(L.exit.y+.5-cy)*ts,ts,now);
    for(const k of L.keys)if(!k.got)drawKey((k.x+.5-cx)*ts,(k.y+.5-cy)*ts,ts,now);
    for(const k of L.gems)if(!k.got)drawGem((k.x+.5-cx)*ts,(k.y+.5-cy)*ts,ts,now);
    for(const f of S.foes)drawFoe(f,ts,now,cx,cy);
    const pp=posOf(S.pl),X=(pp[0]-cx)*ts,Y=(pp[1]-cy)*ts,r=ts*.3;
    if(S.trail.length>1){
      for(let i=0;i<S.trail.length;i++){const q=S.trail[i],k=(i+1)/S.trail.length;
        ctx.fillStyle='rgba(127,214,168,'+(k*.22)+')';ctx.beginPath();ctx.arc((q[0]-cx)*ts,(q[1]-cy)*ts,r*k*.85,0,6.2832);ctx.fill()}
    }
    ctx.save();
    if(S.inv>0&&Math.floor(now/90)%2)ctx.globalAlpha=.35;
    ctx.shadowColor='#7fd6a8';ctx.shadowBlur=ts*.55;
    const gr=ctx.createRadialGradient(X-r*.3,Y-r*.3,r*.1,X,Y,r);gr.addColorStop(0,'#e6fff3');gr.addColorStop(1,'#58d39b');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(X,Y,r,0,6.2832);ctx.fill();ctx.restore();
    const fdx=S.pl.dx||S.want[0]||0,fdy=S.pl.dy||S.want[1]||0;
    ctx.fillStyle='#0c1318';
    for(const sd of[-1,1]){ctx.beginPath();ctx.arc(X+(-fdy)*sd*r*.36+fdx*r*.22,Y+fdx*sd*r*.36+fdy*r*.22,r*.12,0,6.2832);ctx.fill()}
    for(const p of S.parts){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc((p.x-cx)*ts,(p.y-cy)*ts,ts*.07*(.4+p.life/p.max),0,6.2832);ctx.fill()}
    ctx.globalAlpha=1;
    if(L.p.fog&&opts.fog){
      const R=L.p.fog*ts;
      fctx.globalCompositeOperation='source-over';fctx.fillStyle='rgba(7,11,14,.97)';fctx.fillRect(0,0,W,W);
      fctx.globalCompositeOperation='destination-out';
      const g=fctx.createRadialGradient(X,Y,0,X,Y,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.6,'rgba(0,0,0,.95)');g.addColorStop(1,'rgba(0,0,0,0)');
      fctx.fillStyle=g;fctx.beginPath();fctx.arc(X,Y,R,0,6.2832);fctx.fill();
      ctx.drawImage(fogC,0,0,W,W);
    }
    if(S.flash>0){ctx.fillStyle='rgba(240,154,138,'+(S.flash*.3)+')';ctx.fillRect(0,0,W,W)}
    if(!mapC.hidden&&fc%3===0)drawMap(vt,cx,cy);
  }
  function drawMap(vt,cx,cy){
    const sc=96/L.w;mctx.clearRect(0,0,96,96);
    for(let y=0;y<L.h;y++)for(let x=0;x<L.w;x++){
      const k=y*L.w+x;if(!S.ex[k])continue;
      mctx.fillStyle=L.g[k]?'#3d5a6a':'#1d2f3a';mctx.fillRect(x*sc,y*sc,sc+.4,sc+.4);
    }
    if(S.ex[L.exit.y*L.w+L.exit.x]){mctx.fillStyle='#f0cb7a';mctx.fillRect((L.exit.x-.5)*sc,(L.exit.y-.5)*sc,sc*2,sc*2)}
    const p=posOf(S.pl);mctx.fillStyle='#7fd6a8';mctx.beginPath();mctx.arc(p[0]*sc,p[1]*sc,Math.max(2,sc*1.1),0,6.2832);mctx.fill();
    if(vt<L.w){mctx.strokeStyle='rgba(255,255,255,.45)';mctx.lineWidth=1;mctx.strokeRect(cx*sc,cy*sc,vt*sc,vt*sc)}
  }
  function frame(ts){
    if(!on){raf=0;return}
    raf=requestAnimationFrame(frame);
    const dt=Math.min(50,last?ts-last:16.7);last=ts;
    update(dt);draw(ts);fc++;frames++;
    if(!fpsT)fpsT=ts;
    if(ts-fpsT>500){if(opts.fps)$('#mzFps').textContent=Math.round(frames*1000/(ts-fpsT))+' FPS';frames=0;fpsT=ts}
  }

  /* ----- input ----- */
  const KD={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
  window.addEventListener('keydown',e=>{
    if(!on||drawerOpen()||!S||e.ctrlKey||e.metaKey||e.altKey)return;
    const k=e.key.length===1?e.key.toLowerCase():e.key,d=KD[k];
    if(d){e.preventDefault();steer(d[0],d[1])}
    else if(k==='h')hintNow();
    else if(k==='r')startLevel(S.n);
    else if(k===' '||k==='p'||k==='Escape'||k==='Enter'){
      e.preventDefault();
      if(S.state==='running')pause();else if(S.state==='paused')resume();else if(S.state==='ready')start();
      else if(S.state==='won'&&S.n<30&&isOpen(S.n+1))startLevel(S.n+1);else if(S.state==='lost')startLevel(S.n);
    }
  });
  let sx=0,sy=0,sid=null;
  wrap.addEventListener('pointerdown',e=>{if(e.target.closest('.ov'))return;sx=e.clientX;sy=e.clientY;sid=e.pointerId});
  wrap.addEventListener('pointermove',e=>{
    if(sid!==e.pointerId)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))>20){
      if(Math.abs(dx)>Math.abs(dy))steer(dx>0?1:-1,0);else steer(0,dy>0?1:-1);
      sx=e.clientX;sy=e.clientY;
    }
  });
  ['pointerup','pointercancel','pointerleave'].forEach(n=>wrap.addEventListener(n,()=>{sid=null}));
  const DM={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  $$('#mzDpad button').forEach(b=>{
    b.addEventListener('pointerdown',e=>{e.preventDefault();const m=DM[b.dataset.d];steer(m[0],m[1])});
    b.addEventListener('click',e=>{if(e.detail===0){const m=DM[b.dataset.d];steer(m[0],m[1])}});
  });
  $('#mzLevels').addEventListener('click',showSelect);
  $('#mzRestart').addEventListener('click',()=>{if(S)startLevel(S.n)});
  $('#mzHintB').addEventListener('click',hintNow);
  $('#mzPauseB').addEventListener('click',()=>{if(!S)return;if(S.state==='running')pause();else if(S.state==='paused')resume()});
  let rt=0;
  $('#mzReset').addEventListener('click',e=>{
    const b=e.currentTarget;
    if(!rt){b.textContent=t('resetprog2');rt=setTimeout(()=>{rt=0;b.textContent=t('resetprog')},3000);return}
    clearTimeout(rt);rt=0;b.textContent=t('resetprog');
    prog={stars:Array(30).fill(0),time:Array(30).fill(0)};store.set('maze-prog',prog);buildSelect();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
  if('ResizeObserver' in window)new ResizeObserver(()=>{resize()}).observe(wrap);
  window.addEventListener('resize',resize);
  bindOpts('maze',opts,k=>{
    if(k==='dpad'||k==='fps'||k==='hints'){view();return}
    if(k==='unlock'){buildSelect();return}
    if(S)startLevel(S.n);
  });
  document.addEventListener('langchange',()=>{
    if(!$('#mzSel').hidden)buildSelect();
    if(S){$('#mzLvl').textContent=t('level')+' '+S.n+' · '+wName(S.n);hud(true);if(!ov.hidden)overlay(S.ovKind)}
  });
  buildSelect();
  return{pause,active(v){
    on=v;
    if(v){resize();last=0;fpsT=0;frames=0;if(!raf)raf=requestAnimationFrame(frame)}
    else{pause();if(raf)cancelAnimationFrame(raf);raf=0}
  }};
})();

/* ---------- Orbit: my own game. One tap, 60 FPS ---------- */
const OR=(()=>{
  const opts=Object.assign({speed:'normal',aim:true,mines:true,trail:true,haptic:true,fps:true},store.get('orbit-opts',{}));
  const SP={chill:[3.1,6.4],normal:[3.7,7.4],fast:[4.5,8.6]};   /* orbit speed, launch speed (units per second) */
  const HUES=[200,158,40,10,262,330];
  const wrap=$('#orWrap'),cv=$('#orCv'),ctx=cv.getContext('2d'),ov=$('#orOv');
  let W=0,dpr=1,u=40,on=false,raf=0,last=0,frames=0,fpsT=0,state='ready',ovKind='ready',ovTimer=0;
  let planets=[],pickups=[],mines=[],P=null,camY=2,reachY=2,score=0,best=0,stars=0,combo=1,pops=[],parts=[],shake=0,flash=0,newBest=false;
  const bestKey=()=>'orbit-best-'+opts.speed;
  const buzz=ms=>{if(opts.haptic&&navigator.vibrate){try{navigator.vibrate(ms)}catch(e){}}};
  const hs=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};

  /* ----- world ----- */
  function mk(x,y){
    const r=.42+Math.random()*.3;
    return{x,y,r,ringR:r+.85+Math.random()*.25,h:rnd(HUES),visited:false,om:null,spin:Math.random()*6.28};
  }
  function addPlanet(){
    const prev=planets[planets.length-1],i=planets.length;
    const d=3.4+Math.random()*(1.2+Math.min(.9,i*.03)),th=(50+Math.random()*80)*Math.PI/180;
    const nx=Math.max(1.6,Math.min(8.4,prev.x+Math.cos(th)*d)),dx=nx-prev.x;
    const dy=Math.sqrt(Math.max(2.4*2.4,d*d-dx*dx));
    const p=mk(nx,prev.y+dy);
    if(opts.mines&&i>=8&&Math.random()<.35)p.om={ang:Math.random()*6.28,w:(Math.random()<.5?-1:1)*(1.6+Math.random()*.8),r:p.ringR+.75,x:0,y:0};
    planets.push(p);
    const ux=p.x-prev.x,uy=p.y-prev.y,ul=Math.hypot(ux,uy),nxn=-uy/ul,nyn=ux/ul,mx=prev.x+ux/2,my=prev.y+uy/2;
    if(Math.random()<.55)pickups.push({x:mx+nxn*(Math.random()-.5)*.3,y:my+nyn*(Math.random()-.5)*.3,got:false});
    if(opts.mines&&i>=4&&Math.random()<Math.min(.55,.2+i*.02)){
      const side=Math.random()<.5?-1:1,off=1.15+Math.random()*.7,tt=.4+Math.random()*.2;
      mines.push({x:Math.max(.6,Math.min(9.4,prev.x+ux*tt+nxn*side*off)),y:prev.y+uy*tt+nyn*side*off,a:Math.random()*6.28});
    }
  }
  const ensure=()=>{while(planets[planets.length-1].y<camY+12)addPlanet()};
  function sync(){
    const pl=planets[P.pi];
    P.x=pl.x+Math.cos(P.ang)*P.rad;P.y=pl.y+Math.sin(P.ang)*P.rad;
    P.vx=-Math.sin(P.ang)*P.dir;P.vy=Math.cos(P.ang)*P.dir;
  }
  function reset(){
    clearTimeout(ovTimer);
    planets=[];pickups=[];mines=[];pops=[];parts=[];score=0;stars=0;combo=1;shake=0;flash=0;newBest=false;
    best=store.get(bestKey(),0);
    const f=mk(5,2);f.visited=true;f.r=.6;f.ringR=1.45;f.om=null;planets.push(f);
    P={mode:'orbit',pi:0,ang:-1.5708,dir:1,rad:f.ringR,x:0,y:0,vx:0,vy:0,from:-1,tFly:0,trail:[]};
    camY=2;reachY=2;ensure();sync();state='ready';hud();resize();overlay('ready');
  }

  /* ----- flow ----- */
  function overlay(kind){
    ovKind=kind;ov.hidden=false;
    const T_=$('#orT'),S_=$('#orS'),B=$('#orBig'),b=$('#orBtn');B.hidden=true;
    if(kind==='ready'){T_.textContent=t('orbit_name');S_.textContent=t('or_ready_s');b.textContent=t('start')}
    else if(kind==='paused'){T_.textContent=t('paused');S_.textContent=t('paused_sub');b.textContent=t('resume')}
    else{T_.textContent=t('over');S_.textContent=newBest?t('newbest'):t('yourscore');B.hidden=false;B.textContent=score;b.textContent=t('again')}
    b.focus({preventScroll:true});
  }
  function start(){state='running';ov.hidden=true;last=0;tone(440,.08,'triangle',.05);tone(660,.1,'triangle',.05,.08)}
  function pause(){if(state==='running'){state='paused';overlay('paused')}}
  function resume(){if(state==='paused'){state='running';ov.hidden=true;last=0}}
  function toggle(){
    if(state==='running')pause();else if(state==='paused')resume();
    else if(state==='ready')start();else if(state==='over'){reset();start()}
  }
  function burst(x,y,c,n=14){for(let i=0;i<n;i++){const a=Math.random()*6.283,sp=1.5+Math.random()*3.5;parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.7,max:.7,c})}}
  function die(){
    state='over';shake=1;flash=1;buzz(70);burst(P.x,P.y,'#f09a8a',24);
    tone(220,.4,'sawtooth',.05,0,-160);tone(130,.45,'square',.03,.08,-50);
    if(score>best){best=score;newBest=score>0;store.set(bestKey(),best)}
    hud();clearTimeout(ovTimer);ovTimer=setTimeout(()=>{if(state==='over'){overlay('over');if(newBest)confetti()}},650);
  }
  function launch(){
    if(state==='ready'){start();return}
    if(state!=='running'||P.mode!=='orbit')return;
    const fv=SP[opts.speed][1];
    P.vx*=fv;P.vy*=fv;P.mode='fly';P.from=P.pi;P.tFly=0;
    tone(300,.14,'sine',.05,0,500);buzz(8);
  }
  function capture(j,dx,dy,d){
    const pl=planets[j],sp=Math.hypot(P.vx,P.vy)||1;
    const miss=Math.abs(P.vx*(pl.y-P.y)-P.vy*(pl.x-P.x))/sp;
    P.dir=(dx*P.vy-dy*P.vx)>=0?1:-1;P.ang=Math.atan2(dy,dx);P.rad=d;P.pi=j;P.mode='orbit';
    if(!pl.visited){
      pl.visited=true;
      const perfect=miss<.5;combo=perfect?Math.min(5,combo+1):1;
      const gain=10*combo;score+=gain;reachY=Math.max(reachY,pl.y);
      pops.push({x:pl.x,y:pl.y+pl.ringR+.5,txt:'+'+gain+(perfect?'  '+t('or_perfect')+(combo>1?' x'+combo:''):''),life:1.2,max:1.2,c:perfect?'#f0cb7a':'#7fd6a8'});
      burst(P.x,P.y,perfect?'#f0cb7a':'#7fd6a8',perfect?22:12);
      tone(520+combo*60,.12,'triangle',.06);if(perfect)tone(780+combo*60,.16,'triangle',.05,.09);
      buzz(perfect?22:10);ensure();hud();
    }else tone(400,.06,'triangle',.03);
  }
  function hud(){
    $('#orScore').textContent=score;$('#orBest').textContent=Math.max(best,score);$('#orStars').textContent=stars;
    const cb=$('#orCombo');cb.hidden=combo<2;if(combo>1)cb.textContent='x'+combo;
  }

  /* ----- update ----- */
  function update(dt){
    const s=dt/1000;
    if(state==='running'){
      const v=SP[opts.speed][0]*(1+Math.min(.45,score/500));
      for(let j=Math.max(0,P.pi-3);j<planets.length;j++){const pl=planets[j];if(pl.om){pl.om.ang+=pl.om.w*s;pl.om.x=pl.x+Math.cos(pl.om.ang)*pl.om.r;pl.om.y=pl.y+Math.sin(pl.om.ang)*pl.om.r}}
      if(P.mode==='orbit'){
        const pl=planets[P.pi];P.rad+=(pl.ringR-P.rad)*(1-Math.exp(-s*9));P.ang+=P.dir*(v/P.rad)*s;sync();
      }else{
        P.x+=P.vx*s;P.y+=P.vy*s;P.tFly+=s;
        for(let j=Math.max(0,P.pi-3);j<planets.length;j++){
          const pl=planets[j];if(j===P.from&&P.tFly<.4)continue;
          const dx=P.x-pl.x,dy=P.y-pl.y,d=Math.hypot(dx,dy);
          if(d<pl.r+.1){die();return}
          if(d<pl.ringR+.45){capture(j,dx,dy,d);break}
        }
        if(state==='running'&&(P.y<camY-6.4||P.x<-1.2||P.x>11.2||P.tFly>3.2)){die();return}
      }
      for(const k of pickups)if(!k.got&&Math.abs(k.y-P.y)<1&&Math.hypot(k.x-P.x,k.y-P.y)<.42){
        k.got=true;stars++;score+=25;pops.push({x:k.x,y:k.y+.3,txt:'+25',life:.9,max:.9,c:'#f0cb7a'});burst(k.x,k.y,'#f0cb7a',16);tone(988,.1,'triangle',.05);tone(1319,.14,'triangle',.05,.07);buzz(14);hud();
      }
      const hitR=.43;
      for(const m of mines)if(Math.abs(m.y-P.y)<1&&Math.hypot(m.x-P.x,m.y-P.y)<hitR){die();return}
      for(let j=Math.max(0,P.pi-3);j<planets.length;j++){const o=planets[j].om;if(o&&Math.hypot(o.x-P.x,o.y-P.y)<hitR){die();return}}
      if(opts.trail){P.trail.push([P.x,P.y]);if(P.trail.length>26)P.trail.shift()}
    }
    for(const m of mines)m.a+=s*1.4;
    camY+=(Math.max(reachY,P.y)-camY)*(1-Math.exp(-s*3.2));
    for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx*s;p.y+=p.vy*s;p.vx*=.95;p.vy*=.95;p.life-=s;if(p.life<=0)parts.splice(i,1)}
    for(let i=pops.length-1;i>=0;i--){pops[i].life-=s;pops[i].y+=s*.7;if(pops[i].life<=0)pops.splice(i,1)}
    if(shake>0)shake=Math.max(0,shake-s/.4);
    if(flash>0)flash=Math.max(0,flash-s/.45);
  }

  /* ----- draw ----- */
  function resize(){
    const r=wrap.getBoundingClientRect();if(!r.width)return;
    W=r.width;dpr=Math.min(2,window.devicePixelRatio||1);u=W/10;
    cv.width=cv.height=Math.round(W*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function drawStar(x,y,r,rot){
    ctx.beginPath();
    for(let i=0;i<10;i++){const a=rot-1.5708+i*.6283,rad=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad)}
    ctx.closePath();ctx.fill();
  }
  function draw(now){
    if(!W||!P)return;
    const base=W*.7,SX=x=>x*u,SY=y=>base-(y-camY)*u;
    ctx.save();
    if(shake>0)ctx.translate((Math.random()-.5)*10*shake,(Math.random()-.5)*10*shake);
    const g=ctx.createLinearGradient(0,0,0,W);g.addColorStop(0,'#0a1218');g.addColorStop(1,'#101c26');
    ctx.fillStyle=g;ctx.fillRect(-12,-12,W+24,W+24);
    for(let layer=0;layer<3;layer++){
      const par=.12+layer*.16,n=26;
      ctx.fillStyle='rgba(200,225,240,'+(.25+layer*.18)+')';
      for(let i=0;i<n;i++){
        const x=hs(i+layer*100)*W,y0=hs(i*3+layer*50+7)*W;
        const y=((y0+camY*u*par)%W+W)%W,sz=1+layer*.7;
        ctx.fillRect(x,y,sz,sz);
      }
    }
    for(let j=0;j<planets.length;j++){
      const pl=planets[j],X=SX(pl.x),Y=SY(pl.y);
      if(Y<-3*u||Y>W+3*u)continue;
      const cur=j===P.pi&&P.mode==='orbit';
      ctx.save();ctx.lineWidth=cur?2.5:1.6;ctx.strokeStyle=cur?'rgba(127,214,168,.75)':'rgba(240,203,122,.28)';
      ctx.setLineDash([u*.1,u*.16]);ctx.lineDashOffset=-now/90;
      ctx.beginPath();ctx.arc(X,Y,pl.ringR*u,0,6.2832);ctx.stroke();ctx.restore();
      ctx.save();ctx.shadowColor='hsl('+pl.h+' 50% 50%)';ctx.shadowBlur=u*.5;
      const gr=ctx.createRadialGradient(X-pl.r*u*.35,Y-pl.r*u*.35,pl.r*u*.1,X,Y,pl.r*u);
      gr.addColorStop(0,'hsl('+pl.h+' 40% 62%)');gr.addColorStop(.6,'hsl('+pl.h+' 32% 36%)');gr.addColorStop(1,'hsl('+pl.h+' 36% 18%)');
      ctx.fillStyle=gr;ctx.beginPath();ctx.arc(X,Y,pl.r*u,0,6.2832);ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(0,0,0,.18)';
      for(let c=0;c<3;c++){const a=pl.spin+c*2.1+now/9000;ctx.beginPath();ctx.arc(X+Math.cos(a)*pl.r*u*.45,Y+Math.sin(a)*pl.r*u*.4,pl.r*u*(.12+c*.03),0,6.2832);ctx.fill()}
      if(pl.visited&&j>0){ctx.fillStyle='rgba(127,214,168,.9)';ctx.beginPath();ctx.arc(X,Y,u*.07,0,6.2832);ctx.fill()}
    }
    for(const k of pickups){
      if(k.got)continue;const Y=SY(k.y);if(Y<-u||Y>W+u)continue;
      ctx.save();ctx.shadowColor='#f0cb7a';ctx.shadowBlur=u*.4;ctx.fillStyle='#f0cb7a';drawStar(SX(k.x),Y,u*.26*(1+Math.sin(now/280+k.x)*.08),now/900);ctx.restore();
    }
    const drawMine=(x,y,a)=>{
      const X=SX(x),Y=SY(y);if(Y<-u||Y>W+u)return;
      ctx.save();ctx.translate(X,Y);ctx.rotate(a);ctx.shadowColor='#f09a8a';ctx.shadowBlur=u*.4;ctx.fillStyle='#f09a8a';
      ctx.beginPath();for(let i=0;i<16;i++){const an=i*.3927,rr=i%2?u*.16:u*.3;ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}
      ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#0c1318';ctx.beginPath();ctx.arc(0,0,u*.08,0,6.2832);ctx.fill();ctx.restore();
    };
    for(const m of mines)drawMine(m.x,m.y,m.a);
    for(const pl of planets)if(pl.om)drawMine(pl.om.x,pl.om.y,now/300);
    if(opts.trail&&P.trail.length>1){
      for(let i=0;i<P.trail.length;i++){const q=P.trail[i],k=(i+1)/P.trail.length;
        ctx.fillStyle='rgba(127,214,168,'+(k*.3)+')';ctx.beginPath();ctx.arc(SX(q[0]),SY(q[1]),u*.16*k,0,6.2832);ctx.fill()}
    }
    if(opts.aim&&P.mode==='orbit'&&state!=='over'){
      ctx.save();ctx.strokeStyle='rgba(240,203,122,.45)';ctx.lineWidth=2;ctx.setLineDash([u*.12,u*.2]);ctx.lineDashOffset=-now/40;
      ctx.beginPath();ctx.moveTo(SX(P.x),SY(P.y));ctx.lineTo(SX(P.x+P.vx*5.2),SY(P.y+P.vy*5.2));ctx.stroke();ctx.restore();
    }
    if(state!=='over'){
      const X=SX(P.x),Y=SY(P.y);
      ctx.save();ctx.shadowColor='#7fd6a8';ctx.shadowBlur=u*.55;
      const pg=ctx.createRadialGradient(X-u*.05,Y-u*.05,u*.02,X,Y,u*.18);pg.addColorStop(0,'#e6fff3');pg.addColorStop(1,'#58d39b');
      ctx.fillStyle=pg;ctx.beginPath();ctx.arc(X,Y,u*.18,0,6.2832);ctx.fill();ctx.restore();
    }
    for(const p of parts){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(SX(p.x),SY(p.y),u*.07*(.4+p.life/p.max),0,6.2832);ctx.fill()}
    ctx.globalAlpha=1;ctx.textAlign='center';ctx.font='700 '+Math.round(u*.34)+'px "IBM Plex Sans Arabic","JetBrains Mono",sans-serif';
    for(const p of pops){ctx.globalAlpha=Math.max(0,Math.min(1,p.life/p.max*1.6));ctx.fillStyle=p.c;ctx.fillText(p.txt,SX(p.x),SY(p.y))}
    ctx.globalAlpha=1;
    if(flash>0){ctx.fillStyle='rgba(240,154,138,'+(flash*.3)+')';ctx.fillRect(-12,-12,W+24,W+24)}
    ctx.restore();
  }
  function frame(ts){
    if(!on){raf=0;return}
    raf=requestAnimationFrame(frame);
    const dt=Math.min(50,last?ts-last:16.7);last=ts;
    update(dt);draw(ts);frames++;
    if(!fpsT)fpsT=ts;
    if(ts-fpsT>500){if(opts.fps)$('#orFps').textContent=Math.round(frames*1000/(ts-fpsT))+' FPS';frames=0;fpsT=ts}
  }

  /* ----- input ----- */
  window.addEventListener('keydown',e=>{
    if(!on||drawerOpen()||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key===' '||e.key==='Enter'||e.key==='ArrowUp'||e.key==='w'||e.key==='W'){
      e.preventDefault();
      if(state==='running'||state==='ready')launch();else toggle();
    }else if(e.key==='p'||e.key==='P'||e.key==='Escape'){e.preventDefault();if(state==='running')pause();else if(state==='paused')resume()}
  });
  wrap.addEventListener('pointerdown',e=>{if(e.target.closest('.ov'))return;e.preventDefault();launch()});
  $('#orLaunch').addEventListener('pointerdown',e=>{e.preventDefault();launch()});
  $('#orLaunch').addEventListener('click',e=>{if(e.detail===0)launch()});
  $('#orBtn').addEventListener('click',toggle);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(wrap);
  window.addEventListener('resize',resize);
  bindOpts('orbit',opts,k=>{if(k==='fps'){$('#orFps').hidden=!opts.fps}else if(k==='aim'||k==='trail'||k==='haptic'){}else reset()});
  document.addEventListener('langchange',()=>{if(P&&!ov.hidden)overlay(ovKind)});
  $('#orFps').hidden=!opts.fps;
  reset();
  return{pause,active(v){
    on=v;
    if(v){resize();last=0;fpsT=0;frames=0;if(!raf)raf=requestAnimationFrame(frame)}
    else{pause();if(raf)cancelAnimationFrame(raf);raf=0}
  }};
})();

/* ---------- arcade kit: one framework for the extra games ---------- */
const EXTRA={};
let ARC_CSS='';
function arcade(def){
  const id=def.id,pair=p=>lang==='ar'?p[0]:p[1];
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  const lbl=p=>'<span data-ar="'+esc(p[0])+'" data-en="'+esc(p[1])+'">'+esc(pair(p))+'</span>';
  const opts=Object.assign({fps:true,haptic:true,dpad:COARSE},def.opts||{},store.get(id+'-opts',{}));
  if(def.css)ARC_CSS+=def.css+'\n';
  /* home card */
  const card=document.createElement('a');card.className='gcard';card.href='#'+id;
  card.style.cssText='--c:var(--'+def.color+');--ca:color-mix(in srgb,var(--'+def.color+') 16%,transparent)';
  card.innerHTML='<div class="prev"><svg class="pv" viewBox="0 0 260 150" aria-hidden="true">'+def.preview+'</svg></div><div class="gbody"><h2 class="gname">'+lbl(def.n)+'</h2><p class="gdesc">'+lbl(def.d)+'</p><p class="meta" id="meta-'+id+'"></p><span class="go"><i><svg class="flip" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></i><span data-i18n="play"></span></span></div>';
  $('.cards').appendChild(card);
  /* screen */
  const hudT=[def.hud0||['النقاط','Score'],def.hud1||['الأفضل','Best'],def.hud2||['—','—']];
  const ui=(def.ui||[]).map(o=>o.type==='seg'
    ?'<div class="og"><span class="og-l">'+lbl(o.l)+'</span><div class="seg" data-game="'+id+'" data-opt="'+o.k+'">'+o.v.map(v=>'<button data-v="'+v[0]+'">'+lbl(v[1])+'</button>').join('')+'</div></div>'
    :'<div class="trow">'+lbl(o.l)+'<button class="tgl" data-game="'+id+'" data-opt="'+o.k+'" role="switch" aria-checked="true" aria-label="'+esc(pair(o.l))+'"></button></div>').join('');
  const tg=(k,key)=>'<div class="trow"><span data-i18n="'+key+'"></span><button class="tgl" data-game="'+id+'" data-opt="'+k+'" role="switch" aria-checked="true" data-i18n-aria="'+key+'"></button></div>';
  const sec=document.createElement('section');sec.id=id;sec.className='screen arc-scr';sec.hidden=true;
  sec.style.setProperty('--acc','var(--'+def.color+')');
  sec.innerHTML='<div class="imm-grid"><div class="hud">'+hudT.map((p,i)=>'<div class="sb"><div class="top up">'+lbl(p)+'</div><div class="num" id="'+id+'-h'+i+'">0</div></div>').join('')+'</div>'+
    '<div class="arena"><div class="cv-wrap fit" id="'+id+'-wrap">'+(def.dom?'':'<canvas id="'+id+'-cv"></canvas>')+
    '<div class="tl"><div class="status-chip combo" id="'+id+'-chip" hidden></div></div><div class="fps" id="'+id+'-fps" hidden>60 FPS</div>'+
    '<div class="ov" id="'+id+'-ov"><div><h2></h2><p></p><div class="big" hidden></div><button class="btn primary"></button></div></div></div></div>'+
    '<div class="row mid"><button class="btn" data-a="pause" data-i18n="pause"></button><button class="btn" data-a="restart" data-i18n="restart"></button>'+
    (def.buttons||[]).map((b,i)=>'<button class="btn" data-a="x'+i+'">'+lbl(b.t)+'</button>').join('')+'</div>'+
    (def.dpad?'<div class="dpad"><button class="u" data-d="up" aria-label="Up"><svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg></button><button class="l" data-d="left" aria-label="Left"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button><button class="d" data-d="down" aria-label="Down"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button><button class="r" data-d="right" aria-label="Right"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button></div>':'')+'</div>'+
    '<aside class="drawer"><div class="dh"><h3 data-i18n="options"></h3><button class="icon-btn" data-close data-i18n-aria="close" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'+ui+
    (def.dpad?tg('dpad','opt_dpad'):'')+tg('haptic','opt_haptic')+tg('fps','opt_fps')+
    (def.note?'<p class="note">'+lbl(def.note)+'</p>':'')+'</aside>';
  $('main').appendChild(sec);
  const wrap=$('#'+id+'-wrap'),cv=def.dom?null:$('#'+id+'-cv'),ctx=cv?cv.getContext('2d'):null,ov=$('#'+id+'-ov'),chipEl=$('#'+id+'-chip');
  let state='ready',on=false,raf=0,last=0,frames=0,fpsT=0,W=0,dpr=1,score=0,best=0,newBest=false,ovKind='ready',ovTimer=0,game=null,chipTxt=null;
  const bestKey=()=>id+'-best'+(def.bestSuffix?def.bestSuffix(opts):'');
  const hudScore=()=>{
    $('#'+id+'-h0').textContent=score;
    $('#'+id+'-h1').textContent=def.lower?(best||'–'):Math.max(best,score);
  };
  const api={opts,el:wrap,tone,confetti,rnd,store,
    get W(){return W},get ctx(){return ctx},get state(){return state},get score(){return score},
    setScore(v){if(v!==score){score=v;hudScore()}},addScore(n){api.setScore(score+n)},
    hud2(v){const e=$('#'+id+'-h2');if(e.textContent!==String(v))e.textContent=v},
    chip(txt){if(txt===chipTxt)return;chipTxt=txt;chipEl.hidden=!txt;if(txt)chipEl.textContent=txt},
    buzz(ms){if(opts.haptic&&navigator.vibrate){try{navigator.vibrate(ms)}catch(e){}}},
    start,over};
  function overlay(k){
    ovKind=k;ov.hidden=false;
    const h=$('h2',ov),p=$('p',ov),big=$('.big',ov),btn=$('.btn',ov);big.hidden=true;
    if(k==='ready'){h.textContent=pair(def.n);p.textContent=pair(def.how);btn.textContent=t('start')}
    else if(k==='paused'){h.textContent=t('paused');p.textContent=t('paused_sub');btn.textContent=t('resume')}
    else{h.textContent=def.overT?pair(def.overT):t('over');p.textContent=newBest?t('newbest'):t('yourscore');big.hidden=false;big.textContent=def.fmtScore?def.fmtScore(score):score;btn.textContent=t('again')}
    btn.focus({preventScroll:true});
  }
  function resize(){
    const r=wrap.getBoundingClientRect();if(!r.width)return;
    W=r.width;
    if(ctx){dpr=Math.min(3,Math.max(2,window.devicePixelRatio||1));cv.width=cv.height=Math.round(W*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
    if(game&&game.resize)game.resize(W);
  }
  function reset(){
    clearTimeout(ovTimer);score=0;newBest=false;best=store.get(bestKey(),0);state='ready';chipTxt=null;api.chip(null);
    resize();game.reset();hudScore();overlay('ready');
  }
  function start(){if(state!=='ready')return;state='running';ov.hidden=true;last=0;tone(440,.08,'triangle',.05);tone(660,.1,'triangle',.05,.08)}
  function pause(){if(state==='running'){state='paused';overlay('paused')}}
  function resume(){if(state==='paused'){state='running';ov.hidden=true;last=0}}
  function toggle(){if(state==='running')pause();else if(state==='paused')resume();else if(state==='ready')start();else if(state==='over')reset(),start()}
  function over(){
    if(state!=='running')return;state='over';
    if(def.lower){if(score>0&&(!best||score<best)){best=score;newBest=true;store.set(bestKey(),best)}}
    else if(score>best){best=score;newBest=score>0;store.set(bestKey(),best)}
    hudScore();clearTimeout(ovTimer);
    ovTimer=setTimeout(()=>{if(state==='over'){overlay('over');if(newBest||def.winConfetti)confetti()}},def.overDelay||650);
  }
  function view(){$('.dpad',sec)&&($('.dpad',sec).hidden=!opts.dpad);$('#'+id+'-fps').hidden=!opts.fps}
  function frame(ts){
    if(!on){raf=0;return}
    raf=requestAnimationFrame(frame);
    const dt=Math.min(50,last?ts-last:16.7);last=ts;
    if(state==='running')game.update(dt/1000,ts);else if(game.fx)game.fx(dt/1000);
    if(game.draw)game.draw(ts);
    frames++;if(!fpsT)fpsT=ts;
    if(ts-fpsT>500){if(opts.fps)$('#'+id+'-fps').textContent=Math.round(frames*1000/(ts-fpsT))+' FPS';frames=0;fpsT=ts}
  }
  /* input */
  window.addEventListener('keydown',e=>{
    if(!on||drawerOpen()||e.ctrlKey||e.metaKey||e.altKey)return;
    if((state==='running'||state==='ready')&&game.key&&game.key(e,'down')){e.preventDefault();if(state==='ready')start();return}
    const k=e.key;
    if(k==='p'||k==='P'||k==='Escape'){e.preventDefault();if(state==='running')pause();else if(state==='paused')resume();return}
    if((k===' '||k==='Enter')&&state!=='running'){e.preventDefault();toggle()}
  });
  window.addEventListener('keyup',e=>{if(on&&state==='running'&&game.key)game.key(e,'up')});
  const ptr=(type,e)=>{
    if(!game.pointer||e.target.closest('.ov'))return;
    if(type==='down'){if(state==='ready')start();try{wrap.setPointerCapture(e.pointerId)}catch(x){}}
    if(state!=='running')return;
    const r=wrap.getBoundingClientRect();game.pointer(type,e.clientX-r.left,e.clientY-r.top,e);
  };
  if(game===null&&!def.dom){['down','move','up'].forEach(n=>wrap.addEventListener('pointer'+n,e=>ptr(n,e)));wrap.addEventListener('pointercancel',e=>ptr('up',e))}
  $('.btn',ov).addEventListener('click',toggle);
  $$('.row .btn',sec).forEach(b=>b.addEventListener('click',()=>{
    const a=b.dataset.a;
    if(a==='pause'){if(state==='running')pause();else if(state==='paused')resume()}
    else if(a==='restart')reset();
    else if(a&&a[0]==='x'){if(state==='ready')start();if(state==='running'){const f=def.buttons[Number(a.slice(1))].fn;game[f]&&game[f]()}}
  }));
  const DM={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  $$('.dpad button',sec).forEach(b=>{
    const go=()=>{if(state==='ready')start();if(state==='running'&&game.dir){const m=DM[b.dataset.d];game.dir(m[0],m[1])}};
    b.addEventListener('pointerdown',e=>{e.preventDefault();go()});
    b.addEventListener('click',e=>{if(e.detail===0)go()});
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(wrap);
  window.addEventListener('resize',resize);
  game=def.make(api);
  bindOpts(id,opts,k=>{
    if(k==='fps'||k==='haptic'||k==='dpad'){view();return}
    if(game.onOpt&&game.onOpt(k)===true)return;
    reset();
  });
  document.addEventListener('langchange',()=>{
    $$('[data-ar]',sec).concat($$('[data-ar]',card)).forEach(e=>{e.textContent=lang==='ar'?e.dataset.ar:e.dataset.en});
    if(!ov.hidden)overlay(ovKind);
    if(game.onLang)game.onLang();
  });
  view();reset();
  EXTRA[id]={
    pause,title:()=>pair(def.n),
    meta(){
      const b=store.get(bestKey(),0);
      $('#meta-'+id).textContent=(def.metaL?pair(def.metaL):(lang==='ar'?'أفضل نتيجة ':'Best '))+(b?(def.fmtMeta?def.fmtMeta(b):b):'–');
    },
    active(v){
      on=v;
      if(v){resize();last=0;fpsT=0;frames=0;if(!raf)raf=requestAnimationFrame(frame)}
      else{pause();if(raf)cancelAnimationFrame(raf);raf=0}
    }
  };
}

/* ================= 1. Bricks ================= */
arcade({
  id:'bricks',color:'coral',n:['الطوب','Bricks'],
  d:['اكسر كل الطوب بالكرة والتقط الهدايا المتساقطة.','Smash every brick and catch the falling power-ups.'],
  how:['حرّك المضرب بإصبعك أو الماوس أو الأسهم. اضغط لإطلاق الكرة.','Drag, use the mouse or the arrow keys. Tap to launch the ball.'],
  hud2:['الأرواح','Lives'],opts:{speed:'normal',lives:3,power:true},
  ui:[
    {type:'seg',k:'speed',l:['السرعة','Speed'],v:[['slow',['هادئ','Chill']],['normal',['عادي','Normal']],['fast',['سريع','Fast']]]},
    {type:'seg',k:'lives',l:['الأرواح','Lives'],v:[['3',['3','3']],['5',['5','5']]]},
    {type:'tgl',k:'power',l:['هدايا من الطوب','Power-ups']}],
  note:['هدايا: W مضرب أعرض، S كرة أبطأ، M ثلاث كرات، + روح إضافية.','Power-ups: W wider paddle, S slower ball, M three balls, + extra life.'],
  preview:'<g fill="#f09a8a"><rect x="40" y="22" width="34" height="14" rx="4"/><rect x="113" y="22" width="34" height="14" rx="4" fill="#f0cb7a"/><rect x="186" y="22" width="34" height="14" rx="4" fill="#7fd6a8"/><rect x="40" y="42" width="34" height="14" rx="4" fill="#86c3e6"/><rect x="113" y="42" width="34" height="14" rx="4" fill="#b9a8ec"/><rect x="186" y="42" width="34" height="14" rx="4" fill="#e6a0c4"/></g><rect x="90" y="128" width="64" height="9" rx="4.5" fill="#e7eef1"/><circle cx="128" cy="96" r="6" fill="#f09a8a"><animate attributeName="cy" values="118;70;118" dur="1.6s" repeatCount="indefinite"/></circle>',
  make(api){
    const o=api.opts,SPD={slow:46,normal:58,fast:72},COL=['#f09a8a','#f0cb7a','#7fd6a8','#86c3e6','#b9a8ec','#e6a0c4','#6fd0d0','#e3b98a'];
    const tr=(a,b)=>lang==='ar'?a:b;
    let paddle,balls,bricks,drops,parts,lives,level,stuck,keys,targetX,wideT,slowT,chipT,trail;
    function build(){
      bricks=[];const rows=Math.min(8,3+level),cols=10,bw=8.2,bh=3.8,gx=.9,x0=(100-(cols*bw+(cols-1)*gx))/2;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        if(level>1&&(r+c)%7===3)continue;
        const hp=(level>1&&r<Math.min(2,level-1))?2:1;
        bricks.push({x:x0+c*(bw+gx),y:12+r*(bh+gx),w:bw,h:bh,hp,max:hp,col:COL[(r+level)%COL.length]});
      }
    }
    const curSpeed=()=>SPD[o.speed]*(1+Math.min(.5,(level-1)*.05))*(slowT>0?.72:1);
    const newBall=()=>({x:paddle.x,y:92.4,vx:0,vy:0,r:1.5});
    function burst(x,y,c,n=8){for(let i=0;i<n;i++){const a=Math.random()*6.283,sp=8+Math.random()*22;parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.55,max:.55,c})}}
    function launch(){
      if(!stuck)return;stuck=false;const sp=curSpeed(),a=(Math.random()-.5)*.6;
      balls[0].vx=sp*Math.sin(a);balls[0].vy=-sp*Math.cos(a);api.tone(520,.08,'triangle',.05);
    }
    function loseBall(){
      lives--;api.hud2(lives);api.buzz(50);api.tone(200,.3,'sawtooth',.05,0,-120);
      if(lives<=0){api.over();return}
      stuck=true;balls=[newBall()];wideT=0;
    }
    function nextLevel(){
      level++;build();stuck=true;balls=[newBall()];drops=[];chipT=1.8;
      api.chip(tr('المستوى ','Level ')+level);[523,659,784].forEach((f,k)=>api.tone(f,.15,'triangle',.06,k*.09));
    }
    function power(type){
      if(type==='wide')wideT=10;else if(type==='slow')slowT=8;
      else if(type==='life'){lives=Math.min(9,lives+1);api.hud2(lives)}
      else if(type==='multi'&&!stuck){
        const b=balls[0],sp=Math.hypot(b.vx,b.vy)||curSpeed(),a0=Math.atan2(b.vx,-b.vy);
        for(const d of[-.45,.45]){const a=a0+d;balls.push({x:b.x,y:b.y,vx:sp*Math.sin(a),vy:-sp*Math.cos(a),r:1.5})}
      }
      api.tone(880,.1,'triangle',.06);api.tone(1175,.14,'triangle',.05,.07);api.buzz(15);
    }
    return{
      reset(){
        lives=o.lives;level=1;build();paddle={x:50,w:18};targetX=50;stuck=true;balls=[newBall()];drops=[];parts=[];trail=[];
        wideT=0;slowT=0;chipT=0;keys={l:0,r:0};api.hud2(lives);
      },
      update(s){
        const k=keys.r-keys.l;if(k)targetX+=k*100*s;
        const pw=wideT>0?28:18;paddle.w+=(pw-paddle.w)*(1-Math.exp(-s*10));
        targetX=Math.max(paddle.w/2,Math.min(100-paddle.w/2,targetX));
        paddle.x+=(targetX-paddle.x)*(1-Math.exp(-s*32));
        wideT-=s;slowT-=s;
        if(chipT>0){chipT-=s;if(chipT<=0)api.chip(null)}else api.chip(stuck?tr('اضغط للإطلاق','Tap to launch'):null);
        if(stuck){balls[0].x=paddle.x;balls[0].y=92.4}
        else{
          const sp=curSpeed();
          for(let bi=balls.length-1;bi>=0;bi--){
            const b=balls[bi],n=Math.max(1,Math.ceil(sp*s));
            const m=Math.hypot(b.vx,b.vy)||1;b.vx*=sp/m;b.vy*=sp/m;
            let dead=false;
            for(let i=0;i<n&&!dead;i++){
              b.x+=b.vx*s/n;b.y+=b.vy*s/n;
              if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)}else if(b.x>100-b.r){b.x=100-b.r;b.vx=-Math.abs(b.vx)}
              if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy)}
              if(b.vy>0&&b.y+b.r>=94&&b.y<96.5&&b.x>=paddle.x-paddle.w/2-b.r*.6&&b.x<=paddle.x+paddle.w/2+b.r*.6){
                const hit=Math.max(-1,Math.min(1,(b.x-paddle.x)/(paddle.w/2))),a=hit*1.05;
                b.vx=sp*Math.sin(a);b.vy=-sp*Math.cos(a);b.y=94-b.r;api.tone(400+Math.abs(hit)*120,.05,'triangle',.04);
              }
              for(let j=0;j<bricks.length;j++){
                const br=bricks[j],cx=Math.max(br.x,Math.min(b.x,br.x+br.w)),cy=Math.max(br.y,Math.min(b.y,br.y+br.h)),dx=b.x-cx,dy=b.y-cy;
                if(dx*dx+dy*dy<b.r*b.r){
                  if(Math.abs(dx)>Math.abs(dy)){b.vx=(dx>0?1:-1)*Math.abs(b.vx);b.x+=dx>0?.3:-.3}
                  else{b.vy=(dy>0?1:-1)*Math.abs(b.vy);b.y+=dy>0?.3:-.3}
                  br.hp--;
                  if(br.hp<=0){
                    bricks.splice(j,1);api.addScore(10*br.max*level);burst(br.x+br.w/2,br.y+br.h/2,br.col);
                    api.tone(600+Math.random()*200,.06,'triangle',.05);api.buzz(6);
                    if(o.power&&Math.random()<.16)drops.push({x:br.x+br.w/2,y:br.y+br.h/2,type:rnd(['wide','slow','multi','life'])});
                  }else api.tone(300,.05,'square',.03);
                  break;
                }
              }
              if(b.y>104){dead=true}
            }
            if(dead){balls.splice(bi,1)}
          }
          if(!balls.length)loseBall();
          const lb=balls[0];if(lb){trail.push([lb.x,lb.y]);if(trail.length>9)trail.shift()}
        }
        for(let i=drops.length-1;i>=0;i--){
          const d=drops[i];d.y+=24*s;
          if(d.y>92&&d.y<97&&Math.abs(d.x-paddle.x)<paddle.w/2+2){power(d.type);drops.splice(i,1)}
          else if(d.y>106)drops.splice(i,1);
        }
        if(!bricks.length&&state_ok())nextLevel();
        this.fx(s);
      },
      fx(s){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx*s;p.y+=p.vy*s;p.vx*=.96;p.vy*=.96;p.life-=s;if(p.life<=0)parts.splice(i,1)}},
      draw(){
        const c=api.ctx,W=api.W;if(!W)return;const u=W/100;
        const g=c.createLinearGradient(0,0,0,W);g.addColorStop(0,'#0e171e');g.addColorStop(1,'#12202a');c.fillStyle=g;c.fillRect(0,0,W,W);
        for(const b of bricks){
          const gr=c.createLinearGradient(0,b.y*u,0,(b.y+b.h)*u);gr.addColorStop(0,b.col);gr.addColorStop(1,'rgba(0,0,0,.35)');
          c.fillStyle=b.col;c.beginPath();c.roundRect(b.x*u,b.y*u,b.w*u,b.h*u,u*.8);c.fill();
          c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.roundRect(b.x*u,(b.y+b.h*.55)*u,b.w*u,b.h*.45*u,u*.8);c.fill();
          if(b.hp>1){c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=u*.35;c.beginPath();c.roundRect(b.x*u+1,b.y*u+1,b.w*u-2,b.h*u-2,u*.7);c.stroke()}
        }
        c.save();c.shadowColor='#e7eef1';c.shadowBlur=u*2;c.fillStyle='#e7eef1';c.beginPath();c.roundRect((paddle.x-paddle.w/2)*u,94*u,paddle.w*u,2.4*u,u*1.2);c.fill();c.restore();
        for(let i=0;i<trail.length;i++){c.fillStyle='rgba(240,154,138,'+(i/trail.length*.25)+')';c.beginPath();c.arc(trail[i][0]*u,trail[i][1]*u,1.4*u*(i/trail.length),0,6.2832);c.fill()}
        for(const b of balls){c.save();c.shadowColor='#f09a8a';c.shadowBlur=u*2.4;c.fillStyle='#ffe9e3';c.beginPath();c.arc(b.x*u,b.y*u,b.r*u,0,6.2832);c.fill();c.restore()}
        c.textAlign='center';c.textBaseline='middle';c.font='700 '+(u*2.4)+'px JetBrains Mono,monospace';
        for(const d of drops){
          const col={wide:'#86c3e6',slow:'#7fd6a8',multi:'#f0cb7a',life:'#f09a8a'}[d.type];
          c.fillStyle=col;c.beginPath();c.roundRect((d.x-3)*u,(d.y-1.8)*u,6*u,3.6*u,u*1.8);c.fill();
          c.fillStyle='#0c1318';c.fillText({wide:'W',slow:'S',multi:'M',life:'+'}[d.type],d.x*u,d.y*u+u*.1);
        }
        for(const p of parts){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.c;c.fillRect(p.x*u-u*.5,p.y*u-u*.5,u,u)}
        c.globalAlpha=1;
      },
      key(e,t){
        const k=e.key;
        if(k==='ArrowLeft'||k==='a'||k==='A'){keys.l=t==='down'?1:0;return true}
        if(k==='ArrowRight'||k==='d'||k==='D'){keys.r=t==='down'?1:0;return true}
        if((k===' '||k==='ArrowUp')&&t==='down'){launch();return true}
        return false;
      },
      pointer(t,x,y){targetX=x/api.W*100;if(t==='down')launch()},
      dir(){},
      launch
    };
    function state_ok(){return api.state==='running'}
  }
});

/* ================= 2. Dash runner ================= */
arcade({
  id:'runner',color:'teal',n:['العدّاء','Dash'],
  d:['اركض واقفز فوق البلورات وانحنِ تحت الطائرات.','Run, jump the crystals and duck under the drones.'],
  how:['اضغط للقفز، واسحب للأسفل أو اضغط السهم السفلي للانحناء.','Tap to jump. Swipe down or press the down arrow to duck.'],
  hud2:['الكرات','Orbs'],opts:{speed:'normal',dbl:false},
  ui:[
    {type:'seg',k:'speed',l:['السرعة','Speed'],v:[['slow',['هادئ','Chill']],['normal',['عادي','Normal']],['fast',['سريع','Fast']]]},
    {type:'tgl',k:'dbl',l:['قفزة مزدوجة','Double jump']}],
  note:['اضغط مطولاً لقفزة أعلى. التقط الكرات الذهبية لنقاط إضافية.','Hold for a higher jump. Collect golden orbs for bonus points.'],
  preview:'<path d="M0 118H260" stroke="#6fd0d0" stroke-opacity=".5" stroke-width="2"/><path d="M0 100 L40 70 L80 100 L130 62 L180 100 L220 76 L260 100V118H0Z" fill="#1d3a42" opacity=".6"/><rect x="60" y="86" width="20" height="30" rx="7" fill="#6fd0d0"><animate attributeName="y" values="86;40;86" dur="1.4s" repeatCount="indefinite"/></rect><path d="M170 118 L176 96 L182 118Z M196 118 L204 84 L212 118Z" fill="#86c3e6"/><circle cx="230" cy="60" r="6" fill="#f0cb7a"/>',
  make(api){
    const o=api.opts,BASE={slow:32,normal:40,fast:50},G=78,tr=(a,b)=>lang==='ar'?a:b;
    let p,obs,orbs,parts,speed,spawnLeft,dist,orbN,t,held,duck,air,gx,dead;
    function dust(x,y,n=5){for(let i=0;i<n;i++)parts.push({x,y,vx:-10-Math.random()*18,vy:-Math.random()*14,life:.4,max:.4,c:'rgba(200,225,230,.7)'})}
    function spawn(){
      const r=Math.random(),far=dist>180;
      if(far&&r<.26)obs.push({type:'drone',x:106,y:66,w:8,h:6});
      else if(r<.58)obs.push({type:'small',x:106,y:G-6,w:4.5,h:6});
      else if(r<.82)obs.push({type:'tall',x:106,y:G-11,w:4.5,h:11});
      else obs.push({type:'double',x:106,y:G-6,w:11,h:6});
      if(Math.random()<.4)orbs.push({x:112+Math.random()*10,y:G-6-Math.random()*16,got:false});
      spawnLeft=26+Math.random()*24+speed*.3;
    }
    function jump(){
      if(p.onG){p.vy=-82;p.onG=false;air=o.dbl?1:0;api.tone(420,.1,'sine',.05,0,380);dust(p.x,G,6)}
      else if(air>0){air--;p.vy=-76;api.tone(560,.1,'sine',.05,0,380)}
      held=true;
    }
    return{
      reset(){
        p={x:18,y:G-9,vy:0,onG:true,w:7,h:9};obs=[];orbs=[];parts=[];speed=BASE[o.speed];spawnLeft=50;dist=0;orbN=0;t=0;held=false;duck=false;air=0;gx=0;dead=false;api.hud2(0);
      },
      update(s){
        t+=s;speed=Math.min(BASE[o.speed]*2.1,BASE[o.speed]+dist*.012);dist+=speed*s;gx=(gx+speed*s)%12;
        spawnLeft-=speed*s;if(spawnLeft<=0)spawn();
        const h=(duck&&p.onG)?5:9;p.h=h;
        if(!p.onG){
          p.vy+=(duck?420:230)*s;if(!held&&p.vy<-35)p.vy=-35;
          p.y+=p.vy*s;
          if(p.y>=G-h){p.y=G-h;p.vy=0;p.onG=true;dust(p.x+3,G,5)}
        }else p.y=G-h;
        for(const ob of obs)ob.x-=speed*s;
        for(const ob of orbs)ob.x-=speed*s;
        while(obs.length&&obs[0].x<-14)obs.shift();
        while(orbs.length&&orbs[0].x<-6)orbs.shift();
        const px=p.x+1,py=p.y+1,pw=p.w-2,ph=p.h-1.5;
        for(const ob of obs){
          const ox=ob.x+.9,oy=ob.y+.9,ow=ob.w-1.8,oh=ob.h-1.2;
          if(px<ox+ow&&px+pw>ox&&py<oy+oh&&py+ph>oy){
            dead=true;api.buzz(60);api.tone(220,.35,'sawtooth',.05,0,-150);for(let i=0;i<20;i++){const a=Math.random()*6.283,sp=10+Math.random()*30;parts.push({x:p.x+3,y:p.y+4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.7,max:.7,c:'#6fd0d0'})}
            api.over();return;
          }
        }
        for(const ob of orbs)if(!ob.got&&Math.hypot(ob.x-(p.x+3.5),ob.y-(p.y+p.h/2))<5){ob.got=true;orbN++;api.hud2(orbN);api.tone(988,.08,'triangle',.05);api.buzz(8)}
        api.setScore(Math.floor(dist/5)+orbN*5);
        if(p.onG&&Math.random()<.35)parts.push({x:p.x,y:G,vx:-12,vy:-Math.random()*6,life:.3,max:.3,c:'rgba(200,225,230,.5)'});
        this.fx(s);
      },
      fx(s){for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.x+=q.vx*s;q.y+=q.vy*s;q.life-=s;if(q.life<=0)parts.splice(i,1)}},
      draw(now){
        const c=api.ctx,W=api.W;if(!W)return;const u=W/100;
        const g=c.createLinearGradient(0,0,0,W);g.addColorStop(0,'#0b1620');g.addColorStop(.7,'#12303a');g.addColorStop(1,'#0f2229');c.fillStyle=g;c.fillRect(0,0,W,W);
        c.fillStyle='rgba(220,240,245,.5)';for(let i=0;i<24;i++){c.fillRect(((i*37.7+7)%100)*u,((i*23.3)%50)*u,u*.35,u*.35)}
        for(let layer=0;layer<2;layer++){
          c.fillStyle=layer?'#173842':'#12303a';c.beginPath();c.moveTo(0,G*u);
          const off=(dist*(.12+layer*.2));
          for(let x=0;x<=100;x+=2){const y=G-12-layer*4-Math.abs(Math.sin((x+off)*.07+layer))*18;c.lineTo(x*u,y*u)}
          c.lineTo(W,G*u);c.closePath();c.fill();
        }
        c.fillStyle='#0e2229';c.fillRect(0,G*u,W,W-G*u);
        c.fillStyle='#6fd0d0';c.fillRect(0,G*u,W,u*.5);
        c.fillStyle='rgba(111,208,208,.3)';for(let x=-gx;x<100;x+=12)c.fillRect(x*u,(G+4)*u,u*5,u*.5);
        for(const ob of orbs){if(ob.got)continue;c.save();c.shadowColor='#f0cb7a';c.shadowBlur=u*2;c.fillStyle='#f0cb7a';c.beginPath();c.arc(ob.x*u,ob.y*u+Math.sin(now/200+ob.x)*u*.6,u*1.5,0,6.2832);c.fill();c.restore()}
        for(const ob of obs){
          if(ob.type==='drone'){
            const bob=Math.sin(now/180+ob.x)*u*.8,cx=(ob.x+ob.w/2)*u,cy=(ob.y+ob.h/2)*u+bob;
            c.save();c.shadowColor='#f09a8a';c.shadowBlur=u*2;c.fillStyle='#f09a8a';c.beginPath();c.ellipse(cx,cy,ob.w*u/2,ob.h*u/2.4,0,0,6.2832);c.fill();c.restore();
            c.fillStyle='#0c1318';c.beginPath();c.arc(cx-ob.w*u*.18,cy,u*.9,0,6.2832);c.fill();
            c.strokeStyle='#e7eef1';c.lineWidth=u*.5;c.beginPath();const w=Math.sin(now/40)*ob.w*u*.5;c.moveTo(cx-w,cy-ob.h*u*.55);c.lineTo(cx+w,cy-ob.h*u*.55);c.stroke();
          }else{
            const n=ob.type==='double'?2:1,cw=ob.type==='double'?4.5:ob.w;
            for(let i=0;i<n;i++){
              const x=ob.x+i*(ob.w-cw),h=ob.h;
              c.save();c.shadowColor='#86c3e6';c.shadowBlur=u*1.6;
              c.fillStyle='#86c3e6';c.beginPath();c.moveTo(x*u,G*u);c.lineTo((x+cw*.15)*u,(G-h*.7)*u);c.lineTo((x+cw/2)*u,(G-h)*u);c.lineTo((x+cw*.85)*u,(G-h*.7)*u);c.lineTo((x+cw)*u,G*u);c.closePath();c.fill();c.restore();
              c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.moveTo((x+cw/2)*u,(G-h)*u);c.lineTo((x+cw*.85)*u,(G-h*.7)*u);c.lineTo((x+cw*.55)*u,G*u);c.lineTo((x+cw*.4)*u,(G-h*.5)*u);c.closePath();c.fill();
            }
          }
        }
        for(const q of parts){c.globalAlpha=Math.max(0,q.life/q.max);c.fillStyle=q.c;c.fillRect(q.x*u,q.y*u,u*.9,u*.9)}
        c.globalAlpha=1;
        if(!dead){
          const x=p.x*u,y=p.y*u,w=p.w*u,h=p.h*u;
          c.save();c.shadowColor='#6fd0d0';c.shadowBlur=u*1.8;
          const gr=c.createLinearGradient(x,y,x,y+h);gr.addColorStop(0,'#a8f0ee');gr.addColorStop(1,'#4fb7b7');
          c.fillStyle=gr;c.beginPath();c.roundRect(x,y,w,h*(p.onG&&!duck?.78:.9),u*2);c.fill();c.restore();
          c.fillStyle='#0c1318';c.beginPath();c.arc(x+w*.72,y+h*.28,u*.7,0,6.2832);c.fill();
          if(p.onG&&!duck){const sw=Math.sin(t*16)*w*.28;c.fillStyle='#4fb7b7';c.fillRect(x+w*.25+sw,y+h*.74,w*.2,h*.26);c.fillRect(x+w*.55-sw,y+h*.74,w*.2,h*.26)}
          else if(!duck){c.fillStyle='#4fb7b7';c.fillRect(x+w*.25,y+h*.8,w*.5,h*.14)}
        }
      },
      key(e,tp){
        const k=e.key;
        if(k===' '||k==='ArrowUp'||k==='w'||k==='W'){if(tp==='down'){if(!e.repeat)jump()}else held=false;return true}
        if(k==='ArrowDown'||k==='s'||k==='S'){duck=tp==='down';return true}
        return false;
      },
      pointer(tp,x,y){
        if(tp==='down'){this._y=y;jump()}
        else if(tp==='move'&&this._y!=null&&y-this._y>26)duck=true;
        else if(tp==='up'){held=false;duck=false;this._y=null}
      },
      dir(dx,dy){if(dy<0)jump();else if(dy>0){duck=true;setTimeout(()=>{duck=false},450)}},
      onOpt(k){if(k==='speed'||k==='dbl')return false}
    };
  }
});

/* ================= 3. 2048 ================= */
arcade({
  id:'t2048',color:'sand',n:['2048','2048'],
  d:['اسحب المربعات وادمج المتشابهة حتى تصل إلى 2048.','Slide the tiles and merge matching ones to reach 2048.'],
  how:['اضغط على أي مربع فيذهب إلى مثيله ويتضاعف (أو اسحب/الأسهم).','Tap any tile: it jumps to its twin and doubles (or swipe/arrows).'],
  hud2:['أعلى مربع','Top tile'],opts:{size:4,tap:true},
  buttons:[{t:['تراجع','Undo'],fn:'undo'}],
  ui:[{type:'seg',k:'size',l:['حجم اللوحة','Board'],v:[['4',['4×4','4×4']],['5',['5×5','5×5']],['6',['6×6','6×6']]]},{type:'tgl',k:'tap',l:['اضغط مربعاً لدمجه مع مثيله','Tap a tile to merge it']}],
  bestSuffix:o=>'-'+o.size,
  note:['بعد الوصول إلى 2048 يمكنك المتابعة. التراجع يعيد آخر حركة.','After 2048 you can keep going. Undo takes back your last move.'],
  preview:'<g font-family="JetBrains Mono,monospace" font-weight="700" font-size="20" text-anchor="middle"><rect x="62" y="22" width="56" height="50" rx="9" fill="#3a6a85"/><text x="90" y="55" fill="#e7eef1">8</text><rect x="126" y="22" width="56" height="50" rx="9" fill="#6cbfae"/><text x="154" y="55" fill="#0c1318">64</text><rect x="62" y="80" width="56" height="50" rx="9" fill="#f0cb7a"/><text x="90" y="113" fill="#0c1318">1k</text><rect x="126" y="80" width="56" height="50" rx="9" fill="#f0a878"/><text x="154" y="113" fill="#0c1318">2k</text></g>',
  make(api){
    const o=api.opts,tr=(a,b)=>lang==='ar'?a:b;
    const RAMP={2:'#2b4352',4:'#34556a',8:'#3f7090',16:'#4a86a8',32:'#58a0b4',64:'#6cbfae',128:'#7fd6a8',256:'#a8d882',512:'#d8d878',1024:'#f0cb7a',2048:'#f0a878'};
    let N,grid,tiles,ghosts,hist,won,sx,sy,fired,lx,ly;
    const cellPos=(x,y)=>{const W=api.W,pad=W*.03,gap=W*.02,cs=(W-2*pad-gap*(N-1))/N;return[pad+x*(cs+gap),pad+y*(cs+gap),cs]};
    function spawn(){
      const free=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!grid[y][x])free.push([x,y]);
      if(!free.length)return;const [x,y]=rnd(free);
      const tl={v:Math.random()<.9?2:4,x,y,fx:x,fy:y,sc:0,pop:0};grid[y][x]=tl;tiles.push(tl);
    }
    const top=()=>tiles.reduce((m,tl)=>Math.max(m,tl.v),0);
    function canMove(){
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){
        if(!grid[y][x])return true;
        if(x<N-1&&grid[y][x+1]&&grid[y][x+1].v===grid[y][x].v)return true;
        if(y<N-1&&grid[y+1][x]&&grid[y+1][x].v===grid[y][x].v)return true;
      }
      return false;
    }
    function slide(dx,dy){
      const snap={v:grid.map(r=>r.map(tl=>tl?tl.v:0)),score:api.score};
      const ng=Array.from({length:N},()=>Array(N).fill(null));let moved=false,gain=0;
      for(let a=0;a<N;a++){
        const seq=[];for(let i=0;i<N;i++){const k=(dx>0||dy>0)?N-1-i:i;seq.push(dx?[k,a]:[a,k])}
        const line=seq.map(([x,y])=>grid[y][x]).filter(Boolean);
        let slot=0,prev=null;
        for(const tl of line){
          if(prev&&prev.v===tl.v&&!prev.m){prev.v*=2;prev.m=true;gain+=prev.v;tl.x=prev.x;tl.y=prev.y;tl.dead=true;ghosts.push(tl);prev.pop=1;moved=true}
          else{const [x,y]=seq[slot++];if(tl.x!==x||tl.y!==y)moved=true;tl.x=x;tl.y=y;ng[y][x]=tl;prev=tl}
        }
      }
      if(!moved)return false;
      hist.push(snap);if(hist.length>1)hist.shift();
      grid=ng;tiles=tiles.filter(tl=>!tl.dead);tiles.forEach(tl=>tl.m=false);
      api.addScore(gain);spawn();api.hud2(top());
      if(gain){api.tone(500+Math.min(500,gain*3),.08,'triangle',.05);api.buzz(8)}else api.tone(300,.04,'sine',.03);
      if(!won&&top()>=2048){won=true;api.chip(tr('وصلت إلى 2048!','You reached 2048!'));api.confetti();setTimeout(()=>api.chip(null),2600)}
      if(!canMove())api.over();
      return true;
    }
    function tapMerge(px,py){
      let b=null;for(const tl of tiles){const [cx,cy,cs]=cellPos(tl.x,tl.y);if(px>=cx&&px<=cx+cs&&py>=cy&&py<=cy+cs){b=tl;break}}
      if(!b)return false;let p=null,d=1e9;
      for(const q of tiles)if(q!==b&&q.v===b.v){const k=Math.abs(q.x-b.x)+Math.abs(q.y-b.y);if(k<d){d=k;p=q}}
      if(!p){api.tone(200,.06,'square',.03);return true}
      hist.push({v:grid.map(r=>r.map(tl=>tl?tl.v:0)),score:api.score});if(hist.length>1)hist.shift();
      grid[b.y][b.x]=null;b.x=p.x;b.y=p.y;b.dead=true;ghosts.push(b);p.v*=2;p.pop=1;
      tiles=tiles.filter(tl=>!tl.dead);api.addScore(p.v);spawn();api.hud2(top());api.tone(500+Math.min(500,p.v*3),.08,'triangle',.05);api.buzz(8);
      if(!won&&top()>=2048){won=true;api.chip(tr('وصلت إلى 2048!','You reached 2048!'));api.confetti();setTimeout(()=>api.chip(null),2600)}
      if(!canMove())api.over();return true;
    }
    function load(vals){
      grid=Array.from({length:N},()=>Array(N).fill(null));tiles=[];ghosts=[];
      vals.forEach((row,y)=>row.forEach((v,x)=>{if(v){const tl={v,x,y,fx:x,fy:y,sc:1,pop:0};grid[y][x]=tl;tiles.push(tl)}}));
    }
    return{
      reset(){N=o.size;grid=Array.from({length:N},()=>Array(N).fill(null));tiles=[];ghosts=[];hist=[];won=false;fired=false;spawn();spawn();api.hud2(top())},
      update(s){
        for(const tl of tiles.concat(ghosts)){const k=1-Math.exp(-s*22);tl.fx+=(tl.x-tl.fx)*k;tl.fy+=(tl.y-tl.fy)*k}
        for(const tl of tiles){tl.sc+=(1-tl.sc)*(1-Math.exp(-s*16));if(tl.pop>0)tl.pop=Math.max(0,tl.pop-s*5)}
        ghosts=ghosts.filter(g=>Math.abs(g.fx-g.x)>.03||Math.abs(g.fy-g.y)>.03);
      },
      fx(s){this.update(s)},
      draw(){
        const c=api.ctx,W=api.W;if(!W)return;
        c.fillStyle='#10191f';c.fillRect(0,0,W,W);
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [px,py,cs]=cellPos(x,y);c.fillStyle='#17252e';c.beginPath();c.roundRect(px,py,cs,cs,cs*.12);c.fill()}
        c.textAlign='center';c.textBaseline='middle';
        const drawT=tl=>{
          const [px,py,cs]=cellPos(tl.fx,tl.fy),sc=tl.sc*(1+tl.pop*.16),w=cs*sc,x=px+(cs-w)/2,y=py+(cs-w)/2;
          const col=RAMP[tl.v]||'#f09a8a';
          c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,w,cs*.12);c.fill();
          c.fillStyle=tl.v>=128?'#0c1318':'#e7eef1';
          const d=String(tl.v).length,fs=cs*(d<=2?.46:d===3?.38:.3)*sc;
          c.font='700 '+fs+'px JetBrains Mono,monospace';c.fillText(tl.v,x+w/2,y+w/2+fs*.04);
        };
        ghosts.forEach(drawT);tiles.forEach(drawT);
      },
      key(e,tp){
        if(tp!=='down')return false;
        const m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1]}[e.key.length===1?e.key.toLowerCase():e.key];
        if(m){slide(m[0],m[1]);return true}
        if(e.key==='z'||e.key==='Z'){this.undo();return true}
        return false;
      },
      pointer(tp,x,y){
        if(tp==='down'){sx=x;sy=y;fired=false;lx=x;ly=y}
        else if(tp==='move'&&sx!=null&&!fired){
          lx=x;ly=y;const dx=x-sx,dy=y-sy;
          if(Math.max(Math.abs(dx),Math.abs(dy))>api.W*.07){fired=true;if(Math.abs(dx)>Math.abs(dy))slide(dx>0?1:-1,0);else slide(0,dy>0?1:-1)}
        }else if(tp==='up'){if(sx!=null&&!fired&&o.tap!==false&&Math.hypot((x||lx)-sx,(y||ly)-sy)<api.W*.05)tapMerge(sx,sy);sx=null}
      },
      dir(dx,dy){slide(dx,dy)},
      undo(){
        if(!hist.length||api.state!=='running')return;
        const s=hist.pop();load(s.v);api.setScore(s.score);api.hud2(top());api.tone(360,.08,'sine',.04);
      }
    };
  }
});

/* ================= 4. Memory ================= */
arcade({
  id:'memory',color:'rose',dom:true,lower:true,n:['الذاكرة','Memory'],
  d:['اقلب البطاقات وطابق كل زوج بأقل عدد من الحركات.','Flip the cards and match every pair in the fewest moves.'],
  how:['اضغط بطاقتين متطابقتين. تُعرض البطاقات لحظة في البداية لتحفظها.','Tap two matching cards. They are shown briefly at the start so you can memorise them.'],
  hud0:['الحركات','Moves'],hud1:['الأفضل','Best'],hud2:['الوقت','Time'],
  overT:['أحسنت!','Well done!'],metaL:['أقل حركات ','Fewest moves '],winConfetti:true,overDelay:500,
  opts:{size:4,peek:true},
  ui:[
    {type:'seg',k:'size',l:['عدد البطاقات','Cards'],v:[['4',['16','16']],['6',['36','36']]]},
    {type:'tgl',k:'peek',l:['إظهار البطاقات في البداية','Preview at start']}],
  bestSuffix:o=>'-'+o.size,
  note:['النتيجة هي عدد الحركات، وكلما قلّ كان أفضل.','Your score is the number of moves. Fewer is better.'],
  preview:'<g><rect x="50" y="26" width="46" height="46" rx="9" fill="#233745" stroke="#3a5568"/><rect x="107" y="26" width="46" height="46" rx="9" fill="#2a3f4c" stroke="#e6a0c4"/><circle cx="130" cy="49" r="13" fill="#e6a0c4"/><rect x="164" y="26" width="46" height="46" rx="9" fill="#233745" stroke="#3a5568"/><rect x="50" y="80" width="46" height="46" rx="9" fill="#2a3f4c" stroke="#e6a0c4"/><path d="M73 90 L88 118 H58 Z" fill="#f0cb7a"/><rect x="107" y="80" width="46" height="46" rx="9" fill="#233745" stroke="#3a5568"/><rect x="164" y="80" width="46" height="46" rx="9" fill="#2a3f4c" stroke="#e6a0c4"/><circle cx="187" cy="103" r="13" fill="#e6a0c4"/></g>',
  css:'#memory-wrap{background:var(--bg2)}.mgrid{position:absolute;inset:0;display:grid;gap:2.4%;padding:3%}.mc{position:relative;padding:0;border:0;background:none;perspective:700px;min-width:0;min-height:0}.mc .in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .42s cubic-bezier(.3,.7,.3,1)}.mc.on .in{transform:rotateY(180deg)}.mc .bk,.mc .fr{position:absolute;inset:0;border-radius:14%;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:grid;place-items:center}.mc .bk{background:linear-gradient(145deg,#243846,#1a2a35);border:1px solid var(--line)}.mc .bk::after{content:"";width:26%;aspect-ratio:1;border:2px solid #3a5568;transform:rotate(45deg);border-radius:4px}.mc .fr{transform:rotateY(180deg);background:var(--panel2);border:1px solid var(--line)}.mc .fr svg{width:66%;height:66%}.mc.ok .fr{border-color:var(--mint);box-shadow:0 0 18px -4px var(--mint)}.mc.bad .fr{border-color:var(--coral)}.mc:disabled{cursor:default}',
  make(api){
    const o=api.opts,COLS=['#f09a8a','#86c3e6','#7fd6a8','#f0cb7a','#b9a8ec','#e6a0c4'];
    const star=(()=>{let s='';for(let i=0;i<10;i++){const a=-1.5708+i*.6283,r=i%2?15:36;s+=(50+Math.cos(a)*r).toFixed(1)+','+(52+Math.sin(a)*r).toFixed(1)+' '}return s})();
    const SH=[
      f=>'<circle cx="50" cy="50" r="32" fill="'+f+'"/>',
      f=>'<rect x="20" y="20" width="60" height="60" rx="11" fill="'+f+'"/>',
      f=>'<path d="M50 16L86 80H14Z" fill="'+f+'" stroke="'+f+'" stroke-width="6" stroke-linejoin="round"/>',
      f=>'<path d="M50 12L88 50L50 88L12 50Z" fill="'+f+'"/>',
      f=>'<polygon points="'+star+'" fill="'+f+'" stroke="'+f+'" stroke-width="4" stroke-linejoin="round"/>',
      f=>'<path d="M50 12L83 31V69L50 88L17 69V31Z" fill="'+f+'"/>',
      f=>'<path d="M38 14h24v24h24v24H62v24H38V62H14V38h24z" fill="'+f+'"/>',
      f=>'<circle cx="50" cy="50" r="28" fill="none" stroke="'+f+'" stroke-width="14"/>'];
    const grid=document.createElement('div');grid.className='mgrid';api.el.insertBefore(grid,api.el.firstChild);
    let n,cards,open,lock,matched,moves,time,fresh,peekT,secShown;
    const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
    function build(){
      n=o.size;const pairs=n*n/2;
      const all=[];for(let i=0;i<32;i++)all.push({sh:i%8,col:(Math.floor(i/8)+(i%8))%6});
      for(let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]]}
      const deck=[];all.slice(0,pairs).forEach((a,i)=>{deck.push({k:i,...a},{k:i,...a})});
      for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
      grid.style.gridTemplateColumns='repeat('+n+',1fr)';grid.style.gridTemplateRows='repeat('+n+',1fr)';
      grid.innerHTML=deck.map((d,i)=>'<button class="mc" data-i="'+i+'" aria-label="'+(i+1)+'"><div class="in"><div class="bk"></div><div class="fr"><svg viewBox="0 0 100 100">'+SH[d.sh](COLS[d.col])+'</svg></div></div></button>').join('');
      cards=deck.map((d,i)=>({k:d.k,el:grid.children[i],done:false}));
    }
    function flip(c,on){c.el.classList.toggle('on',on)}
    function click(i){
      const c=cards[i];
      if(lock||c.done||open.includes(c))return;
      if(api.state==='ready')api.start();
      if(api.state!=='running')return;
      flip(c,true);open.push(c);api.tone(500,.05,'triangle',.04);
      if(open.length===2){
        moves++;api.setScore(moves);lock=true;
        const [a,b]=open;
        if(a.k===b.k){
          a.done=b.done=true;matched+=2;
          setTimeout(()=>{a.el.classList.add('ok');b.el.classList.add('ok');open=[];lock=false;api.tone(784,.1,'triangle',.06);api.tone(1047,.14,'triangle',.05,.08);api.buzz(12);
            if(matched===cards.length)api.over()},380);
        }else{
          setTimeout(()=>{a.el.classList.add('bad');b.el.classList.add('bad')},380);
          setTimeout(()=>{flip(a,false);flip(b,false);a.el.classList.remove('bad');b.el.classList.remove('bad');open=[];lock=false},900);
        }
      }
    }
    grid.addEventListener('click',e=>{const b=e.target.closest('.mc');if(b)click(Number(b.dataset.i))});
    return{
      reset(){build();open=[];lock=false;matched=0;moves=0;time=0;fresh=true;secShown=-1;api.hud2('0:00')},
      update(s){
        if(fresh){
          fresh=false;
          if(o.peek){lock=true;cards.forEach(c=>flip(c,true));peekT=setTimeout(()=>{cards.forEach(c=>{if(!c.done)flip(c,false)});lock=false},1300+n*160)}
        }
        time+=s;const sec=Math.floor(time);if(sec!==secShown){secShown=sec;api.hud2(fmt(time))}
      }
    };
  }
});

/* ================= 5. Blocks ================= */
arcade({
  id:'blocks',color:'lime',dpad:true,n:['المكعبات','Blocks'],
  d:['رتّب القطع المتساقطة وأكمل الصفوف قبل أن تمتلئ اللوحة.','Stack the falling pieces and clear rows before the board fills.'],
  how:['اسحب لتحريك القطعة، واضغط للتدوير، واسحب سريعاً للأسفل للإسقاط.','Drag to move, tap to rotate, flick down to drop.'],
  hud2:['المستوى','Level'],opts:{speed:'normal',ghost:true},
  buttons:[{t:['تدوير','Rotate'],fn:'rotate'},{t:['حفظ','Hold'],fn:'hold'},{t:['إسقاط','Drop'],fn:'hardDrop'}],
  ui:[
    {type:'seg',k:'speed',l:['مستوى البداية','Start level'],v:[['slow',['1','1']],['normal',['4','4']],['fast',['8','8']]]},
    {type:'tgl',k:'ghost',l:['ظل القطعة','Ghost piece']}],
  note:['لوحة الكيبورد: الأسهم للحركة والتدوير، المسافة للإسقاط، C للحفظ.','Keyboard: arrows move and rotate, Space drops, C holds.'],
  preview:'<g><rect x="72" y="20" width="116" height="112" rx="8" fill="#10191f" stroke="#273b48"/><g fill="#86c3e6"><rect x="80" y="112" width="18" height="16" rx="3"/><rect x="100" y="112" width="18" height="16" rx="3" fill="#f0cb7a"/><rect x="120" y="112" width="18" height="16" rx="3" fill="#7fd6a8"/><rect x="140" y="112" width="18" height="16" rx="3" fill="#f09a8a"/><rect x="160" y="112" width="18" height="16" rx="3" fill="#b9a8ec"/><rect x="100" y="94" width="18" height="16" rx="3" fill="#f0cb7a"/></g><g fill="#b7d77a"><rect x="120" y="24" width="18" height="16" rx="3"><animate attributeName="y" values="24;74;24" dur="2.6s" repeatCount="indefinite"/></rect><rect x="138" y="24" width="18" height="16" rx="3"><animate attributeName="y" values="24;74;24" dur="2.6s" repeatCount="indefinite"/></rect><rect x="120" y="42" width="18" height="16" rx="3"><animate attributeName="y" values="42;92;42" dur="2.6s" repeatCount="indefinite"/></rect></g></g>',
  make(api){
    const o=api.opts,tr=(a,b)=>lang==='ar'?a:b,COLS=10,ROWS=20;
    const SH={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
    const CL={I:'#86c3e6',O:'#f0cb7a',T:'#b9a8ec',S:'#7fd6a8',Z:'#f09a8a',J:'#6f9ae6',L:'#e3b98a'};
    const START={slow:1,normal:4,fast:8},PTS=[0,100,300,500,800];
    let board,cur,queue,bag,hold,canHold,fall,lockT,lockResets,lines,level,clearing,clearT,parts,p0,chipT;
    const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
    function refill(){const b=Object.keys(SH);for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}bag.push(...b)}
    function take(){if(bag.length<7)refill();return bag.shift()}
    const mk=t=>({t,m:SH[t].map(r=>r.slice()),x:Math.floor((COLS-SH[t].length)/2),y:t==='I'?-1:0});
    function hit(m,x,y){
      for(let r=0;r<m.length;r++)for(let c=0;c<m[r].length;c++){
        if(!m[r][c])continue;const nx=x+c,ny=y+r;
        if(nx<0||nx>=COLS||ny>=ROWS)return true;
        if(ny>=0&&board[ny][nx])return true;
      }
      return false;
    }
    function spawn(t){
      cur=mk(t||queue.shift());while(queue.length<4)queue.push(take());
      fall=0;lockT=0;lockResets=0;canHold=true;
      if(hit(cur.m,cur.x,cur.y)){api.over();return false}
      return true;
    }
    const ghostY=()=>{let y=cur.y;while(!hit(cur.m,cur.x,y+1))y++;return y};
    function moved(){if(lockT>0&&lockResets<12){lockT=0;lockResets++}}
    function move(d){if(clearing||!cur)return;if(!hit(cur.m,cur.x+d,cur.y)){cur.x+=d;moved();api.tone(300,.03,'square',.02)}}
    function rotate(dir=1){
      if(clearing||!cur)return;
      let m=cur.m;for(let i=0;i<(dir>0?1:3);i++)m=rot(m);
      for(const k of[0,-1,1,-2,2]){if(!hit(m,cur.x+k,cur.y)){cur.m=m;cur.x+=k;moved();api.tone(420,.04,'triangle',.03);return}}
    }
    function soft(){if(clearing||!cur)return;if(!hit(cur.m,cur.x,cur.y+1)){cur.y++;fall=0;api.addScore(1)}}
    function hardDrop(){
      if(clearing||!cur)return;const y=ghostY();api.addScore((y-cur.y)*2);cur.y=y;api.tone(180,.08,'square',.05);api.buzz(10);lock();
    }
    function hold_(){
      if(clearing||!cur||!canHold)return;
      const t=cur.t;if(hold){const h=hold;hold=t;spawn(h)}else{hold=t;spawn()}
      canHold=false;api.tone(380,.06,'triangle',.04);
    }
    function lock(){
      for(let r=0;r<cur.m.length;r++)for(let c=0;c<cur.m[r].length;c++){
        if(cur.m[r][c]){const y=cur.y+r;if(y>=0)board[y][cur.x+c]=CL[cur.t]}
      }
      const full=[];for(let y=0;y<ROWS;y++)if(board[y].every(Boolean))full.push(y);
      cur=null;
      if(full.length){
        clearing=full;clearT=.26;api.tone(600+full.length*100,.12,'triangle',.06);if(full.length===4){api.tone(1047,.2,'triangle',.06,.1);api.buzz(40)}else api.buzz(15);
      }else spawn();
    }
    function finishClear(){
      const n=clearing.length;
      for(const y of clearing){for(let x=0;x<COLS;x++)for(let k=0;k<3;k++)parts.push({x:x+.5,y:y+.5,vx:(Math.random()-.5)*10,vy:-Math.random()*8,life:.6,max:.6,c:rnd(Object.values(CL))})}
      board=board.filter((_,y)=>!clearing.includes(y));while(board.length<ROWS)board.unshift(Array(COLS).fill(null));
      lines+=n;level=START[o.speed]+Math.floor(lines/10);api.addScore(PTS[n]*level);api.hud2(level);
      if(n===4){api.chip(tr('رباعي!','Quad!'));chipT=1.3}
      clearing=null;spawn();
    }
    function layout(){const W=api.W,ts=W/20,x0=W*.05;return{W,ts,x0,px:x0+10*ts+ts*.9}}
    function drawCell(c,x,y,ts,col,a=1){
      c.globalAlpha=a;c.fillStyle=col;c.beginPath();c.roundRect(x+ts*.04,y+ts*.04,ts*.92,ts*.92,ts*.16);c.fill();
      c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.roundRect(x+ts*.1,y+ts*.1,ts*.8,ts*.22,ts*.1);c.fill();
      c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.roundRect(x+ts*.1,y+ts*.68,ts*.8,ts*.22,ts*.1);c.fill();c.globalAlpha=1;
    }
    function drawMini(c,t,x,y,box){
      if(!t)return;const m=SH[t],s=box/4.4;let minC=9,maxC=0,minR=9,maxR=0;
      m.forEach((row,r)=>row.forEach((v,cc)=>{if(v){minC=Math.min(minC,cc);maxC=Math.max(maxC,cc);minR=Math.min(minR,r);maxR=Math.max(maxR,r)}}));
      const w=(maxC-minC+1)*s,h=(maxR-minR+1)*s,ox=x+(box-w)/2-minC*s,oy=y+(box-h)/2-minR*s;
      m.forEach((row,r)=>row.forEach((v,cc)=>{if(v)drawCell(c,ox+cc*s,oy+r*s,s,CL[t])}));
    }
    return{
      reset(){
        board=Array.from({length:ROWS},()=>Array(COLS).fill(null));bag=[];queue=[];while(queue.length<5)queue.push(take());
        hold=null;lines=0;level=START[o.speed];clearing=null;parts=[];chipT=0;cur=null;api.hud2(level);spawn();
      },
      update(s){
        if(chipT>0){chipT-=s;if(chipT<=0)api.chip(null)}
        if(clearing){clearT-=s;if(clearT<=0)finishClear();this.fx(s);return}
        if(!cur)return;
        fall+=s;const iv=Math.max(.05,.8*Math.pow(.82,level-1));
        if(fall>=iv){fall=0;if(!hit(cur.m,cur.x,cur.y+1))cur.y++}
        if(hit(cur.m,cur.x,cur.y+1)){lockT+=s;if(lockT>.45)lock()}else lockT=0;
        this.fx(s);
      },
      fx(s){for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.x+=q.vx*s;q.y+=q.vy*s;q.vy+=18*s;q.life-=s;if(q.life<=0)parts.splice(i,1)}},
      draw(now){
        const {W,ts,x0,px}=layout();if(!W)return;const c=api.ctx;
        c.fillStyle='#0e171e';c.fillRect(0,0,W,W);
        c.fillStyle='#10191f';c.fillRect(x0,0,10*ts,20*ts);
        c.strokeStyle='rgba(60,90,110,.25)';c.lineWidth=1;c.beginPath();
        for(let i=0;i<=10;i++){c.moveTo(x0+i*ts,0);c.lineTo(x0+i*ts,20*ts)}for(let j=0;j<=20;j++){c.moveTo(x0,j*ts);c.lineTo(x0+10*ts,j*ts)}c.stroke();
        c.strokeStyle='#273b48';c.lineWidth=2;c.strokeRect(x0,0,10*ts,20*ts);
        for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
          const col=board[y][x];if(!col)continue;
          if(clearing&&clearing.includes(y)){c.fillStyle=Math.floor(now/60)%2?'#ffffff':col;c.fillRect(x0+x*ts,y*ts,ts,ts)}
          else drawCell(c,x0+x*ts,y*ts,ts,col);
        }
        if(cur){
          if(o.ghost){const gy=ghostY();cur.m.forEach((row,r)=>row.forEach((v,cc)=>{if(v){const yy=gy+r;if(yy>=0)drawCell(c,x0+(cur.x+cc)*ts,yy*ts,ts,CL[cur.t],.22)}}))}
          cur.m.forEach((row,r)=>row.forEach((v,cc)=>{if(v){const yy=cur.y+r;if(yy>=0)drawCell(c,x0+(cur.x+cc)*ts,yy*ts,ts,CL[cur.t])}}));
        }
        for(const q of parts){c.globalAlpha=Math.max(0,q.life/q.max);c.fillStyle=q.c;c.fillRect(x0+q.x*ts,q.y*ts,ts*.22,ts*.22)}
        c.globalAlpha=1;
        const pw=W-px-W*.03,box=Math.min(pw,ts*4.4);
        c.fillStyle='#8ea4af';c.font='600 '+(ts*.62)+'px IBM Plex Sans Arabic,JetBrains Mono,sans-serif';c.textAlign='left';c.textBaseline='alphabetic';
        const lab=(txt,y)=>{c.textAlign='left';c.fillText(txt,px,y)};
        lab(tr('القادم','NEXT'),ts*1.1);
        queue.slice(0,3).forEach((t,i)=>{c.fillStyle='#15212a';c.beginPath();c.roundRect(px,ts*1.5+i*(box*.78+ts*.3),box,box*.78,ts*.4);c.fill();drawMini(c,t,px,ts*1.5+i*(box*.78+ts*.3)-box*.11,box)});
        const hy=ts*1.5+3*(box*.78+ts*.3)+ts*.6;
        c.fillStyle='#8ea4af';lab(tr('محفوظ','HOLD'),hy);
        c.fillStyle='#15212a';c.beginPath();c.roundRect(px,hy+ts*.4,box,box*.78,ts*.4);c.fill();
        if(hold){c.globalAlpha=canHold?1:.4;drawMini(c,hold,px,hy+ts*.4-box*.11,box);c.globalAlpha=1}
        c.fillStyle='#8ea4af';lab(tr('الصفوف','LINES'),hy+box*.78+ts*1.6);
        c.fillStyle='#e7eef1';c.font='700 '+(ts*1.1)+'px JetBrains Mono,monospace';lab(String(lines),hy+box*.78+ts*2.8);
      },
      key(e,tp){
        if(tp!=='down')return false;
        const k=e.key.length===1?e.key.toLowerCase():e.key;
        if(k==='ArrowLeft'||k==='a'){move(-1);return true}
        if(k==='ArrowRight'||k==='d'){move(1);return true}
        if(k==='ArrowDown'||k==='s'){soft();return true}
        if(k==='ArrowUp'||k==='w'||k==='x'){rotate(1);return true}
        if(k==='z'){rotate(-1);return true}
        if(k===' '){hardDrop();return true}
        if(k==='c'||k==='Shift'){hold_();return true}
        return false;
      },
      pointer(tp,x,y){
        const ts=api.W/20;
        if(tp==='down')p0={x,y,lx:x,ly:y,ax:0,ay:0,t:performance.now(),mv:false,sx:x,sy:y};
        else if(!p0)return;
        else if(tp==='move'){
          p0.ax+=x-p0.lx;p0.ay+=y-p0.ly;p0.lx=x;p0.ly=y;
          while(Math.abs(p0.ax)>ts*.95){const d=p0.ax>0?1:-1;move(d);p0.ax-=d*ts*.95;p0.mv=true}
          if(p0.ay>ts*1.05){soft();p0.ay-=ts*1.05;p0.mv=true}
        }else if(tp==='up'){
          const dt=performance.now()-p0.t,dy=y-p0.sy,dx=x-p0.sx;
          if(!p0.mv&&dt<280&&Math.hypot(dx,dy)<10)rotate(1);
          else if(dy>ts*3.2&&dt<320&&Math.abs(dx)<ts*2.5)hardDrop();
          p0=null;
        }
      },
      dir(dx,dy){if(dx)move(dx);else if(dy>0)soft();else rotate(1)},
      rotate(){rotate(1)},hardDrop,hold:hold_
    };
  }
});

{const st=document.createElement('style');st.textContent=ARC_CSS;document.head.appendChild(st)}
/* ---------- home: live mini preview of the vanishing rule ---------- */
const mini=(()=>{
  const box=$('#miniXo');box.innerHTML='<div></div>'.repeat(9);
  const cs=$$('div',box);
  const script=[['x',0],['o',4],['x',2],['o',8],['x',6],['o',1],['x',3],['o',7],['x',5]];
  let q,i,timer=0;
  function paint(gone){
    cs.forEach((c,k)=>{
      const w=q.x.includes(k)?'x':q.o.includes(k)?'o':'';
      if(w){const a=q[w];c.textContent=w.toUpperCase();c.className=w+(a.length>=3&&a[0]===k?' dim':'')}
      else if(gone===k){c.className='gone'}
      else{c.textContent='';c.className=''}
    });
  }
  function reset(){q={x:[],o:[]};i=0;paint(-1)}
  function step(){
    if(i>=script.length){reset();return}
    const [w,k]=script[i++];let gone=-1;
    q[w].push(k);
    if(q[w].length>3){gone=q[w].shift();cs[gone].textContent=w.toUpperCase();cs[gone].className=w+' dim'}
    paint(gone);
    if(gone>=0){requestAnimationFrame(()=>{cs[gone].className='gone ' + w});setTimeout(()=>{if(cs[gone].className.indexOf('gone')===0){cs[gone].textContent='';cs[gone].className=''}},420)}
  }
  reset();
  return{active(v){clearInterval(timer);if(v){reset();timer=setInterval(step,800)}}};
})();

/* ---------- home meta, drawers, fullscreen, router ---------- */
/* ================= 10. GRAVITY FLIP (new) ================= */
arcade({
  id:'flip',color:'vio',n:['قلب الجاذبية','Gravity Flip'],
  d:['اقلب الجاذبية بين الأرض والسقف، تفادَ الأشواك والكرات الحمراء والتقط النجوم.','Flip gravity between floor and ceiling, dodge spikes and red orbs, grab the stars.'],
  how:['اضغط في أي مكان أو مسطرة المسافة لقلب الجاذبية.','Tap anywhere or press Space to flip gravity.'],
  hud2:['النجوم','Stars'],opts:{speed:'normal',trail:true},
  ui:[
    {type:'seg',k:'speed',l:['السرعة','Speed'],v:[['slow',['هادئ','Chill']],['normal',['عادي','Normal']],['fast',['سريع','Fast']]]},
    {type:'tgl',k:'trail',l:['أثر الكرة','Ball trail']}],
  note:['كل نجمة = 5 نقاط، والسرعة تزيد تدريجياً. الأسهم تحدد اتجاه الجاذبية مباشرة.','Each star = 5 points and the speed ramps up. Arrow keys set gravity direction directly.'],
  bestSuffix:o=>'-'+o.speed,
  preview:'<rect x="0" y="20" width="260" height="6" fill="#b9a8ec" opacity=".55"/><rect x="0" y="124" width="260" height="6" fill="#b9a8ec" opacity=".55"/><path d="M70 124l10-34 10 34zM170 26l10 34 10-34z" fill="#e6a0c4"/><circle cx="210" cy="78" r="7" fill="#f09a8a"/><circle cx="130" cy="60" r="5" fill="#f0cb7a"/><circle cx="40" cy="108" r="11" fill="#b9a8ec"><animate attributeName="cy" values="108;42;108" dur="2.4s" repeatCount="indefinite"/></circle>',
  make(api){
    const o=api.opts,BASE={slow:34,normal:44,fast:56},CE=14,FL=86,R=3.2,PX=22,tr=(a,b)=>lang==='ar'?a:b;
    let y,vy,g,obs,stars,parts,trail,speed,dist,spawnLeft,starN,t,dead,flipT,gx;
    function spike(top,h,w,x){obs.push({x,top,h,w})}
    function spawn(){
      const r=Math.random(),far=dist>200,x=108;
      if(r<.36)spike(Math.random()<.5,10+Math.random()*10,8,x);
      else if(r<.62){const top=Math.random()<.5;spike(top,12+Math.random()*8,8,x);spike(!top,12+Math.random()*8,8,x+18)}
      else if(r<.82&&far)obs.push({x,orb:true,oy:CE+16+Math.random()*(FL-CE-32),r:3.4,ph:Math.random()*6.28,amp:6+Math.random()*9,y:50});
      else spike(Math.random()<.5,8+Math.random()*6,14,x);
      if(Math.random()<.55)stars.push({x:x+8+Math.random()*10,y:CE+8+Math.random()*(FL-CE-16),got:false});
      spawnLeft=36+Math.random()*22+speed*.35;
    }
    function setG(n){if(n===g)return;g=n;flipT=.2;api.tone(g>0?300:520,.08,'sine',.05,0,g>0?240:640);api.buzz(8);for(let i=0;i<7;i++)parts.push({x:PX,y,vx:-8-Math.random()*22,vy:(Math.random()-.5)*22,life:.4,max:.4,c:'#b9a8ec'})}
    const hAt=(sp,px)=>Math.max(0,sp.h*(1-Math.abs(px-(sp.x+sp.w/2))/(sp.w/2)));
    function die(){
      dead=true;api.buzz(60);api.tone(200,.4,'sawtooth',.05,0,60);
      for(let i=0;i<26;i++){const a=Math.random()*6.283,sp=12+Math.random()*34;parts.push({x:PX,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.8,max:.8,c:i%2?'#b9a8ec':'#e6a0c4'})}
      api.over();
    }
    return{
      reset(){y=FL-R;vy=0;g=1;obs=[];stars=[];parts=[];trail=[];speed=BASE[o.speed];dist=0;spawnLeft=60;starN=0;t=0;dead=false;flipT=0;gx=0;api.hud2(0)},
      update(s){
        t+=s;speed=Math.min(BASE[o.speed]*2,BASE[o.speed]+dist*.01);dist+=speed*s;gx=(gx+speed*s)%12;
        spawnLeft-=speed*s;if(spawnLeft<=0)spawn();
        vy+=g*320*s;y+=vy*s;
        if(y>FL-R){y=FL-R;vy=0}if(y<CE+R){y=CE+R;vy=0}
        flipT=Math.max(0,flipT-s);
        if(o.trail)trail.push({x:PX,y,l:.35});
        for(const q of trail){q.x-=speed*s;q.l-=s}while(trail.length&&trail[0].l<=0)trail.shift();
        for(const ob of obs){ob.x-=speed*s;if(ob.orb)ob.y=ob.oy+Math.sin(t*2.2+ob.ph)*ob.amp}
        for(const st of stars)st.x-=speed*s;
        while(obs.length&&obs[0].x<-24)obs.shift();while(stars.length&&stars[0].x<-8)stars.shift();
        for(const ob of obs){
          if(ob.orb){if(Math.hypot(ob.x-PX,ob.y-y)<R+ob.r-.8){die();return}continue}
          const h=Math.max(hAt(ob,PX-R*.6),hAt(ob,PX),hAt(ob,PX+R*.6));
          if(h>0&&(ob.top?y-R*.85<CE+h:y+R*.85>FL-h)){die();return}
        }
        for(const st of stars)if(!st.got&&Math.hypot(st.x-PX,st.y-y)<R+2.6){st.got=true;starN++;api.hud2(starN);api.tone(988,.08,'triangle',.05);api.tone(1318,.08,'triangle',.04,.06);api.buzz(8)}
        api.setScore(Math.floor(dist/6)+starN*5);
        this.fx(s);
      },
      fx(s){for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.x+=q.vx*s;q.y+=q.vy*s;q.life-=s;if(q.life<=0)parts.splice(i,1)}},
      draw(now){
        const c=api.ctx,W=api.W;if(!W)return;const u=W/100;
        const bgr=c.createLinearGradient(0,0,0,W);bgr.addColorStop(0,'#120d26');bgr.addColorStop(.5,'#1a1236');bgr.addColorStop(1,'#120d26');c.fillStyle=bgr;c.fillRect(0,0,W,W);
        c.fillStyle='rgba(220,210,255,.55)';for(let i=0;i<30;i++){const px=((i*37.7+7)-dist*(.05+(i%3)*.03))%100;c.fillRect((px<0?px+100:px)*u,((i*23.3)%100)*u,u*.35,u*.35)}
        c.strokeStyle='rgba(185,168,236,.12)';c.lineWidth=u*.25;for(let x=-gx;x<100;x+=12){c.beginPath();c.moveTo(x*u,CE*u);c.lineTo(x*u,FL*u);c.stroke()}
        c.fillStyle='#241a48';c.fillRect(0,0,W,CE*u);c.fillRect(0,FL*u,W,W-FL*u);
        c.save();c.shadowColor='#b9a8ec';c.shadowBlur=u*2;c.fillStyle='#b9a8ec';c.fillRect(0,(CE-.5)*u,W,u*.6);c.fillRect(0,FL*u,W,u*.6);c.restore();
        for(const st of stars){if(st.got)continue;c.save();c.shadowColor='#f0cb7a';c.shadowBlur=u*2;c.fillStyle='#f0cb7a';c.translate(st.x*u,st.y*u+Math.sin(now/220+st.x)*u*.6);c.rotate(now/600);c.beginPath();for(let k=0;k<10;k++){const rr=k%2?u*.9:u*2.1,a=k*Math.PI/5;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}c.closePath();c.fill();c.restore()}
        for(const ob of obs){
          if(ob.orb){const pr=1+Math.sin(now/120)*.1;c.save();c.shadowColor='#f09a8a';c.shadowBlur=u*2.4;c.fillStyle='#f09a8a';c.beginPath();c.arc(ob.x*u,ob.y*u,ob.r*u*pr,0,6.2832);c.fill();c.fillStyle='#fff6';c.beginPath();c.arc((ob.x-.9)*u,(ob.y-.9)*u,u*.9,0,6.2832);c.fill();c.restore();continue}
          c.save();c.shadowColor='#e6a0c4';c.shadowBlur=u*1.8;c.fillStyle='#e6a0c4';c.beginPath();
          const by=ob.top?CE:FL,ty=ob.top?CE+ob.h:FL-ob.h;c.moveTo(ob.x*u,by*u);c.lineTo((ob.x+ob.w/2)*u,ty*u);c.lineTo((ob.x+ob.w)*u,by*u);c.closePath();c.fill();c.restore();
        }
        for(const q of trail){c.globalAlpha=Math.max(0,q.l/.35)*.45;c.fillStyle='#b9a8ec';c.beginPath();c.arc(q.x*u,q.y*u,R*u*(q.l/.35),0,6.2832);c.fill()}
        for(const q of parts){c.globalAlpha=Math.max(0,q.life/q.max);c.fillStyle=q.c;c.fillRect(q.x*u,q.y*u,u*.9,u*.9)}
        c.globalAlpha=1;
        if(!dead){
          const sq=1+flipT*1.2;c.save();c.translate(PX*u,y*u);c.scale(1/sq,sq);c.shadowColor='#b9a8ec';c.shadowBlur=u*2.6;
          const gr=c.createRadialGradient(-u*.8,-u*.8*g,u*.4,0,0,R*u);gr.addColorStop(0,'#efe8ff');gr.addColorStop(1,'#8f78e0');c.fillStyle=gr;c.beginPath();c.arc(0,0,R*u,0,6.2832);c.fill();
          c.fillStyle='#120d26';c.beginPath();c.arc(u*.9,-u*.5*g,u*.55,0,6.2832);c.fill();c.restore();
        }
      },
      key(e,tp){
        const k=e.key;if(tp!=='down'){return k===' '||k==='ArrowUp'||k==='ArrowDown'||k==='w'||k==='W'||k==='s'||k==='S'}
        if(e.repeat)return true;
        if(k===' ')setG(-g);else if(k==='ArrowUp'||k==='w'||k==='W')setG(-1);else if(k==='ArrowDown'||k==='s'||k==='S')setG(1);else return false;
        return true;
      },
      pointer(tp){if(tp==='down')setG(-g)},
      dir(dx,dy){if(dy<0)setG(-1);else if(dy>0)setG(1)},
      onOpt(k){if(k==='trail')return true}
    };
  }
});

function homeMeta(){
  const ar=lang==='ar';
  const sc=store.get('xo-score',{X:0,O:0,D:0});
  $('#metaXo').textContent=(ar?'يدعم اللعب أونلاين · انتصاراتك ':'ONLINE PLAY · Your wins ')+(+store.get('xo-wins',0)||0);
  let b=0;['solid','wrap'].forEach(w=>['chill','normal','fast','insane'].forEach(s=>{b=Math.max(b,store.get('best-'+w+'-'+s,0))}));
  $('#metaSn').textContent=(ar?'أفضل نتيجة ':'Best ')+b;
  const pr=store.get('maze-prog',null),st=pr&&Array.isArray(pr.stars)?pr.stars:[];
  $('#metaMz').textContent=(ar?'المراحل ':'Levels ')+st.filter(x=>x>0).length+'/30 · '+st.reduce((a,c)=>a+c,0)+(ar?' نجمة':' stars');
  let ob=0;['chill','normal','fast'].forEach(s=>{ob=Math.max(ob,store.get('orbit-best-'+s,0))});
  $('#metaOr').textContent=(ar?'أفضل نتيجة ':'Best ')+ob;
  Object.keys(EXTRA).forEach(k=>EXTRA[k].meta());
}
const screens={home:$('#home'),xo:$('#xo'),snake:$('#snake'),maze:$('#maze'),orbit:$('#orbit')};
Object.keys(EXTRA).forEach(k=>{screens[k]=$('#'+k)});
const GAMES={xo:XO,snake:SN,maze:MZ,orbit:OR};
Object.keys(EXTRA).forEach(k=>{GAMES[k]=EXTRA[k]});
const TITLES={xo:'xo_name',snake:'snake_name',maze:'maze_name',orbit:'orbit_name'};
let curScreen='home';
function closeDrawers(){$$('.drawer').forEach(d=>d.classList.remove('open'));$('#scrim').classList.remove('on')}
function openDrawer(){
  const d=$('.screen:not([hidden]) .drawer');if(!d)return;
  if(GAMES[curScreen])GAMES[curScreen].pause();
  d.classList.add('open');$('#scrim').classList.add('on');
}
$('#btnOpts').addEventListener('click',()=>{if(drawerOpen())closeDrawers();else openDrawer()});
$('#scrim').addEventListener('click',closeDrawers);
$$('[data-close]').forEach(b=>b.addEventListener('click',closeDrawers));
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawerOpen())closeDrawers()});

const fsOK=!!(document.documentElement.requestFullscreen&&document.fullscreenEnabled!==false);
$('#btnFull').hidden=!fsOK;
$('#btnFull').addEventListener('click',()=>{
  try{
    if(document.fullscreenElement){const p=document.exitFullscreen();if(p&&p.catch)p.catch(()=>{})}
    else{const p=document.documentElement.requestFullscreen();if(p&&p.catch)p.catch(()=>{})}
  }catch(e){}
});


/* fit every game to the real visible height */
function setVh(){
  let h=window.innerHeight;
  if(window.visualViewport&&visualViewport.height)h=Math.min(h,visualViewport.height);
  if(screen&&screen.height&&!document.fullscreenElement)h=Math.min(h,screen.height);
  document.documentElement.style.setProperty('--vh',Math.floor(h)+'px');
}
function fitAll(){
  $$('.arena').forEach(a=>{
    const r=a.getBoundingClientRect();if(!r.width||!r.height)return;
    const s=Math.max(120,Math.floor(Math.min(r.width,r.height)))+'px';
    if(a.style.getPropertyValue('--s')!==s)a.style.setProperty('--s',s);
    const cw=a.firstElementChild;if(cw&&cw.classList.contains('cv-wrap'))cw.classList.toggle('tiny',parseInt(s)<330);
  });
}
setVh();
['resize','orientationchange'].forEach(n=>window.addEventListener(n,()=>{setVh();fitAll()}));
if(window.visualViewport)visualViewport.addEventListener('resize',()=>{setVh();fitAll()});
document.addEventListener('fullscreenchange',()=>{setTimeout(()=>{setVh();fitAll()},120)});
if('ResizeObserver' in window){const fro=new ResizeObserver(fitAll);$$('.arena').forEach(a=>fro.observe(a))}
/* Games no longer force full-screen mode on entry. The user can still use the manual full-screen button. */

function route(keep){
  let h=(location.hash||'').replace('#','');if(!screens[h])h='home';
  curScreen=h;closeDrawers();
  Object.keys(screens).forEach(k=>{screens[k].hidden=k!==h});
  document.documentElement.classList.toggle('imm',h!=='home');
  $('#btnBack').hidden=h==='home';
  $('#btnOpts').hidden=!GAMES[h];
  $('#barTitle').textContent=EXTRA[h]?EXTRA[h].title():(TITLES[h]?t(TITLES[h]):'');
  XO.active(h==='xo');SN.active(h==='snake');MZ.active(h==='maze');OR.active(h==='orbit');Object.keys(EXTRA).forEach(k=>EXTRA[k].active(h===k));mini.active(h==='home');
  if(h==='home'){homeMeta();if(window.armnLoadXoRank&&window.armnOnlineApi)window.armnLoadXoRank();}
  setVh();fitAll();setTimeout(()=>{setVh();fitAll()},60);
  if(keep!==true)window.scrollTo(0,0);
}
$('#btnBack').addEventListener('click',()=>{if(document.fullscreenElement){try{const p=document.exitFullscreen();if(p&&p.catch)p.catch(()=>{})}catch(e){}}location.hash='home'});
window.addEventListener('hashchange',()=>route());
document.addEventListener('langchange',()=>route(true));

(function(){const ab=document.getElementById('about'),bt=document.getElementById('btnAbout');
function fill(){document.querySelectorAll('[data-ar][data-en]').forEach(e=>{if(ab.contains(e)||e===bt)e.textContent=document.documentElement.lang==='ar'?e.dataset.ar:e.dataset.en})}
function open(){fill();ab.hidden=false;document.getElementById('abClose').focus()}
function close(){ab.hidden=true;bt.focus()}
bt.addEventListener('click',open);document.getElementById('abClose').addEventListener('click',close);
ab.addEventListener('click',e=>{if(e.target===ab)close()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!ab.hidden)close()});
document.addEventListener('langchange',fill);fill();})();
applyLang();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
})();
