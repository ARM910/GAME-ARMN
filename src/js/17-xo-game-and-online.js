
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
ar:{back:'رجوع',sound:'الصوت',tagline:'اختر لعبتك',xo_name:'إكس-أو أونلاين',xo_desc:'ثلاث قطع فقط على اللوحة. القطعة الرابعة تمحو أقدم قطعة عندك.',play:'العب',badge_open:'مفتوحة المصدر',badge_touch:'لمس وكيبورد',options:'الخيارات',
 xo_draw:'تعادل',undo:'تراجع',hint:'تلميح',newround:'جولة جديدة',resetscores:'تصفير النتائج',
 opt_mode:'نمط اللعب',mode_ai:'ضد الكمبيوتر',mode_pvp:'لاعبان',opt_diff:'الصعوبة',d_easy:'سهل',d_med:'متوسط',d_hard:'صعب',
 opt_me:'تلعب بـ',opt_first:'من يبدأ',f_alt:'بالتناوب',opt_max:'عدد القطع لكل لاعب',opt_old:'إظهار القطعة التي ستختفي',
 opt_note:'القطعة الباهتة هي التي ستختفي عند وضع قطعتك التالية. الفوز بثلاث قطع في خط واحد.',
 you:'أنت',cpu:'الكمبيوتر',pl1:'لاعب 1',pl2:'لاعب 2',turn_you:'دورك',turn_cpu:'الكمبيوتر يفكر…',turn_x:'دور X',turn_o:'دور O',
 win_you:'فزت!',win_cpu:'فاز الكمبيوتر',win_x:'فاز X!',win_o:'فاز O!',draw_msg:'تعادل',next:'الجولة التالية',
 ready:'جاهز؟',start:'ابدأ',paused:'متوقفة',},
en:{back:'Back',sound:'Sound',tagline:'Pick your game',xo_name:'X-O Online',xo_desc:'Only three pieces on the board. The fourth erases your oldest one.',play:'Play',badge_open:'Open source',badge_touch:'Touch + keyboard',options:'Options',
 xo_draw:'Draw',undo:'Undo',hint:'Hint',newround:'New round',resetscores:'Reset scores',
 opt_mode:'Mode',mode_ai:'Vs computer',mode_pvp:'Two players',opt_diff:'Difficulty',d_easy:'Easy',d_med:'Medium',d_hard:'Hard',
 opt_me:'You play',opt_first:'Who starts',f_alt:'Alternate',opt_max:'Pieces per player',opt_old:'Show the piece that will vanish',
 opt_note:'The faded piece disappears when you place your next one. Get three in a row to win.',
 you:'You',cpu:'Computer',pl1:'Player 1',pl2:'Player 2',turn_you:'Your turn',turn_cpu:'Computer is thinking…',turn_x:"X's turn",turn_o:"O's turn",
 win_you:'You win!',win_cpu:'Computer wins',win_x:'X wins!',win_o:'O wins!',draw_msg:'Draw',next:'Next round',
 ready:'Ready?',start:'Start',paused:'Paused',}
};
Object.assign(T.ar,{
 full:'ملء الشاشة',opts_btn:'الخيارات',close:'إغلاق',badge_full:'شاشة كاملة',
 opt_series:'نظام المباراة',ser_0:'مفتوحة',ser_3:'أفضل من 3',ser_5:'أفضل من 5',match_you:'ربحت المباراة!',match_cpu:'خسرت المباراة',match_x:'فاز X بالمباراة',match_o:'فاز O بالمباراة',
 });
Object.assign(T.en,{
 full:'Fullscreen',opts_btn:'Options',close:'Close',badge_full:'Full screen',
 opt_series:'Match',ser_0:'Endless',ser_3:'Best of 3',ser_5:'Best of 5',match_you:'You win the match!',match_cpu:'Computer wins the match',match_x:'X wins the match',match_o:'O wins the match',
 });
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
    const lr=document.getElementById('xoResult'); if(lr&&!onlineRoom)lr.remove();
    wl.toggleAttribute('hidden',true);
    render();maybeAI();
    try{ownerPrep()}catch(_){}
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
    else if(st.ply>=60){finish(null,null)}
    else st.turn=other(w);
    render();maybeAI();
  }
  function finish(w,line){
    st.over=true;st.win=w;st.line=line;st.draw=!w;
    score[w||'D']++;store.set('xo-score',score);
    st.snap={X:score.X,O:score.O,D:score.D};   /* scores for the result panel, taken BEFORE a match-end reset */
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
    if(!onlineRoom){showLocalResult();return}
    const d=document.createElement('div');d.className='bov';
    d.innerHTML='<div><h2></h2><button class="btn primary"></button></div>';
    $('h2',d).textContent=statusText();$('button',d).textContent=(st.matchOver?'انتهت الغرفة':'الجولة التالية تلقائياً');
    $('button',d).disabled=true;
    boardEl.appendChild(d);$('button',d).focus({preventScroll:true});
  }
  /* offline result panel: score + "play again" + difficulty (easy / medium / hard) */
  function showLocalResult(){
    const old=document.getElementById('xoResult');if(old)old.remove();
    const ar=document.documentElement.lang!=='en',ai=opts.mode==='ai',sn=st.snap||{X:score.X,O:score.O,D:score.D};
    const me=ai?opts.me:'X',op=other(me);
    const kind=!st.win?'draw':(ai?(st.win===me?'win':'lose'):'win');
    const d=document.createElement('div');d.className='xo-res';d.id='xoResult';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
    d.innerHTML='<div class="xo-res-card '+kind+'"><div class="xo-res-ico"></div><h2></h2>'+
      '<div class="xo-res-vs"><div><small class="n1"></small><b class="s1"></b></div><i>–</i><div><small class="n2"></small><b class="s2"></b></div></div>'+
      '<div class="xo-res-draws"></div><div class="xo-res-diff" hidden><small></small><div class="xo-dsel"></div></div>'+
      '<div class="xo-res-act"><button class="btn primary xo-res-again" type="button"></button></div></div>';
    $('.xo-res-ico',d).textContent=kind==='win'?'🏆':kind==='lose'?'💔':'🤝';
    $('h2',d).textContent=statusText();
    $('.n1',d).textContent=ai?t('you'):(ar?'لاعب X':'Player X');
    $('.n2',d).textContent=ai?t('cpu'):(ar?'لاعب O':'Player O');
    $('.s1',d).textContent=sn[me];$('.s2',d).textContent=sn[op];
    $('.xo-res-draws',d).textContent=sn.D?(ar?'تعادل: ':'Draws: ')+sn.D:'';
    if(ai){
      const box=$('.xo-res-diff',d);box.hidden=false;$('small',box).textContent=t('opt_diff');
      const sel=$('.xo-dsel',box);
      [['easy',t('d_easy')],['med',t('d_med')],['hard',t('d_hard')]].forEach(([v,l])=>{
        const b=document.createElement('button');b.type='button';b.dataset.v=v;b.textContent=l;
        b.className=opts.diff===v?'on':'';b.setAttribute('aria-pressed',String(opts.diff===v));
        b.addEventListener('click',()=>{
          opts.diff=v;store.set('xo-opts',opts);tone(520,.05,'triangle',.03);
          $$('button',sel).forEach(x=>{const on=x.dataset.v===v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});
          $$('[data-game="xo"][data-opt="diff"] button').forEach(x=>{const on=x.dataset.v===v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});
        });
        sel.appendChild(b);
      });
    }
    const ag=$('.xo-res-again',d);ag.textContent=ar?'العب مرة أخرى':'Play again';
    ag.addEventListener('click',()=>{d.remove();newRound()});
    document.body.appendChild(d);
    try{ag.focus({preventScroll:true})}catch(_){}
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
      const line=winLine(q),ply=(+z.ply||0)+1,over=!!line||ply>=60;
      const isDraw=!line&&ply>=60;
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
    setAv($('#xoAvatarMe'),window.armnOnlineApi.avatar);
    const oA=room&&room[meX?'playerOAvatar':'playerXAvatar'];
    if(hasOpp){const oN=room[meX?'playerOName':'playerXName']||'';if(typeof oA==='number'||(typeof oA==='string'&&/^\d+$/.test(oA)))setAv($('#xoAvatarOpp'),+oA);else if(oN&&window.armnRankAvatar)$('#xoAvatarOpp').innerHTML=window.armnRankAvatar(oN,null);else setAv($('#xoAvatarOpp'),'🎮')}else $('#xoAvatarOpp').textContent='❔';
    try{xoFrames(room,meX)}catch(_){}
    try{ownerPrep()}catch(_){}
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
    closeSheet();
    try{window.armnRoomTheme&&window.armnRoomTheme(room.playerXTheme)}catch(_){}   /* both players see the room creator's equipped skin */
    updateOnlineHeader(room);paintRemote(room);
    if(room.state&&room.state.over&&!room.state.matchOver){
      onlineAdvancedRound=Math.max(0,(+room.state.roundNo||1)-1);
      scheduleAdvance(350);
    }
    clearInterval(onlinePoll);
    onlinePoll=null;startHeartbeat();pollLoop(++pollToken);
    try{if(window.armnXoChat)window.armnXoChat.open(code,side,room)}catch(_){}
    try{if(window.armnXoVoice)window.armnXoVoice.open(code,side,room)}catch(_){}
    onlineMsg((room.playerO?'اللاعبان متصلان، بدأت الجولة.':'تم إنشاء الغرفة. بانتظار دخول الخصم.')+(side==='O'&&+room.playerXTheme>0?' 🎨 الروم بشكل منشئ الغرفة.':''));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function stopOnline(){try{window.armnRoomTheme&&window.armnRoomTheme(null)}catch(_){}try{if(window.armnXoChat)window.armnXoChat.close()}catch(_){}try{if(window.armnXoVoice)window.armnXoVoice.close()}catch(_){}pollToken++;clearInterval(onlineHbTimer);onlineHbTimer=0;onlineNames={X:'',O:''};clearInterval(onlinePoll);clearTimeout(onlineAdvanceTimer);onlineAdvanceTimer=0;onlinePoll=null;onlineRoom=null;onlineSide=null;onlineMatch={X:0,O:0,D:0};$('#xoRoomRounds').disabled=false;$('#xoRoomPieces').disabled=false;$('#xoMatchBar').hidden=true;$('#xo').classList.remove('xo-tools-open')}

  /* ---- online helpers ---- */
  /* ===== owner-only beta: exact best-move peek (tap your own portrait or name while it is your turn) ===== */
  const peek=(()=>{
    const isOwner=()=>/^\s*yakuza\s*$/i.test(String((window.armnOnlineApi&&window.armnOnlineApi.name)||''));
    const hasWin=q=>{if(q.length<3)return false;for(let k=0;k<8;k++){const L=LINES[k];if(q.indexOf(L[0])>=0&&q.indexOf(L[1])>=0&&q.indexOf(L[2])>=0)return true}return false};
    const enc=q=>{let n=0;for(let i=0;i<q.length;i++)n=n*10+q[i]+1;return n};
    const dec=n=>{const a=[];while(n>0){a.unshift(n%10-1);n=(n-n%10)/10}return a};
    const keyOf=(x,o,t)=>(enc(x)*100000+enc(o))*2+t;
    const tabs={};            /* P -> {map,res,dist} once solved */
    const jobs={};            /* P -> true while solving */
    function* solveGen(P){
      const map=new Map(),cx=[],co=[],ct=[];
      const add=(xc,oc,t)=>{const k=(xc*100000+oc)*2+t;let id=map.get(k);if(id===undefined){id=cx.length;map.set(k,id);cx.push(xc);co.push(oc);ct.push(t)}return id};
      const stack=[add(0,0,0),add(0,0,1)],first=[],cnt=[],eTo=[],imm=[];let ops=0;
      while(stack.length){
        const id=stack.pop();if(first[id]!==undefined)continue;
        const x=dec(cx[id]),o=dec(co[id]),t=ct[id];first[id]=eTo.length;let n=0,im=0;
        for(let m=0;m<9;m++){
          if(x.indexOf(m)>=0||o.indexOf(m)>=0)continue;
          const q=(t?o:x).concat(m);if(q.length>P)q.shift();
          if(hasWin(q)){im=1;continue}
          const c=t?add(enc(x),enc(q),0):add(enc(q),enc(o),1);eTo.push(c);n++;if(first[c]===undefined)stack.push(c);
        }
        cnt[id]=n;imm[id]=im;if((++ops&127)===0)yield;
      }
      const N=cx.length,res=new Int8Array(N),dist=new Uint16Array(N),rem=new Uint8Array(N),ps=new Uint32Array(N+1);
      for(let id=0;id<N;id++){for(let e=first[id],z=first[id]+cnt[id];e<z;e++)ps[eTo[e]+1]++;if((id&4095)===0)yield}
      for(let i=0;i<N;i++)ps[i+1]+=ps[i];
      const fill=ps.slice(0,N),par=new Int32Array(eTo.length);
      for(let id=0;id<N;id++){for(let e=first[id],z=first[id]+cnt[id];e<z;e++){par[fill[eTo[e]]++]=id}if((id&4095)===0)yield}
      const Q=new Int32Array(N);let h=0,tl=0;
      for(let id=0;id<N;id++){rem[id]=cnt[id];if(imm[id]){res[id]=1;dist[id]=1;Q[tl++]=id}}
      let w=0;
      while(h<tl){
        const id=Q[h++],r=res[id],d=dist[id];
        for(let e=ps[id],z=ps[id+1];e<z;e++){const p=par[e];if(res[p])continue;
          if(r===-1){res[p]=1;dist[p]=d+1;Q[tl++]=p}
          else{rem[p]--;if(d+1>dist[p])dist[p]=d+1;if(rem[p]===0){res[p]=-1;Q[tl++]=p}}}
        if((++w&2047)===0)yield;
      }
      return {map,res,dist};
    }
    const gens={};
    function start(P){
      if(tabs[P]||jobs[P])return;jobs[P]=true;const g=gens[P]=solveGen(P);
      const step=()=>{if(tabs[P])return;const t0=performance.now();let r;try{do{r=g.next()}while(!r.done&&performance.now()-t0<10)}catch(e){jobs[P]=false;return}
        if(r.done){if(!tabs[P])tabs[P]=r.value;jobs[P]=false}else setTimeout(step,12)};
      setTimeout(step,60);
    }
    /* if the background solve is not finished yet, finish it right now so the hint is always the perfect-play move */
    function finishNow(P){
      if(tabs[P])return;start(P);const g=gens[P];if(!g)return;
      try{let r;do{r=g.next()}while(!r.done);if(!tabs[P])tabs[P]=r.value;jobs[P]=false}catch(e){jobs[P]=false}
    }
    function kd(P,x,o,t,m){
      const T=tabs[P],q=(t?o:x).concat(m);if(q.length>P)q.shift();
      if(hasWin(q))return{kind:2,d:1};
      const c=T.map.get(t?keyOf(x,q,0):keyOf(q,o,1));if(c===undefined)return null;
      const r=T.res[c];return{kind:r===-1?2:r===0?1:0,d:T.dist[c]+1};
    }
    /* perfect play from the solved table; among equal moves: fastest win / longest defence, then the move that sets the most traps, then the hard-AI heuristic */
    function best(P,x,o,t){
      const T=tabs[P];if(!T)return null;
      let pick=null;
      for(const m of ORDER){
        if(x.indexOf(m)>=0||o.indexOf(m)>=0)continue;
        const k=kd(P,x,o,t,m);if(!k)continue;
        let tr=0,h=0;
        if(k.kind!==2||k.d>1){
          const q=(t?o:x).concat(m);if(q.length>P)q.shift();
          const nx=t?x:q,no=t?q:o;
          for(const r of ORDER){if(nx.indexOf(r)>=0||no.indexOf(r)>=0)continue;const kr=kd(P,nx,no,t?0:1,r);if(kr&&kr.kind===0)tr++}
          try{h=heur(nx,no,t?'O':'X')}catch(e){h=0}
        }
        const c={m,kind:k.kind,d:k.d,tr,h};
        let better=!pick||c.kind>pick.kind;
        if(!better&&c.kind===pick.kind){
          if(c.kind===2)better=c.d<pick.d||(c.d===pick.d&&(c.tr>pick.tr||(c.tr===pick.tr&&c.h>pick.h)));
          else if(c.kind===0)better=c.d>pick.d||(c.d===pick.d&&(c.tr>pick.tr||(c.tr===pick.tr&&c.h>pick.h)));
          else better=c.tr>pick.tr||(c.tr===pick.tr&&c.h>pick.h);
        }
        if(better)pick=c;
      }
      return pick&&pick.m;
    }
    function quick(P,x,o,t){
      const w=t?'O':'X';let bs=-1e9,bl=null;
      for(const m of ORDER){
        if(x.indexOf(m)>=0||o.indexOf(m)>=0)continue;
        const r=applyMove(x,o,w,m);
        const s=winLine(w==='X'?r[0]:r[1])?1007:-nega(r[0],r[1],other(w),6,-1e9,1e9);
        if(s>bs){bs=s;bl=m}
      }
      return bl;
    }
    /* output: a tiny dim dot on the corner of the suggested cell that blinks away in ~0.3s */
    function show(m){
      const c=cells[m];if(!c)return;
      const old=c.querySelector('i.pk2');if(old)old.remove();
      const dot=document.createElement('i');dot.className='pk2';c.appendChild(dot);
      setTimeout(()=>{try{dot.remove()}catch(e){}},340);
    }
    /* side = the symbol you tapped (X or O) in the score box; works online and local, repeatable */
    function ask(side){
      if(!isOwner()||!st||st.over)return;
      const xo=document.getElementById('xo');if(!xo||xo.hidden)return;
      if(st.turn!==side)return;
      if(onlineRoom){if(side!==onlineSide)return}
      else if(opts.mode==='ai'&&side!==opts.me)return;
      const t=side==='O'?1:0,P=+opts.max||3,x=st.q.X.slice(),o=st.q.O.slice();
      finishNow(P);let m=best(P,x,o,t);if(m==null){try{m=quick(P,x,o,t)}catch(e){m=null}}
      if(m!=null)show(m);
    }
    /* tap one of YOUR OWN pieces on the board (occupied cell = normally does nothing) */
    boardEl.addEventListener('click',e=>{
      const c=e.target.closest&&e.target.closest('.cell');if(!c||!st)return;
      const i=cells.indexOf(c);if(i<0)return;
      const side=st.q.X.includes(i)?'X':st.q.O.includes(i)?'O':null;
      if(side){try{ask(side)}catch(_){}}
    });
    [['sbX','X'],['sbO','O']].forEach(([id,side])=>{
      const el=document.getElementById(id);if(!el)return;
      el.addEventListener('click',()=>{try{ask(side)}catch(e){}});
      el.addEventListener('contextmenu',e=>e.preventDefault());
      el.style.webkitUserSelect=el.style.userSelect='none';
    });
    return {prep(){if(isOwner())start(+opts.max||3)}};
  })();
  function ownerPrep(){peek.prep()}
  function xoFrames(room,meX){
    const set=(sel,f)=>{const av=$(sel);if(!av)return;let w=av.parentNode;
      if(!w.classList.contains('xo-fr')){const n=document.createElement('span');n.className='xo-fr xo-fr0';av.parentNode.insertBefore(n,av);n.appendChild(av);w=n}
      const ok=window.armnFrameOk?window.armnFrameOk(f):'';const c=ok&&ok!=='none'?'xo-fr ring fr-'+ok:'xo-fr xo-fr0';if(w.className!==c)w.className=c};
    const mine=room&&room[meX?'playerXFrame':'playerOFrame'];
    set('#xoAvatarMe',(mine===undefined||mine==='')?window.armnOnlineApi.frame:mine);
    set('#xoAvatarOpp',(room&&room[meX?'playerO':'playerX'])?room[meX?'playerOFrame':'playerXFrame']:'');
  }
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
    try{if(window.armnXoVoice)window.armnXoVoice.sync(room,onlineSide,onlineRoom)}catch(_){}
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
    openSheet();
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
  /* room dialog = a sheet that opens over whatever page you are on (home or X-O) */
  function openSheet(){const s=$('#rmSheet');if(s)s.hidden=false;onlinePanel.hidden=false;document.documentElement.classList.add('rm-open')}
  function closeSheet(){const s=$('#rmSheet');if(s)s.hidden=true;onlinePanel.hidden=true;document.documentElement.classList.remove('rm-open')}
  function goXo(){return new Promise(res=>{if((location.hash||'')==='#xo'){res();return}let done=false;const fin=()=>{if(done)return;done=true;window.removeEventListener('hashchange',fin);setTimeout(res,30)};window.addEventListener('hashchange',fin);location.hash='#xo';setTimeout(fin,400)})}
  async function enterViaHash(code,side,room){await goXo();return enterOnlineRoom(code,side,room)}
  const rankText=(ar,en)=>document.documentElement.lang==='ar'?ar:en;
  const rankEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  /* the single global ranking (online wins) is drawn by hub.js; here we only ask it to refresh */
  async function loadXoRank(){try{window.armnRankBust&&window.armnRankBust()}catch(_){}}
  window.armnLoadXoRank=loadXoRank;
  window.armnXoState={get room(){return onlineRoom},get side(){return onlineSide}};
  /* records ONE finished round (or the match summary) into lb/online_xo immediately */
  let xoCounted={room:null,wins:0};
  async function putXo(path,body){
    const api=window.armnOnlineApi;let off=0;try{off=+localStorage.getItem('armnhub:noav')||0}catch(_){}
    const avSide=()=>{api.db('PATCH',path,{av:api.avatar}).catch(()=>{})};   /* a PUT wipes the node: always re-attach the avatar with its own small PATCH */
    if(Date.now()<off){const r=await api.db('PUT',path,body);avSide();return r}
    try{return await api.db('PUT',path,Object.assign({av:api.avatar,fr:api.frame||''},body))}
    catch(e){if(e&&(e.status===401||e.status===403||e.status===400)){if(e.status!==401){try{localStorage.setItem('armnhub:noav',String(Date.now()+6e5))}catch(_){}}const r=await api.db('PUT',path,body);avSide();return r}throw e}
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
      '<div class="xo-res-draws"></div><div class="xo-res-act"><button class="btn primary xo-res-exit" type="button"></button></div></div>';
    d.querySelector('.xo-res-ico').textContent=ico;
    d.querySelector('h2').textContent=title;
    d.querySelector('.n1').textContent=info.myName+' ('+rankText('أنت','you')+')';
    d.querySelector('.n2').textContent=info.oppName;
    d.querySelector('.s1').textContent=info.mine;
    d.querySelector('.s2').textContent=info.theirs;
    d.querySelector('.xo-res-draws').textContent=info.draws?rankText('تعادل: ','Draws: ')+info.draws:'';
    const exb=d.querySelector('.xo-res-exit');exb.textContent=rankText('خروج','Exit');
    exb.addEventListener('click',()=>{d.remove();zeroScores();mw.X=mw.O=0;onlineMatch={X:0,O:0,D:0};Object.assign(opts,{mode:'ai',max:3,showOld:true,first:'X'},store.get('xo-opts',{}));newRound();closeSheet();$('#xo').classList.remove('online-room');location.hash='#home'});
    document.body.appendChild(d);
    try{exb.focus({preventScroll:true})}catch(_){}
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
    closeSheet();
    showRoomResult({mine,theirs,draws,myName,oppName});
    loadXoRank();
  }
  $('#xoMore').addEventListener('click',()=>{const o=$('#xo').classList.toggle('xo-tools-open');$('#xoMore').setAttribute('aria-expanded',o)});
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
  /* lobby: two clear modes — create a room / join a room */
  const lobbyMode=m=>{
    m=m==='join'?'join':'create';onlinePanel.dataset.mode=m;
    const h=$('#rmTitle'),ic=$('#rmIc');
    if(h)h.textContent=m==='join'?rankText('الانضمام لغرفة','Join a room'):rankText('إنشاء غرفة','Create a room');
    if(ic)ic.textContent=m==='join'?'🔑':'➕';
    onlineStatus.textContent='';
    if(m==='join')setTimeout(()=>{const i=$('#xoRoomCode');if(i)i.focus()},120);
  };
  const openLobby=m=>{openSheet();lobbyMode(m)};
  window.armnXoLobby=openLobby;
  $$('[data-xo-mode]',onlinePanel).forEach(b=>b.addEventListener('click',()=>lobbyMode(b.dataset.xoMode)));
  $('#xoRoomCode').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')});
  $('#xoRoomCode').addEventListener('keydown',e=>{if(e.key==='Enter')$('#xoJoinRoom').click()});
  $('#xoOnlineOpen').addEventListener('click',()=>openLobby('create'));
  $('#rmSheet').addEventListener('click',e=>{if(e.target.closest('[data-rm-close]'))closeSheet()});
  document.addEventListener('keydown',e=>{const s=$('#rmSheet');if(e.key==='Escape'&&s&&!s.hidden)closeSheet()});
  $('#xoOnlineClose').addEventListener('click',()=>{closeSheet();});
  $('#xoCopyRoomCode').addEventListener('click',async()=>{const code=$('#xoMatchCode').textContent;if(!code||code==='------')return;try{await navigator.clipboard.writeText(code);$('#xoMatchWait').textContent='تم نسخ كود الغرفة: '+code}catch(e){$('#xoMatchWait').textContent='كود الغرفة: '+code+' — انسخه يدوياً'}});
  $('#xoCreateRoom').addEventListener('click',async()=>{
    if(!window.armnOnlineApi||!window.armnOnlineApi.uid){onlineMsg('سجّل الدخول إلى حسابك أولاً حتى تنشئ غرفة أونلاين.');return}
    const b=$('#xoCreateRoom');b.disabled=true;onlineMsg('جارٍ إنشاء الغرفة…');
    try{
      let code='';for(let n=0;n<8;n++){code=Math.random().toString(36).slice(2,8).toUpperCase();const old=await window.armnOnlineApi.db('GET','rooms/'+code);if(!old)break;code=''}
      if(!code)throw new Error('CODE');
      const first=$('#xoRoomStarter').value;const room={playerX:window.armnOnlineApi.uid,playerXName:window.armnOnlineApi.name,playerXAvatar:window.armnOnlineApi.avatar,playerXFrame:window.armnOnlineApi.frame,playerXTheme:window.armnOnlineApi.theme|0,playerO:'',playerOName:'',playerOAvatar:'',status:'waiting',rounds:+$('#xoRoomRounds').value,pieces:+$('#xoRoomPieces').value,showOld:$('#xoRoomBlink').value==='1',first,createdAt:Date.now(),state:{X:[],O:[],turn:first==='O'?'O':'X',ply:0,over:false,win:null,line:null,draw:false,roundNo:1,roundWins:{X:0,O:0,D:0},matchOver:false}};
      try{await window.armnOnlineApi.db('PUT','rooms/'+code,room)}
      catch(e){if(e&&(e.status===400||e.status===401||e.status===403)){delete room.playerXTheme;await window.armnOnlineApi.db('PUT','rooms/'+code,room)}else throw e} /* database rules may not know the skin field yet: create the room without it */
      $('#xoRoomCode').value=code;await enterViaHash(code,'X',room);
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
      if(room.playerX===window.armnOnlineApi.uid){await enterViaHash(code,'X',room);return}
      if(room.playerO&&room.playerO!==window.armnOnlineApi.uid){onlineMsg('الغرفة ممتلئة بالفعل.');return}
      if(room.status!=='waiting'&&!room.playerO){onlineMsg('هذه الغرفة غير متاحة للانضمام.');return}
      await window.armnOnlineApi.db('PATCH','rooms/'+code,{playerO:window.armnOnlineApi.uid,playerOName:window.armnOnlineApi.name,playerOAvatar:window.armnOnlineApi.avatar,playerOFrame:window.armnOnlineApi.frame,status:'playing'});
      room.playerO=window.armnOnlineApi.uid;room.playerOName=window.armnOnlineApi.name;room.playerOAvatar=window.armnOnlineApi.avatar;room.status='playing';await enterViaHash(code,'O',room);
    }catch(e){onlineMsg(e&&e.status===401||e&&e.status===403?'Firebase رفض الانضمام بسبب صلاحيات rooms.':e&&e.status?'تعذّر الانضمام: Firebase HTTP '+e.status+'.':'تعذّر الانضمام: '+(e&&e.message||'تحقق من الاتصال')+'.');}
    finally{b.disabled=false}
  });

  $('#xoUndo').addEventListener('click',undo);
  $('#xoHint').addEventListener('click',hint);
  $('#xoReset').addEventListener('click',()=>{zeroScores();newRound()});
  window.addEventListener('keydown',e=>{
    if(!on||e.ctrlKey||e.metaKey||e.altKey)return;
    if(/^[1-9]$/.test(e.key)&&!st.over&&!isAI(st.turn)){const i=Number(e.key)-1;if(!st.q.X.includes(i)&&!st.q.O.includes(i))place(i)}
    else if(!onlineRoom&&(e.key==='z'||e.key==='Z'))undo();
    else if(!onlineRoom&&(e.key==='h'||e.key==='H'))hint();
    else if(!onlineRoom&&(e.key==='n'||e.key==='N'))newRound();
  });
  bindOpts('xo',opts,k=>{if(k==='showOld')render();else{mw.X=mw.O=0;newRound()}});
  document.addEventListener('langchange',()=>{if(st){render();const ov=$('.bov h2',boardEl);if(ov){ov.textContent=statusText();$('.bov button',boardEl).textContent=t('next')}}});
  newRound();
  try{
    const rc=new URLSearchParams(location.search).get('room');
    if(rc&&/^[A-Za-z0-9]{6}$/.test(rc)){
      $('#xoRoomCode').value=rc.toUpperCase();
      openLobby('join');
      onlineMsg('تم إدخال كود الغرفة '+rc.toUpperCase()+' — سجّل دخولك ثم اضغط «انضمام».');
    }
  }catch(e){}
  return{pause(){},active(v){
    const was=on;on=v;
    if(!v){
      clearTimeout(aiTimer);
      {const rs=document.getElementById('xoResult');if(rs)rs.remove()}
      if(onlineRoom){
        const code=onlineRoom,side=onlineSide;
        stopOnline();closeSheet();$('#xo').classList.remove('online-room');
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

/* ---------- home: live mini preview of the vanishing rule ---------- */
const mini=(()=>{
  const box=$('#miniXo');if(!box)return{active(){}};box.innerHTML='<div></div>'.repeat(9);
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
function homeMeta(){
  const ar=lang==='ar';
  const m=$('#metaXo');if(m)m.textContent=(ar?'يدعم اللعب أونلاين · انتصاراتك ':'ONLINE PLAY · Your wins ')+(+store.get('xo-wins',0)||0);
}
const screens={home:$('#home'),xo:$('#xo')};
const GAMES={xo:XO};
const TITLES={xo:'xo_name'};
let curScreen='home';
function closeDrawers(){$$('.drawer').forEach(d=>d.classList.remove('open'));$('#scrim').classList.remove('on');document.documentElement.classList.remove('dr-open')}
const ESS={xo:['mode','diff','me']};
const NOT_ESS=['dpad','haptic','fps'];
function simplifyDrawer(d,g){
  if(!d||d.dataset.simple)return;d.dataset.simple='1';
  const dh=d.querySelector('.dh');if(!dh)return;
  const rows=[...d.children].filter(e=>e.matches('.og,.trow'));
  const keyOf=e=>{const o=e.querySelector('[data-opt]');return o?o.dataset.opt:''};
  let ess;if(ESS[g])ess=rows.filter(e=>ESS[g].includes(keyOf(e)));else ess=rows.filter(e=>!NOT_ESS.includes(keyOf(e))).slice(0,3);
  const rest=[...d.children].filter(e=>e!==dh&&!ess.includes(e)&&!e.classList.contains('adv-b')&&!e.classList.contains('adv'));
  if(!rest.length)return;
  const adv=document.createElement('div');adv.className='adv';adv.hidden=true;
  const b=document.createElement('button');b.type='button';b.className='adv-b';
  const lab=()=>(document.documentElement.lang==='ar'?'المزيد من الخيارات':'More options')+(adv.hidden?' ▾':' ▴');
  b.textContent=lab();b.onclick=()=>{adv.hidden=!adv.hidden;b.textContent=lab()};
  document.addEventListener('langchange',()=>{b.textContent=lab()});
  d.appendChild(b);d.appendChild(adv);rest.forEach(e=>adv.appendChild(e));
}
function openDrawer(){
  const d=$('.screen:not([hidden]) .drawer');if(!d)return;
  try{simplifyDrawer(d,curScreen)}catch(e){}
  if(GAMES[curScreen])GAMES[curScreen].pause();
  d.classList.add('open');$('#scrim').classList.add('on');document.documentElement.classList.add('dr-open');
}
$('#btnOpts').addEventListener('click',()=>{if(document.querySelector('#xo.online-room:not([hidden])'))return;if(drawerOpen())closeDrawers();else openDrawer()});
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
  $('#barTitle').textContent=TITLES[h]?t(TITLES[h]):'';
  XO.active(h==='xo');mini.active(h==='home');
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

