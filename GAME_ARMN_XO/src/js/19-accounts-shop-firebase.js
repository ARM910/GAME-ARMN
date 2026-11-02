
(function(){
'use strict';
const $=s=>document.querySelector(s),L=(a,e)=>document.documentElement.lang==='ar'?a:e,K='armnacc:';
const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(K+k));return v==null?d:v}catch(e){return d}};
const sv=(k,v)=>{try{if(v===null)localStorage.removeItem(K+k);else localStorage.setItem(K+k,JSON.stringify(v))}catch(e){}};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const UOK=/^[a-z0-9_]{3,16}$/,BAD=['__proto__','constructor','prototype','hasownproperty','tostring'];const goodName=u=>typeof u==='string'&&UOK.test(u)&&!BAD.includes(u);
const EMAILOK=/^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
/* New accounts: only real mailbox providers (Gmail, Yahoo, iCloud, Outlook/Hotmail, Proton, AOL...) with a valid mailbox name */
const MAIL_DOMAINS=['gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','yahoo.fr','yahoo.de','yahoo.es','yahoo.it','yahoo.in','yahoo.com.br','ymail.com','rocketmail.com','icloud.com','me.com','mac.com','outlook.com','outlook.sa','hotmail.com','hotmail.co.uk','hotmail.fr','live.com','msn.com','protonmail.com','proton.me','pm.me','aol.com','zoho.com','gmx.com','gmx.net','mail.com','yandex.com'];
const MAIL_TYPOS={'gmial.com':'gmail.com','gmai.com':'gmail.com','gmail.co':'gmail.com','gamil.com':'gmail.com','gnail.com':'gmail.com','gmail.con':'gmail.com','gmail.cm':'gmail.com','gmil.com':'gmail.com','yaho.com':'yahoo.com','yahooo.com':'yahoo.com','yahoo.co':'yahoo.com','yahoo.con':'yahoo.com','hotmial.com':'hotmail.com','hotmail.con':'hotmail.com','outlok.com':'outlook.com','outlook.con':'outlook.com','iclod.com':'icloud.com','icloud.con':'icloud.com','icloud.co':'icloud.com'};
function emailCheck(e){
  e=String(e||'').trim().toLowerCase();
  const m=/^([a-z0-9][a-z0-9._+-]*)@([a-z0-9.-]+\.[a-z]{2,})$/.exec(e);
  if(!m||e.length>254||/\.\./.test(m[1])||/[._+-]$/.test(m[1]))return{code:'BAD_EMAIL'};
  const l=m[1],d=m[2];
  if(MAIL_TYPOS[d])return{code:'EMAIL_TYPO',hint:l+'@'+MAIL_TYPOS[d]};
  if(MAIL_DOMAINS.indexOf(d)<0)return{code:'EMAIL_PROVIDER'};
  if(d==='gmail.com'||d==='googlemail.com'){const g=l.split('+')[0];if(g.length<6||g.length>30||!/^[a-z0-9.]+$/.test(g)||g[0]==='.'||/\.$/.test(g))return{code:'BAD_EMAIL'}}
  if(/^(test|tests|aaa+|abc+|asdf+|qwer+|xxx+|user|email|example|fake|temp|none|no)\d*$/.test(l.replace(/[._]/g,'')))return{code:'BAD_EMAIL'};
  return null;
}
/* ☁ FIREBASE — paste your project's Web API key below (Firebase Console → Project settings → General → Web API Key).
   It is a public identifier, not a secret; your data is protected by the Realtime Database rules. */
const API_KEY='AIzaSyBH_Olhj3QCK8qgxVtL8dQ1L2XchBId3RI';
const CLOUD='https://armn-25ff3-default-rtdb.firebaseio.com';
const IDT='https://identitytoolkit.googleapis.com/v1/accounts:',STS='https://securetoken.googleapis.com/v1/token';
const PK='armn:',SHOPK='_shop';
/* clean up the old local-only accounts (they stored password hashes in the browser) */
try{localStorage.removeItem(K+'users');localStorage.removeItem(K+'cur')}catch(e){}
let users={},cur=null,sess=ld('sess',null),cloudProg={},reloadLater=false,synced=false;
/* OWNER ACCOUNTS: the owner's username(s). The owner earns coins like every other player (no free coins),
   but the whole shop is unlocked for free. An old bug had credited the owner 1,000,000 coins: any balance/total
   at or above OWNER_FIX_AT is treated as that bug's leftover and reset once to OWNER_COINS (everyone can earn it back normally). */
const OWNER_USERS=['yakuza'];const OWNER_COINS=1344,OWNER_FIX_AT=500000;
const isOwnerName=n=>OWNER_USERS.includes(String(n||'').trim().toLowerCase());
function ownerGrant(u){/* unlock every avatar, frame and game theme for the owner (free) */
  if(u._og===3)return;
  try{
    u.own=u.own||{};
    u.own.avatars=Array.from({length:AVATARS.length},(_,i)=>i);
    u.own.frames=FR.map(f=>f[0]);
    u.own.covers=CV.map(c=>c[0]);
    for(const g in G)u.own[g]=C[g].map((_,i)=>i);
    u._og=3;
  }catch(e){/* shop tables not ready yet: try again on the next call */}
}
const me=()=>{const u=users[cur];
  if(u&&isOwnerName(u.u)){
    if((u.pts|0)>=OWNER_FIX_AT||(u.tot|0)>=OWNER_FIX_AT){u.pts=OWNER_COINS;u.tot=OWNER_COINS;u.t=Date.now();u._og=0;setTimeout(()=>{try{save()}catch(e){}},0)}
    ownerGrant(u);
  }
  return u};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ERR={
 EMAIL_EXISTS:['هذا الإيميل مسجّل مسبقاً','This email is already registered'],
 USERNAME_TAKEN:['اسم المستخدم مستخدم، اختر اسماً آخر','Username is taken, pick another'],
 BAD_USERNAME:['اسم المستخدم 3–16 حرفاً: a-z وأرقام و _ فقط','Username: 3–16 chars, a-z, digits and _ only'],
 INVALID_EMAIL:['الإيميل غير صالح','Invalid email address'],
 BAD_EMAIL:['الإيميل غير صالح، اكتب إيميلك الحقيقي','Invalid email address, enter your real email'],
 EMAIL_PROVIDER:['استخدم إيميلاً رسمياً مثل Gmail أو Yahoo أو iCloud أو Outlook','Use an official email such as Gmail, Yahoo, iCloud or Outlook'],
 EMAIL_TYPO:['هل كتبت الإيميل بشكل خاطئ؟ ربما تقصد:','Is the email misspelled? Did you mean:'],
 WEAK_PASSWORD:['كلمة المرور 6 أحرف على الأقل','Password must be at least 6 characters'],
 PW_MISMATCH:['كلمتا المرور غير متطابقتين','Passwords do not match'],
 PW_SAME:['كلمة المرور الجديدة يجب أن تختلف عن الحالية','The new password must differ from the current one'],
 INVALID_LOGIN_CREDENTIALS:['بيانات الدخول غير صحيحة','Wrong username/email or password'],
 INVALID_PASSWORD:['بيانات الدخول غير صحيحة','Wrong username/email or password'],
 EMAIL_NOT_FOUND:['بيانات الدخول غير صحيحة','Wrong username/email or password'],
 TOO_MANY_ATTEMPTS_TRY_LATER:['محاولات كثيرة، حاول لاحقاً','Too many attempts, try again later'],
 USER_DISABLED:['تم تعطيل هذا الحساب','This account has been disabled'],
 NETWORK:['لا يوجد اتصال بالإنترنت','No internet connection'],
 DB_DENIED:['قاعدة البيانات ترفض الطلب — عدّل قواعد Realtime Database في Firebase','The database refused the request — update the Realtime Database rules in Firebase'],
 DB_MISSING:['قاعدة البيانات غير موجودة — أنشئ Realtime Database في Firebase','Database not found — create the Realtime Database in Firebase'],
 NOKEY:['لم يتم ضبط مفتاح Firebase (API_KEY) في الملف','Firebase API key (API_KEY) is not set in the file'],
 OPERATION_NOT_ALLOWED:['فعّل Email/Password من Firebase Authentication','Enable Email/Password in Firebase Authentication'],
 PROFILE_MISSING:['تعذّر تحميل بيانات الحساب','Could not load the account data'],
 MISSING_PASSWORD:['أدخل كلمة المرور','Enter the password'],
 EMPTY:['املأ كل الحقول','Fill in all fields']
};
const emsg=c=>{const e=ERR[c];return e?L(e[0],e[1]):L('حدث خطأ، حاول مجدداً','Something went wrong, try again')+' ('+c+')'};
/* ---- Firebase Authentication (REST, no external scripts) ---- */
async function idt(ep,body){
  if(!/^AIza/.test(API_KEY))throw{code:'NOKEY'};
  let r;try{r=await fetch(IDT+ep+'?key='+API_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}catch(e){throw{code:'NETWORK'}}
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw{code:String((j.error&&j.error.message)||'ERROR').split(/[\s:]/)[0]};
  return j;
}
let tp=null;
function tkn(){
  if(!sess)return Promise.resolve(null);
  if(sess.idt&&Date.now()<sess.exp-60000)return Promise.resolve(sess.idt);
  if(tp)return tp;
  tp=(async()=>{
    let r;try{r=await fetch(STS+'?key='+API_KEY,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(sess.rt)})}catch(e){throw new Error('NET')}
    const j=await r.json().catch(()=>({}));
    if(!r.ok){if([400,401,403].includes(r.status))dropSession();throw new Error('AUTH')}
    sess.idt=j.id_token;sess.rt=j.refresh_token||sess.rt;sess.exp=Date.now()+(+j.expires_in||3600)*1000;sv('sess',sess);return sess.idt;
  })().finally(()=>{tp=null});
  return tp;
}
function dropSession(){sess=null;cur=null;users={};sv('sess',null);sv('prof',null);paint();applyThemes();say(L('انتهت الجلسة، سجّل دخولك من جديد','Session expired, please log in again'))}
/* ---- Realtime Database (REST, authenticated with the Firebase ID token) ---- */
const dbErr=e=>({code:e&&e.status?((e.status===401||e.status===403||e.status===423)?'DB_DENIED':(e.status===404?'DB_MISSING':'DB_'+e.status)):'NETWORK'});
async function db(m,path,body,o){
  o=o||{};const qs=[];if(o.q)qs.push(o.q);
  if(o.auth!==false&&sess){const t=await tkn();if(t)qs.push('auth='+encodeURIComponent(t))}
  const r=await fetch(CLOUD+'/'+path+'.json'+(qs.length?'?'+qs.join('&'):''),{method:m,body:body===undefined?undefined:JSON.stringify(body),keepalive:!!o.ka});
  if(!r.ok){const e=new Error('DB'+r.status);e.status=r.status;throw e}
  return m==='GET'?r.json():null;
}
// Narrow bridge for the X-O game script, which runs in a separate closure.
window.armnOnlineApi={get uid(){return sess&&sess.uid||null},get name(){const u=me();return u&&u.u||sess&&sess.u||'أنت'},get avatar(){const u=me();return u&&Number.isInteger(+u.avatar)?+u.avatar:0},get frame(){const u=me();return u?frOk(u.fr):''},get theme(){const u=me(),i=u&&u.eq?+u.eq.xo:0;return Number.isInteger(i)&&i>=0&&i<C.xo.length?i:0},db:(m,path,body,o)=>db(m,path,body,o)};
/* ---- player profile ---- */
const AVATARS=['🧑🏻‍🎤','👩🏻‍🎤','🧑🏽‍🚀','👩🏽‍🚀','👨🏻‍💻','👩🏻‍💻','🧑🏼‍🎨','👩🏼‍🎨','🧔🏻‍♂️','👩🏽‍🦱','👦🏻','👧🏽','🧑🏿‍🎮','👩🏿‍🎮','🥷🏻','🤖','🦊','🐼','🦁','🐯','🐸','🐲','🦄','🦉','🐺','🦈','🐙','🦋','👑','💀','👽','🧛','🧙'];
const AVATAR_PRICES=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,450,600,750,900,1050,1200,1350,1500,1800,2100,2400,2700,3000,3600,4500];
/* animated frames — prices are 4x the original (300→1200, 1000→4000 …) */
const FR=[['fire','نار','Fire',1200,'🔥'],['ice','جليد','Ice',1200,'❄️'],['thunder','برق','Lightning',1800,'⚡'],['neon','نيون','Neon',1800,'💜'],['toxic','سُم','Toxic',2000,'☣️'],['ruby','ياقوت','Ruby',2200,'♦️'],['rainbow','قوس قزح','Rainbow',2400,'🌈'],['galaxy','مجرة','Galaxy',3200,'🌌'],['royal','ملكي','Royal',4000,'👑'],['sakura','ساكورا','Sakura',1300,'🌸'],['aurora','شفق قطبي','Aurora',1400,'🌠'],['lava','حمم','Lava',1500,'🌋'],['ocean','محيط','Ocean',1600,'🌊'],['emerald','زمرد أخضر','Emerald',1700,'💚'],['sapphire','ياقوت أزرق','Sapphire',1800,'💙'],['amethyst','جمشت','Amethyst',1900,'🔮'],['topaz','توباز','Topaz',2000,'🧡'],['diamond','ألماس','Diamond',2100,'💎'],['plasma','بلازما','Plasma',2200,'🟣'],['cyber','سايبر','Cyber',2300,'🤖'],['shadow','ظل','Shadow',2400,'🌑'],['phoenix','عنقاء','Phoenix',2500,'🦅'],['dragon','تنين','Dragon',2600,'🐉'],['storm','عاصفة','Storm',2700,'⛈️'],['sunset','غروب','Sunset',2800,'🌇'],['candy','حلوى','Candy',2900,'🍭'],['mintx','نعناع منعش','Fresh Mint',3000,'🍃'],['frost','صقيع','Frost',3100,'☃️'],['blood','دم','Blood',3300,'🩸'],['solar','شمس','Solar',3500,'☀️'],['lunar','قمر','Lunar',3700,'🌙'],['venom','سم بنفسجي','Venom',3900,'🕷️'],['hologram','هولوغرام','Hologram',4100,'🪩'],['cosmos','كون','Cosmos',4400,'🪐'],['imperial','إمبراطوري','Imperial',4700,'🏛️'],['samurai','ساموراي','Samurai',5000,'⚔️'],['oni','أوني','Oni',5300,'👹'],['mythic','أسطوري','Mythic',5700,'🔱'],['infinity','لانهائي','Infinity',6200,'♾️']];
const FRD={};FR.forEach(f=>FRD[f[0]]=f);
const FRFREE=[['none','بدون إطار','No frame'],['gold','ذهبي','Gold'],['cyan','سماوي','Cyan'],['pink','وردي','Pink'],['green','أخضر','Green']];
const frOk=x=>typeof x==='string'&&(FRD[x]||FRFREE.some(f=>f[0]===x))?x:'';
window.armnFrameOk=frOk;
/* ===== profile covers (animated backgrounds behind the portrait) ===== [id, ar, en, price, emoji] */
const CV=[['sky','سماء هادئة','Calm Sky',0,'☁️'],['sunset','موجة الغروب','Sunset Waves',0,'🌅'],['grid','شبكة النيون','Neon Grid',0,'🕹️'],['stars','رحلة النجوم','Star Warp',2000,'✨'],['sakura','مطر الساكورا','Sakura Rain',2200,'🌸'],['lava','حمم متدفقة','Lava Flow',2400,'🌋'],['ocean','أعماق المحيط','Deep Ocean',2600,'🌊'],['storm','عاصفة رعدية','Thunder Storm',2800,'⛈️'],['matrix','مطر رقمي','Digital Rain',3000,'💻'],['royal','ذهب ملكي','Royal Gold',3500,'👑']];
const CVD={};CV.forEach(c=>CVD[c[0]]=c);
const cvOk=x=>typeof x==='string'&&(x==='none'||CVD[x])?x:'';
window.armnCoverOk=cvOk;
window.armnCoverHtml=id=>CVD[id]?'<span class="cvr cv-'+id+'"><i></i><i></i><i></i></span>':'';
const frNow=u=>{let l='';try{l=JSON.parse(localStorage.getItem('armnhub:frame'))||''}catch(e){}return (u&&frOk(u.fr))||frOk(l)||'gold'};
/* ARMN avatars: 33 hand-built SVG characters (0-17 free, 18-32 premium with animated frame) */
/* ===== Premium avatars (index 18..32): rich vector illustrations ===== */
const premArt=i=>{
  const id=s=>'q'+i+s,U=s=>'url(#'+id(s)+')';
  const stop=a=>a.map(s=>'<stop offset="'+s[0]+'" stop-color="'+s[1]+'"'+(s[2]!=null?' stop-opacity="'+s[2]+'"':'')+'/>').join('');
  const LG=(s,a,x1=0,y1=0,x2=1,y2=1)=>'<linearGradient id="'+id(s)+'" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'">'+stop(a)+'</linearGradient>';
  const RG=(s,a,cx=.5,cy=.5,r=.5,fx,fy)=>'<radialGradient id="'+id(s)+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'"'+(fx!=null?' fx="'+fx+'" fy="'+fy+'"':'')+'>'+stop(a)+'</radialGradient>';
  const OL='stroke="#0c0a1c" stroke-opacity=".62" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"';
  const mir=g=>g+'<g transform="translate(100 0) scale(-1 1)">'+g+'</g>';
  const spk=(x,y,s,d,c='#fff')=>{const f=n=>+n.toFixed(2);return '<path d="M'+x+' '+f(y-s)+'l'+f(s*.26)+' '+f(s*.74)+' '+f(s*.74)+' '+f(s*.26)+' '+f(-s*.74)+' '+f(s*.26)+' '+f(-s*.26)+' '+f(s*.74)+' '+f(-s*.26)+' '+f(-s*.74)+' '+f(-s*.74)+' '+f(-s*.26)+' '+f(s*.74)+' '+f(-s*.26)+'z" fill="'+c+'"><animate attributeName="opacity" values="0;1;0" dur="'+d+'s" repeatCount="indefinite"/></path>'};
  /* glossy eye: needs gradient 'ir' (iris) in defs */
  const eye=(cx,cy,w,h,o={})=>{const dx=o.dx||0,dy=o.dy==null?h*.06:o.dy;return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+w+'" ry="'+h+'" fill="'+(o.sc||'#fff')+'" '+OL+'/>'+
    '<ellipse cx="'+(cx+dx)+'" cy="'+(cy+dy)+'" rx="'+w*.68+'" ry="'+h*.88+'" fill="'+U('ir')+'"/>'+
    '<ellipse cx="'+(cx+dx)+'" cy="'+(cy+dy)+'" rx="'+w*(o.slit?.14:.32)+'" ry="'+h*(o.slit?.8:.5)+'" fill="'+(o.pc||'#0c0c24')+'"/>'+
    '<ellipse cx="'+(cx-w*.3)+'" cy="'+(cy-h*.36)+'" rx="'+w*.27+'" ry="'+w*.27+'" fill="#fff"/><circle cx="'+(cx+w*.32)+'" cy="'+(cy+h*.38)+'" r="'+w*.12+'" fill="#fff" opacity=".85"/>'};
  const bg=(c1,c2,glow,extra='')=>{
    const rays=Array.from({length:9},(_,k)=>{const a=k*.698,b=a+.2;return '<path d="M50 46L'+(50+80*Math.cos(a)).toFixed(1)+' '+(46+80*Math.sin(a)).toFixed(1)+'L'+(50+80*Math.cos(b)).toFixed(1)+' '+(46+80*Math.sin(b)).toFixed(1)+'z"/>'}).join('');
    const parts=[[14,80,1.1,3.1,0],[85,72,.9,4.2,1],[20,28,.8,3.6,2],[80,24,1.2,4.8,.5],[9,52,.7,5.2,1.5],[91,50,.8,3.9,2.4],[50,93,.9,4.4,.7]].map(a=>'<circle cx="'+a[0]+'" cy="'+a[1]+'" r="'+a[2]+'" fill="#fff"><animate attributeName="cy" values="'+a[1]+';'+(a[1]-14)+';'+a[1]+'" dur="'+a[3]+'s" begin="'+a[4]+'s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.9;0" dur="'+a[3]+'s" begin="'+a[4]+'s" repeatCount="indefinite"/></circle>').join('');
    return '<defs>'+RG('bg',[[0,glow],[.5,c1],[1,c2]],.5,.44,.78)+RG('vg',[[.55,'#000',0],[1,'#000',.6]],.5,.5,.72)+LG('gf',[[0,'#fff6bd'],[.5,'#f2b52c'],[1,'#8b5a00']])+'</defs>'+
      '<rect width="100" height="100" fill="'+U('bg')+'"/><g fill="#fff" opacity=".1"><animateTransform attributeName="transform" type="rotate" from="0 50 46" to="360 50 46" dur="44s" repeatCount="indefinite"/>'+rays+'</g>'+extra+parts};
  const fin=()=>'<rect width="100" height="100" fill="'+U('vg')+'"/>'+
    '<circle cx="50" cy="50" r="48.3" fill="none" stroke="'+U('gf')+'" stroke-width="2.4"/><circle cx="50" cy="50" r="45.4" fill="none" stroke="#fff3b0" stroke-opacity=".7" stroke-width=".7" stroke-dasharray="1.2 3.4"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="22s" repeatCount="indefinite"/></circle>'+
    spk(88,14,5,2.6,'#fff3b0')+spk(12,86,4,3.3,'#fff3b0');
  const k=i-18;
  const C=[];
  /* 18 · Unicorn */
  C[0]=()=>bg('#8a3fe0','#2b0f66','#ff9ff0')+
  '<defs>'+LG('mane',[[0,'#ff7fd0'],[.5,'#b78cff'],[1,'#5fd8ff']],0,0,.4,1)+LG('mane2',[[0,'#5fd8ff'],[.5,'#b78cff'],[1,'#ff7fd0']],0,0,.4,1)+RG('coat',[[0,'#ffffff'],[.7,'#f6eaff'],[1,'#d8c3f2']],.42,.32,.8)+LG('horn',[[0,'#fff6c0'],[.5,'#ffc93c'],[1,'#c98a00']],0,0,1,0)+RG('ir',[[0,'#e9b6ff'],[.55,'#9a4bff'],[1,'#4a1aa0']],.5,.4,.6)+RG('mz',[[0,'#fff0f8'],[1,'#ffc2e2']],.5,.4,.7)+RG('hg',[[0,'#fff8c0'],[1,'#ffd76a',0]])+'</defs>'+
  '<path d="M30 30C6 36 2 64 12 86C18 94 30 92 34 82C26 70 28 52 36 42z" fill="'+U('mane')+'" '+OL+'/><path d="M70 30C94 36 98 64 88 86C82 94 70 92 66 82C74 70 72 52 64 42z" fill="'+U('mane2')+'" '+OL+'/>'+
  '<path d="M18 62C14 72 16 80 22 86M84 62C88 72 86 80 80 86" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
  '<path d="M36 70C34 88 40 98 50 100C60 98 66 88 64 70z" fill="'+U('coat')+'" '+OL+'/>'+
  mir('<path d="M33 31L28 6L45 24z" fill="'+U('coat')+'" '+OL+'/><path d="M34 27L31 12L41 24z" fill="#ffb0d8"/>')+
  '<path d="M50 24C67 24 73 38 71 54C69 68 60 79 50 79C40 79 31 68 29 54C27 38 33 24 50 24z" fill="'+U('coat')+'" '+OL+'/>'+
  '<ellipse cx="50" cy="67" rx="15" ry="11" fill="'+U('mz')+'"/><ellipse cx="44" cy="68" rx="2.2" ry="3" fill="#d96aa6"/><ellipse cx="56" cy="68" rx="2.2" ry="3" fill="#d96aa6"/><path d="M44 74Q50 78 56 74" stroke="#c0508c" stroke-width="1.3" fill="none" stroke-linecap="round"/>'+
  '<path d="M36 31C40 21 54 19 64 27C58 29 57 38 50 41C47 35 40 37 36 31z" fill="'+U('mane')+'" '+OL+'/><path d="M40 29C46 25 54 25 60 29" stroke="#fff" stroke-opacity=".55" stroke-width="1.2" fill="none"/>'+
  '<path d="M45 26L50 5L55 26z" fill="'+U('horn')+'" '+OL+'/><path d="M46.4 22L54 19.5M47.4 17L53 14.8M48.4 12L52 10.6" stroke="#a86d00" stroke-width="1.3" stroke-linecap="round"/><circle cx="50" cy="7" r="7" fill="'+U('hg')+'"><animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite"/></circle>'+
  eye(40,50,6.4,7.4)+eye(60,50,6.4,7.4)+
  '<path d="M33.5 45Q37 41 42 42M66.5 45Q63 41 58 42" stroke="#3a1670" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M33 47l-3-2M67 47l3-2" stroke="#3a1670" stroke-width="1.5" stroke-linecap="round"/>'+
  '<circle cx="34" cy="62" r="4.2" fill="#ff7fb0" opacity=".42"/><circle cx="66" cy="62" r="4.2" fill="#ff7fb0" opacity=".42"/>'+
  '<path d="M64 56l1 2.4 2.5.3-1.9 1.7.6 2.5-2.2-1.3-2.2 1.3.6-2.5-1.9-1.7 2.5-.3z" fill="#ffe27a"/>'+
  spk(18,22,4,2.2)+spk(84,40,3.4,3)+spk(24,56,3,2.7,'#ffd6f5')+fin();

  /* 19 · Dragon lord */
  C[1]=()=>bg('#8a1426','#1c0308','#ff7a2a','<path d="M0 100C14 80 26 86 36 70C40 84 50 78 52 62C60 80 72 76 78 66C84 82 94 80 100 70V100z" fill="#ff7a1f" opacity=".5"><animate attributeName="opacity" values=".35;.65;.35" dur="1.8s" repeatCount="indefinite"/></path>')+
  '<defs>'+RG('sk',[[0,'#8bffc0'],[.5,'#23c07a'],[1,'#07603f']],.4,.3,.85)+LG('wn',[[0,'#a4182c'],[1,'#3a0610']],0,0,1,1)+LG('hn',[[0,'#fff6e0'],[.6,'#e9cf9c'],[1,'#9c7a3a']],0,0,0,1)+RG('ir',[[0,'#fff59a'],[.5,'#ffb400'],[1,'#e25a00']],.5,.4,.6)+RG('sn',[[0,'#c8ffd8'],[1,'#4fd69a']],.5,.4,.7)+'</defs>'+
  mir('<path d="M30 46L1 14L9 44L0 58L14 62L10 78L34 64z" fill="'+U('wn')+'" '+OL+'/><path d="M30 46L9 44M30 48L14 62M31 52L10 78" stroke="#ff8a6a" stroke-opacity=".45" stroke-width="1"/>')+
  mir('<path d="M33 36C26 24 24 12 28 3C35 11 39 22 42 34z" fill="'+U('hn')+'" '+OL+'/><path d="M30 20L35 19M29 13L34 13" stroke="#8a6a2a" stroke-width="1" opacity=".7"/>')+
  '<path d="M42 26L45 10L50 22L55 10L58 26z" fill="#1f9d66" '+OL+'/>'+
  '<path d="M50 24C71 24 79 40 77 54C76 67 68 79 50 85C32 79 24 67 23 54C21 40 29 24 50 24z" fill="'+U('sk')+'" '+OL+'/>'+
  '<g stroke="#064a30" stroke-opacity=".35" stroke-width="1" fill="none">'+[0,1,2].map(r=>Array.from({length:5},(_,c)=>'<path d="M'+(33+c*8+(r%2)*4)+' '+(31+r*6)+'q3 3 6 0"/>').join('')).join('')+'</g>'+
  '<ellipse cx="50" cy="68" rx="18" ry="14" fill="'+U('sn')+'" '+OL+'/><path d="M41 72L43 79 45 72M55 72L57 79 59 72" fill="#fff" stroke="#6a8a7a" stroke-width=".6"/><path d="M38 70Q50 77 62 70" stroke="#0a5a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>'+
  '<ellipse cx="44" cy="62" rx="2.4" ry="1.8" fill="#074a30"/><ellipse cx="56" cy="62" rx="2.4" ry="1.8" fill="#074a30"/>'+
  '<g opacity=".7"><circle cx="40" cy="56" r="2" fill="#dfe"><animate attributeName="cy" values="56;46;56" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0;.7" dur="2.6s" repeatCount="indefinite"/></circle></g>'+
  eye(37,45,7.4,5.6,{slit:1,sc:'#fff7c8'})+eye(63,45,7.4,5.6,{slit:1,sc:'#fff7c8'})+
  '<path d="M28 39L46 44M72 39L54 44" stroke="#064a30" stroke-width="3.2" stroke-linecap="round"/><path d="M28 39L46 44M72 39L54 44" stroke="#52e6a2" stroke-width=".9" stroke-linecap="round" opacity=".7"/>'+
  '<path d="M50 24L50 36M44 27L46 36M56 27L54 36" stroke="#0a7a50" stroke-width="2" stroke-linecap="round"/>'+
  spk(15,26,3.4,2.4,'#ffd27a')+spk(86,34,3,3.1,'#ffd27a')+fin();

  /* 20 · Frog prince */
  C[2]=()=>bg('#12a17a','#052e3c','#c6ff8a','<ellipse cx="22" cy="96" rx="22" ry="7" fill="#2a8a3a" opacity=".85"/><ellipse cx="82" cy="98" rx="24" ry="7" fill="#2a8a3a" opacity=".85"/>')+
  '<defs>'+RG('sk',[[0,'#d4ff8a'],[.55,'#53c83a'],[1,'#1b7a2c']],.4,.28,.85)+RG('ir',[[0,'#fff08a'],[.55,'#ffb01f'],[1,'#c25a00']],.5,.4,.6)+LG('cr',[[0,'#fff6bd'],[.5,'#f5b92e'],[1,'#9a6200']],0,0,0,1)+RG('bl',[[0,'#ffe9c9'],[1,'#fff7e8']],.5,.4,.7)+'</defs>'+
  '<path d="M14 100C16 84 32 78 50 78C68 78 84 84 86 100z" fill="'+U('sk')+'" '+OL+'/><ellipse cx="50" cy="92" rx="18" ry="10" fill="'+U('bl')+'"/>'+
  '<ellipse cx="50" cy="58" rx="37" ry="25" fill="'+U('sk')+'" '+OL+'/>'+
  mir('<circle cx="30" cy="36" r="15" fill="'+U('sk')+'" '+OL+'/>')+
  '<ellipse cx="50" cy="75" rx="22" ry="8" fill="'+U('bl')+'" opacity=".8"/>'+
  '<path d="M16 60Q50 88 84 60" stroke="#0e4a1c" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M24 64Q50 84 76 64" stroke="#fff" stroke-opacity=".28" stroke-width="1.2" fill="none"/>'+
  eye(31,35,10.5,10,{dy:1})+eye(69,35,10.5,10,{dy:1})+
  '<ellipse cx="45" cy="55" rx="1.8" ry="1.3" fill="#0e4a1c"/><ellipse cx="55" cy="55" rx="1.8" ry="1.3" fill="#0e4a1c"/>'+
  '<circle cx="22" cy="62" r="5" fill="#ff8a8a" opacity=".5"/><circle cx="78" cy="62" r="5" fill="#ff8a8a" opacity=".5"/>'+
  '<g fill="#1b7a2c" opacity=".55"><circle cx="40" cy="48" r="2"/><circle cx="60" cy="47" r="1.6"/><circle cx="50" cy="44" r="1.4"/><circle cx="30" cy="62" r="1.6"/><circle cx="71" cy="64" r="1.8"/></g>'+
  '<path d="M39 26L40 14L45 21L50 11L55 21L60 14L61 26z" fill="'+U('cr')+'" '+OL+'/><rect x="39" y="24" width="22" height="4" rx="1.5" fill="'+U('cr')+'" '+OL+'/><circle cx="50" cy="26" r="1.8" fill="#ff4f7a"/><circle cx="43.5" cy="26" r="1.2" fill="#5ad0ff"/><circle cx="56.5" cy="26" r="1.2" fill="#7affb0"/>'+
  '<g fill="#fff" opacity=".85"><ellipse cx="16" cy="78" rx="2" ry="3"/><ellipse cx="86" cy="52" rx="1.6" ry="2.4"/><ellipse cx="9" cy="48" rx="1.4" ry="2.1"/></g>'+
  spk(88,26,3.4,2.5,'#eaffb0')+fin();

  /* 21 · Fire tiger */
  C[3]=()=>bg('#c43b0a','#2b0804','#ffc24d')+
  '<defs>'+RG('fur',[[0,'#ffc15e'],[.55,'#f0700f'],[1,'#a83a00']],.42,.3,.85)+RG('wh',[[0,'#ffffff'],[1,'#ffe9cf']],.5,.4,.7)+RG('ir',[[0,'#d4ff9a'],[.5,'#46e06a'],[1,'#0a7a3a']],.5,.4,.6)+LG('gd',[[0,'#fff3b0'],[.5,'#f0b429'],[1,'#8a5a00']],0,0,1,1)+'</defs>'+
  mir('<path d="M6 100C6 88 16 82 28 84L31 100z" fill="'+U('gd')+'" '+OL+'/><circle cx="14" cy="92" r="2.2" fill="#ff4f4f"/>')+
  mir('<path d="M24 32C16 14 34 6 44 20z" fill="'+U('fur')+'" '+OL+'/><path d="M27 28C23 19 31 14 37 22z" fill="#ffd0c0"/>')+
  '<path d="M50 20C73 20 83 37 81 54C79 73 66 86 50 88C34 86 21 73 19 54C17 37 27 20 50 20z" fill="'+U('fur')+'" '+OL+'/>'+
  mir('<path d="M20 56C13 60 13 69 22 73C26 69 29 62 29 56z" fill="'+U('wh')+'"/>')+
  '<ellipse cx="50" cy="69" rx="18" ry="14" fill="'+U('wh')+'" '+OL+'/>'+
  '<path d="M43 61H57L50 69z" fill="#ff7a96" '+OL+'/><path d="M50 69V73M42 76Q50 80 58 76" stroke="#5a2a20" stroke-width="1.6" fill="none" stroke-linecap="round"/><g fill="#5a2a20" opacity=".6"><circle cx="42" cy="70" r=".9"/><circle cx="40" cy="73" r=".9"/><circle cx="58" cy="70" r=".9"/><circle cx="60" cy="73" r=".9"/></g>'+
  '<g fill="#14090a">'+
  '<path d="M50 20L53 38L50 33L47 38z"/><path d="M42 21L47 36L43 31z"/><path d="M58 21L53 36L57 31z"/>'+
  mir('<path d="M19 48L33 52L20 54z"/><path d="M20 58L32 58L21 62z"/><path d="M28 30L39 38L27 36z"/>')+'</g>'+
  eye(37,50,6.6,5.6,{dy:0})+eye(63,50,6.6,5.6,{dy:0})+
  '<path d="M27 43L45 48M73 43L55 48" stroke="#14090a" stroke-width="3.2" stroke-linecap="round"/>'+
  '<path d="M50 38l3 3.4-3 3.4-3-3.4z" fill="#ff4f4f" '+OL+'/>'+
  spk(88,20,3.6,2.4,'#ffe08a')+spk(10,30,3,3.2,'#ffe08a')+fin();

  /* 22 · Sun lion */
  C[4]=()=>bg('#e65a0c','#4a1100','#ffe08a','<circle cx="50" cy="48" r="44" fill="url(#q22sun)" opacity=".9"/>')+
  '<defs>'+RG('sun',[[0,'#fff3b0'],[.6,'#ffb92e',.7],[1,'#ff7a1f',0]])+LG('m1',[[0,'#c43a00'],[1,'#6a1400']],0,0,0,1)+LG('m2',[[0,'#ffb01f'],[1,'#e2540a']],0,0,0,1)+RG('fc',[[0,'#fff0b8'],[.6,'#f4b858'],[1,'#c97a22']],.45,.3,.85)+RG('ir',[[0,'#fff0a0'],[.5,'#ffb400'],[1,'#c25500']],.5,.4,.6)+RG('mz',[[0,'#fff8e0'],[1,'#fbd592']],.5,.4,.7)+'</defs>'+
  '<g>'+Array.from({length:16},(_,j)=>'<path d="M50 -1C62 11 62 25 50 37C38 25 38 11 50 -1z" transform="rotate('+(j*22.5)+' 50 52)" fill="'+U('m1')+'" '+OL+'/>').join('')+'</g>'+
  '<g>'+Array.from({length:16},(_,j)=>'<path d="M50 6C60 15 60 26 50 35C40 26 40 15 50 6z" transform="rotate('+(j*22.5+11)+' 50 52)" fill="'+U('m2')+'" '+OL+'/>').join('')+'</g>'+
  mir('<circle cx="27" cy="28" r="8" fill="#f4b858" '+OL+'/><circle cx="27" cy="28" r="4" fill="#d9783a"/>')+
  '<ellipse cx="50" cy="54" rx="27" ry="29" fill="'+U('fc')+'" '+OL+'/>'+
  '<ellipse cx="50" cy="67" rx="16" ry="12" fill="'+U('mz')+'" '+OL+'/><path d="M43 59H57L50 67z" fill="#6a2a18" '+OL+'/><path d="M50 67V72M43 75Q50 80 57 75" stroke="#6a2a18" stroke-width="1.6" fill="none" stroke-linecap="round"/><g fill="#9a5a30" opacity=".6"><circle cx="43" cy="69" r=".9"/><circle cx="41" cy="72" r=".9"/><circle cx="57" cy="69" r=".9"/><circle cx="59" cy="72" r=".9"/></g>'+
  eye(39,51,5.8,5,{dy:0})+eye(61,51,5.8,5,{dy:0})+
  '<path d="M30 45L45 49M70 45L55 49" stroke="#5a2a10" stroke-width="3" stroke-linecap="round"/>'+
  '<path d="M33 38L38 58" stroke="#b0452a" stroke-width="1.6" stroke-linecap="round"/><path d="M33 38L38 58" stroke="#ffd9c8" stroke-width=".6" stroke-linecap="round"/>'+
  '<path d="M50 32l4 4.4-4 4.4-4-4.4z" fill="#59d0ff" '+OL+'/><path d="M50 32l4 4.4h-8z" fill="#fff" opacity=".55"/>'+
  spk(90,18,4,2.4,'#fff3b0')+spk(10,22,3.2,3.1,'#fff3b0')+fin();
  /* 23 · Butterfly fairy */
  C[5]=()=>bg('#6a24c8','#1b0a52','#ffa0ec')+
  '<defs>'+LG('w1',[[0,'#ff9fe0'],[.5,'#b78cff'],[1,'#5fe0ff']],0,0,1,1)+LG('w2',[[0,'#5fe0ff'],[.6,'#b78cff'],[1,'#ff9fe0']],0,0,1,1)+RG('sk',[[0,'#fff0e6'],[1,'#f4c0a8']],.45,.3,.8)+RG('ir',[[0,'#d4f6ff'],[.5,'#7a8cff'],[1,'#3a1aa0']],.5,.4,.6)+LG('hr',[[0,'#ff9fd8'],[.55,'#d08cff'],[1,'#8a6cff']],0,0,0,1)+LG('dr',[[0,'#6af0d8'],[1,'#2a8ad0']],0,0,0,1)+'</defs>'+
  mir('<path d="M46 50C30 12 3 14 5 38C7 52 28 58 46 54z" fill="'+U('w1')+'" '+OL+'/><path d="M46 57C28 60 10 74 21 89C31 96 44 80 46 62z" fill="'+U('w2')+'" '+OL+'/><g stroke="#fff" stroke-opacity=".55" stroke-width=".9" fill="none"><path d="M46 52C34 40 20 30 10 30M46 52C32 46 18 44 9 40M46 54C34 52 22 52 12 48M45 60C34 66 26 74 24 84"/></g><circle cx="22" cy="34" r="4" fill="#fff" opacity=".6"/><circle cx="14" cy="42" r="2.4" fill="#ffd27a" opacity=".9"/><circle cx="30" cy="80" r="2.6" fill="#fff" opacity=".6"/>')+
  '<path d="M30 42C27 16 73 16 70 42C75 56 71 68 62 72L38 72C29 68 25 56 30 42z" fill="'+U('hr')+'" '+OL+'/>'+
  '<path d="M42 62L58 62L65 86L35 86z" fill="'+U('dr')+'" '+OL+'/><rect x="45" y="56" width="10" height="9" fill="#f4c0a8"/>'+
  '<ellipse cx="50" cy="46" rx="15.5" ry="17" fill="'+U('sk')+'" '+OL+'/>'+
  '<path d="M34 42C34 26 46 22 54 25C66 28 68 38 66 44C62 36 56 32 50 36C44 32 38 36 34 42z" fill="'+U('hr')+'" '+OL+'/>'+
  eye(43,47,4.8,5.6)+eye(57,47,4.8,5.6)+
  '<path d="M38.5 43Q42 40 46 41.5M61.5 43Q58 40 54 41.5" stroke="#4a1a8a" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
  '<path d="M46 56Q50 59 54 56" stroke="#d0506a" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="38.5" cy="54" r="3" fill="#ff8aa8" opacity=".45"/><circle cx="61.5" cy="54" r="3" fill="#ff8aa8" opacity=".45"/>'+
  '<g '+OL+'><circle cx="36" cy="30" r="3.4" fill="#ff7ab8"/><circle cx="43" cy="25" r="3.4" fill="#fff"/><circle cx="50" cy="23.5" r="3.8" fill="#ffe27a"/><circle cx="57" cy="25" r="3.4" fill="#fff"/><circle cx="64" cy="30" r="3.4" fill="#ff7ab8"/></g>'+
  '<path d="M44 24C40 12 34 8 28 10M56 24C60 12 66 8 72 10" stroke="#f0d8ff" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="28" cy="10" r="2.4" fill="#fff6a0"><animate attributeName="opacity" values="1;.3;1" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="72" cy="10" r="2.4" fill="#fff6a0"><animate attributeName="opacity" values=".3;1;.3" dur="1.6s" repeatCount="indefinite"/></circle>'+
  spk(14,64,4,2.2)+spk(88,60,3.6,2.9,'#ffd6f5')+spk(50,94,3,3.4)+fin();

  /* 24 · Kraken captain */
  C[6]=()=>bg('#0e4aa8','#030c2e','#52eaff','<g fill="none" stroke="#9af4ff" stroke-opacity=".5" stroke-width=".8"><circle cx="14" cy="62" r="3"><animate attributeName="cy" values="62;40;62" dur="4s" repeatCount="indefinite"/></circle><circle cx="86" cy="76" r="2.4"><animate attributeName="cy" values="76;48;76" dur="5s" repeatCount="indefinite"/></circle><circle cx="78" cy="30" r="1.8"><animate attributeName="cy" values="30;12;30" dur="3.2s" repeatCount="indefinite"/></circle></g>')+
  '<defs>'+RG('sk',[[0,'#ffa6d8'],[.5,'#d04aa8'],[1,'#6a1a90']],.4,.28,.85)+LG('tn',[[0,'#f070c8'],[1,'#9a3ab0']],0,0,0,1)+RG('ir',[[0,'#fff4a0'],[.55,'#ffb21f'],[1,'#c85a00']],.5,.4,.6)+LG('hat',[[0,'#2a3680'],[1,'#0c1236']],0,0,0,1)+LG('gd',[[0,'#fff3b0'],[.5,'#f0b429'],[1,'#8a5a00']],0,0,0,1)+'</defs>'+
  mir('<path d="M34 66C14 66 8 82 20 90C28 95 36 90 32 84C28 80 34 76 40 76" stroke="'+U('tn')+'" stroke-width="8" fill="none" stroke-linecap="round"/><g fill="#ffd9ee" opacity=".7"><circle cx="14" cy="80" r="1.5"/><circle cx="17" cy="87" r="1.4"/><circle cx="24" cy="92" r="1.3"/></g><path d="M44 74C38 88 44 98 52 94C58 90 54 84 50 86" stroke="'+U('tn')+'" stroke-width="7" fill="none" stroke-linecap="round"/>')+
  '<path d="M20 56C15 26 31 11 50 11C69 11 85 26 80 56C78 68 66 73 50 73C34 73 22 68 20 56z" fill="'+U('sk')+'" '+OL+'/>'+
  '<g fill="#ffd0ec" opacity=".55"><circle cx="30" cy="42" r="3"/><circle cx="70" cy="40" r="2.6"/><circle cx="36" cy="56" r="1.8"/><circle cx="66" cy="58" r="2.2"/><circle cx="26" cy="54" r="1.6"/></g><ellipse cx="38" cy="32" rx="11" ry="5" fill="#fff" opacity=".22" transform="rotate(-24 38 32)"/>'+
  eye(37,50,8,8.6,{dy:0})+eye(63,50,8,8.6,{dy:0})+
  '<path d="M45 64Q50 69 55 64" stroke="#6a1a60" stroke-width="2" fill="none" stroke-linecap="round"/>'+
  '<path d="M29 28C32 8 68 8 71 28z" fill="'+U('hat')+'" '+OL+'/><path d="M16 29C28 20 72 20 84 29C72 36 28 36 16 29z" fill="'+U('hat')+'" '+OL+'/><path d="M16 29C28 36 72 36 84 29" stroke="'+U('gd')+'" stroke-width="2.2" fill="none"/><circle cx="50" cy="20" r="4.4" fill="#f4f4fa" '+OL+'/><rect x="48" y="22" width="4" height="3" fill="#f4f4fa"/><circle cx="48.6" cy="20" r="1" fill="#10102a"/><circle cx="51.4" cy="20" r="1" fill="#10102a"/>'+
  spk(88,40,3.4,2.6,'#bff6ff')+spk(10,38,3,3.4,'#bff6ff')+fin();

  /* 25 · Great shark */
  C[7]=()=>bg('#0f7cc0','#021a3c','#7af4ff','<g fill="#fff" opacity=".1"><path d="M30 0L40 0L56 100L36 100z"/><path d="M60 0L66 0L84 100L68 100z"/></g>')+
  '<defs>'+LG('bd',[[0,'#9cc0d8'],[.5,'#4e7a9c'],[1,'#27425e']],0,0,0,1)+RG('mo',[[0,'#d02a3a'],[1,'#5a0816']],.5,.35,.75)+RG('ir',[[0,'#bff9ff'],[.5,'#2ad0f0'],[1,'#0a6a9a']],.5,.4,.6)+LG('bl',[[0,'#fff'],[1,'#cfe2ee']],0,0,0,1)+'</defs>'+
  '<path d="M50 -2L68 26H32z" fill="'+U('bd')+'" '+OL+'/>'+
  '<path d="M50 14C79 14 91 40 87 62C83 80 67 91 50 91C33 91 17 80 13 62C9 40 21 14 50 14z" fill="'+U('bd')+'" '+OL+'/>'+
  '<path d="M16 64C20 84 36 92 50 92C64 92 80 84 84 64C70 72 30 72 16 64z" fill="'+U('bl')+'" opacity=".9"/>'+
  '<path d="M21 58C34 47 66 47 79 58C77 79 64 89 50 89C36 89 23 79 21 58z" fill="'+U('mo')+'" '+OL+'/>'+
  '<ellipse cx="50" cy="80" rx="12" ry="6" fill="#ff7a8a" opacity=".8"/>'+
  '<g fill="#fff" stroke="#9ab" stroke-width=".5">'+Array.from({length:9},(_,j)=>{const x=26+j*6,y=54-Math.sin(j/8*Math.PI)*-3+ (Math.abs(j-4)*0.6);return '<path d="M'+(x-2.6)+' '+(y-1)+'L'+x+' '+(y+7)+'L'+(x+2.6)+' '+(y-1)+'z"/>'}).join('')+
  Array.from({length:7},(_,j)=>{const x=30+j*6.6,y=86-Math.sin(j/6*Math.PI)*3;return '<path d="M'+(x-2.4)+' '+(y+1)+'L'+x+' '+(y-6)+'L'+(x+2.4)+' '+(y+1)+'z"/>'}).join('')+'</g>'+
  mir('<circle cx="28" cy="38" r="5.4" fill="#06141e" '+OL+'/><circle cx="28" cy="38" r="3.4" fill="'+U('ir')+'"><animate attributeName="r" values="3.4;4.2;3.4" dur="2s" repeatCount="indefinite"/></circle><circle cx="26.6" cy="36.6" r="1.4" fill="#fff"/><path d="M20 32L36 36" stroke="#14202c" stroke-width="2.6" stroke-linecap="round"/><path d="M18 52Q16 58 18 64M22 52Q20 58 22 64" stroke="#27425e" stroke-width="1.2" fill="none" stroke-linecap="round"/>')+
  '<path d="M60 30L66 44" stroke="#e9f6ff" stroke-width="1.2" opacity=".8"/>'+
  '<circle cx="12" cy="30" r="2" fill="none" stroke="#bff6ff" stroke-opacity=".7"/><circle cx="88" cy="24" r="2.6" fill="none" stroke="#bff6ff" stroke-opacity=".7"/>'+
  spk(88,56,3.2,2.8,'#bff6ff')+fin();

  /* 26 · Moon wolf */
  C[8]=()=>bg('#1c3a7a','#050b22','#a8d8ff','<circle cx="50" cy="36" r="27" fill="url(#q26mn)"/><g fill="#8aa6d0" opacity=".35"><circle cx="42" cy="28" r="4"/><circle cx="60" cy="42" r="5"/><circle cx="55" cy="24" r="2.6"/></g>')+
  '<defs>'+RG('mn',[[0,'#ffffff'],[.7,'#e6f0ff'],[1,'#a8c8f0']],.4,.35,.7)+RG('fur',[[0,'#c4ceda'],[.55,'#6e7d90'],[1,'#2c3646']],.42,.3,.85)+RG('wh',[[0,'#ffffff'],[1,'#d4dde8']],.5,.4,.7)+RG('ir',[[0,'#fff8b0'],[.5,'#ffd23a'],[1,'#e07a00']],.5,.4,.6)+'</defs>'+
  mir('<path d="M27 42L21 6L45 28z" fill="'+U('fur')+'" '+OL+'/><path d="M28 36L25 15L38 28z" fill="#2c2438"/>')+
  '<path d="M50 28C71 28 81 43 79 57C77 73 65 87 50 91C35 87 23 73 21 57C19 43 29 28 50 28z" fill="'+U('fur')+'" '+OL+'/>'+
  mir('<path d="M22 56L9 60L23 66L11 76L28 76z" fill="'+U('wh')+'" '+OL+'/>')+
  '<path d="M50 54C59 54 67 61 65 74C63 85 57 89 50 91C43 89 37 85 35 74C33 61 41 54 50 54z" fill="'+U('wh')+'" '+OL+'/>'+
  '<path d="M44 68Q50 63 56 68Q56 76 50 78Q44 76 44 68z" fill="#10141c" '+OL+'/><ellipse cx="48" cy="67" rx="2.2" ry="1.2" fill="#fff" opacity=".6"/><path d="M50 78V82M43 84Q50 89 57 84" stroke="#2a3240" stroke-width="1.5" fill="none" stroke-linecap="round"/>'+
  '<g stroke="#1c2432" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round"><path d="M50 30L49 44M44 31L43 42M56 31L57 42M38 34L37 42M62 34L63 42"/></g>'+
  mir('<path d="M29 52Q38 43 47 50Q41 57 29 52z" fill="#fff8d0" '+OL+'/><ellipse cx="38.5" cy="50.6" rx="5.6" ry="3.8" fill="'+U('ir')+'"/><ellipse cx="38.8" cy="50.6" rx="1.2" ry="3.2" fill="#10101a"/><circle cx="36.6" cy="49" r="1.2" fill="#fff"/><path d="M28 47L46 46" stroke="#1c2432" stroke-width="2" stroke-linecap="round" opacity=".7"/>')+
  '<path d="M6 100L14 86L20 96L28 84L36 98L50 90L64 98L72 84L80 96L86 86L94 100z" fill="'+U('wh')+'" '+OL+'/>'+
  spk(14,20,3.6,2.4,'#fff')+spk(86,14,3,3,'#fff')+fin();

  /* 27 · Night owl */
  C[9]=()=>bg('#2a2480','#080626','#ffd98a','<path d="M80 12a10 10 0 1 0 6 18a8 8 0 1 1-6-18z" fill="#fff3b0"/><g fill="#fff"><circle cx="14" cy="18" r=".9"/><circle cx="26" cy="10" r=".7"/><circle cx="90" cy="46" r=".8"/></g>')+
  '<defs>'+RG('fe',[[0,'#d09a62'],[.55,'#8a5a30'],[1,'#4a2c14']],.42,.3,.85)+RG('dc',[[0,'#fff6dc'],[1,'#e8c890']],.5,.4,.7)+RG('ir',[[0,'#fff1a0'],[.5,'#ffbc1a'],[1,'#c85a00']],.5,.4,.6)+LG('bk',[[0,'#ffd36a'],[1,'#d98a1a']],0,0,0,1)+RG('gm',[[0,'#fff'],[.4,'#d9a0ff'],[1,'#7a2ad0']])+'</defs>'+
  mir('<path d="M20 52C8 66 10 90 28 98L36 70z" fill="'+U('fe')+'" '+OL+'/><path d="M16 66Q20 70 24 66M16 76Q20 80 24 76" stroke="#2a1608" stroke-opacity=".5" stroke-width="1.4" fill="none"/>')+
  '<path d="M20 44C20 22 34 14 50 24C66 14 80 22 80 44V68C80 86 66 96 50 96C34 96 20 86 20 68z" fill="'+U('fe')+'" '+OL+'/>'+
  mir('<path d="M24 22L20 4L38 18z" fill="'+U('fe')+'" '+OL+'/>')+
  '<ellipse cx="50" cy="82" rx="18" ry="15" fill="'+U('dc')+'"/><g stroke="#a47a44" stroke-width="1.4" fill="none" stroke-linecap="round">'+[0,1,2].map(r=>[-9,0,9].map(c=>'<path d="M'+(50+c-4)+' '+(76+r*6)+'q4 4 8 0"/>').join('')).join('')+'</g>'+
  mir('<circle cx="35" cy="46" r="15.5" fill="'+U('dc')+'" stroke="#6a4220" stroke-width="2"/>')+
  eye(35,46,9.4,9.4,{sc:'#fffbe8',dy:0})+eye(65,46,9.4,9.4,{sc:'#fffbe8',dy:0})+
  '<path d="M50 50L44 58L50 69L56 58z" fill="'+U('bk')+'" '+OL+'/><path d="M50 50L47 57L50 60z" fill="#fff" opacity=".4"/>'+
  '<circle cx="50" cy="30" r="3.8" fill="'+U('gm')+'" stroke="#f0b429" stroke-width="1"><animate attributeName="opacity" values="1;.55;1" dur="2s" repeatCount="indefinite"/></circle>'+
  spk(10,60,3.4,2.5,'#fff3b0')+spk(90,72,3,3.2,'#fff3b0')+fin();
  /* 28 · Archmage */
  C[10]=()=>bg('#4a1fb0','#100430','#b69cff','<g fill="none" stroke="#d8c8ff" stroke-opacity=".5" stroke-width=".8"><path d="M8 70C16 56 28 60 24 72"><animate attributeName="opacity" values=".2;.8;.2" dur="3s" repeatCount="indefinite"/></path><path d="M92 40C84 28 74 34 80 44"><animate attributeName="opacity" values=".8;.2;.8" dur="2.6s" repeatCount="indefinite"/></path></g>')+
  '<defs>'+LG('rb',[[0,'#7b5cf0'],[1,'#25126a']],0,0,0,1)+LG('bd',[[0,'#ffffff'],[1,'#c8d4f0']],0,0,0,1)+RG('sk',[[0,'#ffe2c8'],[1,'#e8a888']],.45,.3,.8)+RG('ir',[[0,'#e0f8ff'],[.5,'#4aa8ff'],[1,'#1a3aa0']],.5,.4,.6)+LG('ht',[[0,'#8a6cff'],[1,'#3a1c9a']],0,0,0,1)+LG('gd',[[0,'#fff3b0'],[.5,'#f0b429'],[1,'#8a5a00']],0,0,0,1)+RG('orb',[[0,'#ffffff'],[.4,'#7af0ff'],[1,'#1a6ad0']],.4,.35,.7)+'</defs>'+
  '<path d="M4 100C8 80 28 70 50 70C72 70 92 80 96 100z" fill="'+U('rb')+'" '+OL+'/><path d="M30 74Q50 86 70 74" stroke="'+U('gd')+'" stroke-width="2.4" fill="none"/><g fill="#ffd27a" opacity=".85"><circle cx="16" cy="92" r="1.2"/><circle cx="84" cy="90" r="1.2"/><circle cx="26" cy="84" r="1"/><circle cx="74" cy="82" r="1"/></g>'+
  '<path d="M30 50C25 70 33 92 50 99C67 92 75 70 70 50C63 59 57 61 50 61C43 61 37 59 30 50z" fill="'+U('bd')+'" '+OL+'/><path d="M44 70Q46 84 50 92M56 70Q54 84 50 92M38 64Q38 78 42 86M62 64Q62 78 58 86" stroke="#9aa8d0" stroke-width="1" fill="none" stroke-linecap="round" opacity=".8"/>'+
  '<ellipse cx="50" cy="46" rx="16" ry="17" fill="'+U('sk')+'" '+OL+'/>'+
  '<circle cx="50" cy="52" r="4.4" fill="#f0b090" '+OL+'/>'+
  eye(43,46,4.2,3.6,{dy:0})+eye(57,46,4.2,3.6,{dy:0})+
  mir('<path d="M36 41Q43 36 48 41Q43 40 36 44z" fill="#fff" '+OL+'/>')+
  '<path d="M38 57C42 52 48 56 50 58C52 56 58 52 62 57C58 64 52 62 50 62C48 62 42 64 38 57z" fill="'+U('bd')+'" '+OL+'/>'+
  '<path d="M26 38L48 6Q56 -4 66 6Q57 4 57 14L74 38z" fill="'+U('ht')+'" '+OL+'/><ellipse cx="50" cy="38" rx="33" ry="7.5" fill="'+U('ht')+'" '+OL+'/><path d="M26 36Q50 44 74 36" stroke="'+U('gd')+'" stroke-width="2.4" fill="none"/><path d="M47 37l3-3 3 3-3 3z" fill="#ffd27a" '+OL+'/>'+
  '<g fill="#ffe27a"><path d="M42 24l1.2 2.6 2.8.3-2.1 1.9.6 2.8-2.5-1.4-2.5 1.4.6-2.8-2.1-1.9 2.8-.3z"/><circle cx="58" cy="22" r="1.4"/><circle cx="52" cy="14" r="1.1"/></g>'+
  '<path d="M84 100V66" stroke="#8a5a30" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="62" r="8" fill="#7af0ff" opacity=".3"><animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/></circle><circle cx="84" cy="62" r="5.4" fill="'+U('orb')+'" '+OL+'/>'+
  spk(14,36,4,2.3,'#e0d4ff')+spk(90,86,3,2.9,'#e0d4ff')+fin();

  /* 29 · Vampire count */
  C[11]=()=>bg('#7a0c1c','#14020a','#ff4a66','<circle cx="76" cy="22" r="13" fill="#ffe9ee" opacity=".9"/><circle cx="72" cy="19" r="3" fill="#e8c8d0" opacity=".6"/><path d="M8 30q6-6 10 0q4-4 8 2q-5 0-8 4q-3-4-10-6z" fill="#14020a"/><path d="M84 54q5-5 9 0q3-3 7 2q-4 0-7 3q-3-3-9-5z" fill="#14020a"/>')+
  '<defs>'+LG('cp',[[0,'#2a1636'],[1,'#07020c']],0,0,0,1)+LG('lr',[[0,'#e0243e'],[1,'#7a0818']],0,0,0,1)+RG('sk',[[0,'#fbf6fd'],[.6,'#e2d8ec'],[1,'#b4a6c6']],.45,.3,.85)+RG('ir',[[0,'#ffd0d6'],[.45,'#ff2a4a'],[1,'#8a0018']],.5,.4,.6)+LG('hr',[[0,'#3a3050'],[1,'#07050c']],0,0,0,1)+'</defs>'+
  '<path d="M0 100L12 46L34 72L50 60L66 72L88 46L100 100z" fill="'+U('cp')+'" '+OL+'/><path d="M17 100L29 66L50 82L71 66L83 100z" fill="'+U('lr')+'" '+OL+'/>'+
  '<path d="M43 62H57V76L50 82L43 76z" fill="#cfc4dc" '+OL+'/><path d="M41 76L50 86L59 76" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".0"/>'+
  '<path d="M31 46C30 30 38 24 50 24C62 24 70 30 69 46C69 60 61 74 50 74C39 74 31 60 31 46z" fill="'+U('sk')+'" '+OL+'/>'+
  '<path d="M31 44C27 22 44 13 53 14C68 15 73 30 69 44C65 34 58 29 50 36C42 29 36 34 31 44z" fill="'+U('hr')+'" '+OL+'/><path d="M40 20C46 16 56 16 62 21" stroke="#9a88c0" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>'+
  mir('<path d="M32 46Q40 40 48 47Q41 52 32 46z" fill="#fff" '+OL+'/><ellipse cx="40.4" cy="46.6" rx="4.4" ry="3.6" fill="'+U('ir')+'"/><ellipse cx="40.6" cy="46.6" rx="1" ry="3.2" fill="#14020a"/><circle cx="38.6" cy="45.4" r="1.1" fill="#fff"/><circle cx="40.4" cy="46.6" r="7" fill="#ff2a4a" opacity=".18"><animate attributeName="opacity" values=".1;.3;.1" dur="1.6s" repeatCount="indefinite"/></circle><path d="M31 40L47 44" stroke="#14020a" stroke-width="2.4" stroke-linecap="round"/>')+
  '<path d="M49 50L47 58H53z" fill="#c8bcd6" opacity=".8"/><path d="M42 63Q50 68 58 63" stroke="#7a1a30" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M44.4 64.6L46 71 47.6 65.6M52.4 65.6L54 71 55.6 64.6" fill="#fff" stroke="#c0a8b4" stroke-width=".5"/><circle cx="46" cy="72.5" r="1" fill="#e0243e"><animate attributeName="cy" values="72;77;72" dur="2.4s" repeatCount="indefinite"/></circle>'+
  '<circle cx="36" cy="58" r="3.2" fill="#ff6a86" opacity=".22"/><circle cx="64" cy="58" r="3.2" fill="#ff6a86" opacity=".22"/>'+
  spk(14,64,3.4,2.5,'#ffc0cc')+fin();

  /* 30 · Alien commander */
  C[12]=()=>bg('#14246a','#02030f','#6dffb5','<g fill="#9a6aff" opacity=".18"><circle cx="18" cy="30" r="22"/><circle cx="86" cy="64" r="26" fill="#2ad0ff"/></g><g fill="#fff"><circle cx="12" cy="16" r=".8"/><circle cx="88" cy="22" r=".9"/><circle cx="30" cy="92" r=".7"/></g>')+
  '<defs>'+LG('st',[[0,'#34467a'],[1,'#0a1030']],0,0,0,1)+RG('sk',[[0,'#d4ffc0'],[.5,'#46d878'],[1,'#128a4c']],.42,.28,.85)+RG('ey',[[0,'#2a6a8a'],[.5,'#08202e'],[1,'#010608']],.4,.3,.75)+LG('gd',[[0,'#fff3b0'],[.5,'#f0b429'],[1,'#8a5a00']],0,0,0,1)+RG('gm',[[0,'#fff'],[.4,'#6dffb5'],[1,'#0aa060']])+'</defs>'+
  '<path d="M4 100C8 82 28 76 50 76C72 76 92 82 96 100z" fill="'+U('st')+'" '+OL+'/><path d="M22 84Q50 96 78 84M30 92Q50 100 70 92" stroke="#6dffb5" stroke-width="1.4" fill="none" opacity=".9"/><path d="M50 86l3.4 4.2-3.4 4.2-3.4-4.2z" fill="'+U('gd')+'" '+OL+'/>'+
  '<rect x="43" y="68" width="14" height="12" fill="#2aa860" '+OL+'/>'+
  '<path d="M50 8C75 8 85 31 81 53C78 69 65 83 50 85C35 83 22 69 19 53C15 31 25 8 50 8z" fill="'+U('sk')+'" '+OL+'/>'+
  '<ellipse cx="38" cy="22" rx="10" ry="5" fill="#fff" opacity=".3" transform="rotate(-24 38 22)"/>'+
  mir('<path d="M21 43C30 32 47 40 47 58C36 63 21 57 21 43z" fill="'+U('ey')+'" '+OL+'/><path d="M26 44C32 40 38 42 41 48" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><circle cx="29" cy="52" r="1.4" fill="#9affd0"/><circle cx="41" cy="55" r="1" fill="#9affd0" opacity=".8"/>')+
  '<ellipse cx="46.6" cy="68" rx="1" ry="1.5" fill="#128a4c"/><ellipse cx="53.4" cy="68" rx="1" ry="1.5" fill="#128a4c"/><path d="M42 75Q50 79 58 75" stroke="#128a4c" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
  '<path d="M33 22Q50 12 67 22" stroke="'+U('gd')+'" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="50" cy="17" r="4.2" fill="'+U('gm')+'" stroke="#f0b429" stroke-width="1"><animate attributeName="opacity" values="1;.6;1" dur="1.8s" repeatCount="indefinite"/></circle>'+
  spk(88,40,3.6,2.6,'#b8ffe0')+spk(12,60,3,3.2,'#b8ffe0')+fin();

  /* 31 · Reaper */
  C[13]=()=>bg('#34075f','#05000f','#c06aff','<path d="M0 100C10 86 18 92 26 78C30 90 38 86 42 72C48 90 58 84 62 74C68 88 78 82 84 70C88 84 96 84 100 78V100z" fill="#b84dff" opacity=".5"><animate attributeName="opacity" values=".3;.7;.3" dur="2s" repeatCount="indefinite"/></path><circle cx="50" cy="40" r="30" fill="#e0c8ff" opacity=".12"/>')+
  '<defs>'+LG('hd',[[0,'#3a2468'],[1,'#07030f']],0,0,0,1)+RG('bn',[[0,'#fffdf0'],[.6,'#e8e0c8'],[1,'#a8a088']],.42,.3,.85)+RG('fl',[[0,'#fff'],[.35,'#e8a0ff'],[1,'#8a1aff']],.5,.6,.6)+LG('bl',[[0,'#f4f8ff'],[.5,'#a8b8d0'],[1,'#4a5a78']],0,0,1,1)+'</defs>'+
  '<path d="M8 100C4 60 20 14 50 11C80 14 96 60 92 100z" fill="'+U('hd')+'" '+OL+'/><path d="M8 100C4 60 20 14 50 11C80 14 96 60 92 100" fill="none" stroke="#c06aff" stroke-width="1.4" opacity=".8"><animate attributeName="opacity" values=".4;1;.4" dur="2.2s" repeatCount="indefinite"/></path>'+
  '<path d="M24 100C22 76 28 56 36 44M76 100C78 76 72 56 64 44" stroke="#000" stroke-opacity=".4" stroke-width="2" fill="none"/>'+
  '<path d="M29 48C29 24 71 24 71 48C71 72 60 86 50 86C40 86 29 72 29 48z" fill="#02000a"/>'+
  '<path d="M35 47C35 33 42 27 50 27C58 27 65 33 65 47C65 55 61 59 59 61V69H41V61C39 59 35 55 35 47z" fill="'+U('bn')+'" '+OL+'/>'+
  mir('<ellipse cx="42.4" cy="47" rx="5.6" ry="6.4" fill="#06020e"/><path d="M42.4 54C37 50 38 44 42.4 38C41 44 46 44 47 50C46 52 44.6 53 42.4 54z" fill="'+U('fl')+'"><animate attributeName="opacity" values="1;.65;1" dur="1.3s" repeatCount="indefinite"/></path>')+
  '<path d="M50 54L46.4 60H53.6z" fill="#06020e"/><path d="M43 69V64M47 69V64M50 69V64M53 69V64M57 69V64" stroke="#06020e" stroke-width="1.4"/><path d="M40 62H60" stroke="#06020e" stroke-width="1.2"/>'+
  '<path d="M38 34L44 40M62 33L58 38" stroke="#7a7058" stroke-width=".9" opacity=".6"/>'+
  '<path d="M96 8C84 2 70 6 64 16C72 12 84 14 96 22z" fill="'+U('bl')+'" '+OL+'/><path d="M94 12C86 8 76 10 70 15" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".8"/><path d="M96 20L92 100" stroke="#5a3a20" stroke-width="2.4" stroke-linecap="round"/>'+
  spk(12,22,3.4,2.4,'#e0c8ff')+spk(14,70,3,3,'#e0c8ff')+fin();

  /* 32 · Emperor */
  C[14]=()=>bg('#8a1228','#1c0510','#ffd98a','<path d="M0 0H22L10 100H0z" fill="#5a0a1c" opacity=".7"/><path d="M100 0H78L90 100H100z" fill="#5a0a1c" opacity=".7"/>')+
  '<defs>'+LG('cl',[[0,'#d0243a'],[1,'#6a0818']],0,0,0,1)+RG('sk',[[0,'#fcdcbc'],[1,'#e0a67e']],.45,.3,.8)+LG('bd',[[0,'#ffffff'],[1,'#c8cede']],0,0,0,1)+RG('ir',[[0,'#e8f6ff'],[.5,'#6aa0e0'],[1,'#26407a']],.5,.4,.6)+LG('gd',[[0,'#fff6bd'],[.5,'#f5b92e'],[1,'#9a6200']],0,0,0,1)+'</defs>'+
  '<path d="M2 100C4 78 26 70 50 70C74 70 96 78 98 100z" fill="'+U('cl')+'" '+OL+'/><path d="M10 84C26 72 74 72 90 84C94 90 94 94 94 96C78 82 22 82 6 96C6 94 6 90 10 84z" fill="#fff" '+OL+'/><g fill="#1a1020"><circle cx="20" cy="86" r="1.5"/><circle cx="34" cy="82" r="1.5"/><circle cx="50" cy="81" r="1.5"/><circle cx="66" cy="82" r="1.5"/><circle cx="80" cy="86" r="1.5"/></g>'+
  '<path d="M27 52C25 74 37 91 50 93C63 91 75 74 73 52C67 62 59 66 50 66C41 66 33 62 27 52z" fill="'+U('bd')+'" '+OL+'/><path d="M40 70Q44 82 50 90M60 70Q56 82 50 90M34 62Q34 74 40 84M66 62Q66 74 60 84" stroke="#9aa6c0" stroke-width="1" fill="none" stroke-linecap="round" opacity=".8"/>'+
  '<ellipse cx="50" cy="47" rx="19" ry="21" fill="'+U('sk')+'" '+OL+'/>'+
  '<circle cx="50" cy="52" r="4.2" fill="#e0a082" '+OL+'/>'+
  eye(41.5,46,4.6,3.8,{dy:0})+eye(58.5,46,4.6,3.8,{dy:0})+
  '<path d="M34 41Q41 36 47 41M66 41Q59 36 53 41" stroke="#b8bccc" stroke-width="3" fill="none" stroke-linecap="round"/>'+
  '<path d="M38 59C42 54 48 58 50 60C52 58 58 54 62 59C58 66 52 64 50 64C48 64 42 66 38 59z" fill="'+U('bd')+'" '+OL+'/>'+
  '<path d="M27 36L24 8L38 22L50 2L62 22L76 8L73 36z" fill="'+U('gd')+'" '+OL+'/><path d="M27 36H73V43H27z" fill="'+U('gd')+'" '+OL+'/><circle cx="24" cy="8" r="2.4" fill="#fff" '+OL+'/><circle cx="50" cy="2.4" r="2.4" fill="#fff" '+OL+'/><circle cx="76" cy="8" r="2.4" fill="#fff" '+OL+'/><circle cx="50" cy="39.5" r="2.6" fill="#ff3d5a" '+OL+'/><circle cx="38" cy="39.5" r="1.8" fill="#4ac8ff" '+OL+'/><circle cx="62" cy="39.5" r="1.8" fill="#4aff9a" '+OL+'/><path d="M32 30L36 24M64 30L68 24" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round"/>'+
  spk(10,52,3.6,2.4,'#fff3b0')+spk(90,56,3.2,3,'#fff3b0')+fin();
  return C[k]?C[k]():'';
};

const avatarArt=i=>{
  if(i>=18)return window.animeArt3D?window.animeArt3D(i):premArt(i);
  const id=k=>'av'+i+k;
  const bg=(a,b,pat)=>`<defs><linearGradient id="${id('g')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="100" height="100" fill="url(#${id('g')})"/>${pat?P[pat]:''}`;
  const dots=(c,op)=>{let s=`<g fill="${c}" opacity="${op}">`;for(let y=8;y<100;y+=14)for(let x=(y/14|0)%2?15:8;x<100;x+=14)s+=`<circle cx="${x}" cy="${y}" r="1.6"/>`;return s+'</g>'};
  const P={
    stars:'<g fill="#fff" opacity=".85"><circle cx="12" cy="14" r="1"/><circle cx="86" cy="20" r="1.4"/><circle cx="20" cy="72" r="1.2"/><circle cx="91" cy="64" r="1"/><circle cx="72" cy="9" r=".8"/><circle cx="7" cy="42" r=".8"/><circle cx="94" cy="44" r=".9"/><circle cx="34" cy="8" r=".9"/></g>',
    rings:'<g fill="none" stroke="#fff" opacity=".14" stroke-width="2"><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="54"/></g>',
    dots:dots('#fff',.16),
    stripes:'<g stroke="#fff" opacity=".13" stroke-width="3"><path d="M-10 30L30 -10M-10 60L60 -10M-10 90L90 -10M10 110L110 10M40 110L110 40M70 110L110 70"/></g>',
    code:'<g fill="#fff" opacity=".18"><rect x="6" y="10" width="26" height="3" rx="1.5"/><rect x="12" y="18" width="18" height="3" rx="1.5"/><rect x="68" y="14" width="24" height="3" rx="1.5"/><rect x="74" y="22" width="16" height="3" rx="1.5"/><rect x="8" y="84" width="20" height="3" rx="1.5"/><rect x="66" y="82" width="26" height="3" rx="1.5"/><rect x="72" y="90" width="14" height="3" rx="1.5"/></g>',
    bamboo:'<g stroke="#2f6b1c" opacity=".35" stroke-width="5"><path d="M10 0v100M90 0v100"/></g><g stroke="#2f6b1c" opacity=".35" stroke-width="2"><path d="M4 30h12M4 66h12M84 40h12M84 78h12"/></g>',
    moon:'<circle cx="80" cy="20" r="9" fill="#ffe9a8" opacity=".9"/><circle cx="84" cy="17" r="8" fill="#0f2027"/>'+'<g fill="#fff" opacity=".8"><circle cx="14" cy="16" r="1"/><circle cx="30" cy="8" r=".8"/><circle cx="12" cy="60" r="1"/></g>'
  };
  const eyes=(c='#13203a',y=47,dx=8,r=2.7)=>`<circle cx="${50-dx}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${50+dx}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${50-dx+.9}" cy="${y-.9}" r=".95" fill="#fff"/><circle cx="${50+dx+.9}" cy="${y-.9}" r=".95" fill="#fff"/>`;
  const smile=(y=58,w=6,c='#13203a')=>`<path d="M${50-w} ${y}q${w} ${w*.95} ${w*2} 0" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const sparkle=(x,y,s,d)=>`<path d="M${x} ${y-s}l${s*.28} ${s*.72} ${s*.72} ${s*.28}-${s*.72} ${s*.28}-${s*.28} ${s*.72}-${s*.28}-${s*.72}-${s*.72}-${s*.28} ${s*.72}-${s*.28}z" fill="#fff"><animate attributeName="opacity" values="0;1;0" dur="${d}s" repeatCount="indefinite"/></path>`;
  const person=o=>{
    const {skin,hair,cloth,style,acc,accC,hood}=o;
    const cap=`<path d="M31 46C28 24 40 18 50 18s22 6 19 28c-3-9-8-13-19-13s-16 4-19 13z" fill="${hair}"/>`;
    let back='',front='';
    switch(style){
      case 'spiky':back=`<path d="M29 38l-7-15 13 8 3-15 9 11 9-11 4 15 11-8-5 15z" fill="${hair}"/>`;front=cap;break;
      case 'long':back=`<path d="M27 44c-7 22-3 38 7 46h32c10-8 14-24 7-46z" fill="${hair}"/>`;front=cap;break;
      case 'bun':back=`<circle cx="50" cy="13" r="8" fill="${hair}"/>`;front=cap;break;
      case 'afro':back=`<circle cx="50" cy="38" r="27" fill="${hair}"/>`;front=`<path d="M31 46C30 34 38 30 50 30s20 4 19 16c-4-7-9-10-19-10s-15 3-19 10z" fill="${hair}"/>`;break;
      case 'mohawk':front=`<path d="M43 28L45 5h10l2 23z" fill="${hair}"/>`;break;
      case 'beard':front=cap+`<path d="M31 52c1 18 9 24 19 24s18-6 19-24c-4 6-10 9-19 9s-15-3-19-9z" fill="${hair}"/>`;break;
      default:front=cap;
    }
    let a='';
    if(acc==='headphones')a=`<path d="M30 48C26 20 74 20 70 48" fill="none" stroke="#1a1a2e" stroke-width="3.2"/><rect x="25" y="44" width="8" height="14" rx="4" fill="${accC}"/><rect x="67" y="44" width="8" height="14" rx="4" fill="${accC}"/>`;
    if(acc==='glasses')a=`<rect x="34" y="42" width="13" height="10" rx="4" fill="rgba(255,255,255,.25)" stroke="${accC}" stroke-width="1.8"/><rect x="53" y="42" width="13" height="10" rx="4" fill="rgba(255,255,255,.25)" stroke="${accC}" stroke-width="1.8"/><path d="M47 46h6" stroke="${accC}" stroke-width="1.8"/>`;
    if(acc==='visor')a=`<rect x="31" y="40" width="38" height="11" rx="5.5" fill="${accC}"/><rect x="34" y="42.5" width="15" height="2.2" rx="1.1" fill="#fff" opacity=".75"/>`;
    if(acc==='beret')a=`<ellipse cx="46" cy="22" rx="21" ry="7.5" fill="${accC}"/><circle cx="57" cy="14" r="2.6" fill="${accC}"/>`;
    if(acc==='cap')a=`<path d="M30 36C30 17 70 17 70 36z" fill="${accC}"/><path d="M46 36h30q3 3 0 6H46z" fill="${accC}"/>`;
    if(acc==='bandana')a=`<path d="M30 36c8-9 32-9 40 0v6c-9-5-31-5-40 0z" fill="${accC}"/><circle cx="69" cy="39" r="3.2" fill="${accC}"/>`;
    const star=acc==='cheekstar'?`<path d="M64 56l1.2 2.6 2.8.3-2.1 1.9.6 2.8-2.5-1.4-2.5 1.4.6-2.8-2.1-1.9 2.8-.3z" fill="${accC}"/>`:'';
    const hoodB=hood?`<path d="M26 58c-4-30 6-46 24-46s28 16 24 46z" fill="${cloth}"/>`:'';
    return `<path d="M8 100C10 79 28 71 50 71s40 8 42 29z" fill="${cloth}"/><path d="M50 71v29" stroke="#000" opacity=".12" stroke-width="1.5"/>${hoodB}${back}<rect x="43" y="62" width="14" height="12" fill="${skin}"/><rect x="43" y="62" width="14" height="5" fill="#000" opacity=".12"/><circle cx="31" cy="50" r="3.6" fill="${skin}"/><circle cx="69" cy="50" r="3.6" fill="${skin}"/><ellipse cx="50" cy="48" rx="19" ry="22" fill="${skin}"/><ellipse cx="42" cy="38" rx="8" ry="5" fill="#fff" opacity=".13"/>${front}${acc==='visor'?'':eyes()}<circle cx="38" cy="55" r="3" fill="#ff7a8a" opacity=".28"/><circle cx="62" cy="55" r="3" fill="#ff7a8a" opacity=".28"/>${smile(o.style==='beard'?60:58)}${star}${a}`;
  };
  const astro=(a,b,suit,ant)=>`<path d="M8 100C10 80 28 72 50 72s40 8 42 28z" fill="${suit}"/><rect x="38" y="74" width="24" height="10" rx="3" fill="#cfd8ec"/><path d="M50 18V9" stroke="#aebfe0" stroke-width="2"/><circle cx="50" cy="8" r="3.2" fill="${ant}"><animate attributeName="opacity" values="1;.3;1" dur="1.6s" repeatCount="indefinite"/></circle><circle cx="50" cy="46" r="29" fill="#f4f7ff" stroke="#aebfe0" stroke-width="3"/><defs><linearGradient id="${id('v')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><ellipse cx="50" cy="47" rx="22" ry="19" fill="url(#${id('v')})"/><path d="M35 38c4-5 12-7 19-5" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" fill="none"/><circle cx="43" cy="49" r="2.6" fill="#fff"/><circle cx="57" cy="49" r="2.6" fill="#fff"/><path d="M45 56q5 4 10 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const robot=()=>`<defs><linearGradient id="${id('m')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe8f3"/><stop offset="1" stop-color="#8fa3ba"/></linearGradient></defs><path d="M12 100C14 82 30 76 50 76s36 6 38 24z" fill="#5b6d82"/><rect x="42" y="66" width="16" height="12" fill="#6d7f95"/><path d="M50 26V12" stroke="#8fa3ba" stroke-width="3"/><circle cx="50" cy="10" r="4" fill="#ff5d73"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle><rect x="26" y="26" width="48" height="42" rx="11" fill="url(#${id('m')})" stroke="#6d7f95" stroke-width="2"/><rect x="18" y="40" width="8" height="14" rx="3" fill="#8fa3ba"/><rect x="74" y="40" width="8" height="14" rx="3" fill="#8fa3ba"/><rect x="33" y="38" width="12" height="10" rx="4" fill="#0b2b3a"/><rect x="55" y="38" width="12" height="10" rx="4" fill="#0b2b3a"/><circle cx="39" cy="43" r="3.4" fill="#5df2ff"><animate attributeName="r" values="3.4;2.4;3.4" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="61" cy="43" r="3.4" fill="#5df2ff"><animate attributeName="r" values="3.4;2.4;3.4" dur="2.4s" repeatCount="indefinite"/></circle><path d="M38 58h24M38 62h24" stroke="#4b5c70" stroke-width="2" stroke-linecap="round"/>`;
  const ninja=()=>`<path d="M8 100C10 80 28 72 50 72s40 8 42 28z" fill="#262637"/><circle cx="50" cy="46" r="26" fill="#1b1b2b"/><rect x="29" y="38" width="42" height="14" rx="7" fill="#f0c8a0"/><circle cx="41" cy="45" r="2.8" fill="#13203a"/><circle cx="59" cy="45" r="2.8" fill="#13203a"/><path d="M38 41l6 2M62 41l-6 2" stroke="#13203a" stroke-width="1.8" stroke-linecap="round"/><path d="M24 33c10-6 42-6 52 0v7c-12-5-40-5-52 0z" fill="#e63946"/><path d="M74 36l14 6-10 3zM74 38l12 12-12-4z" fill="#e63946"/>`;
  const fox=()=>`<path d="M18 16l18 20-18 14zM82 16L64 36l18 14z" fill="#e8702a"/><path d="M24 26l10 11-10 8zM76 26L66 37l10 8z" fill="#2b1a2e"/><path d="M16 48C16 32 32 28 50 28s34 4 34 20c0 22-16 38-34 38S16 70 16 48z" fill="#f48a3a"/><path d="M16 52c12 2 22 10 34 28 12-18 22-26 34-28-2 20-16 34-34 34S18 72 16 52z" fill="#fff4e6"/><circle cx="36" cy="52" r="3" fill="#2b1a2e"/><circle cx="64" cy="52" r="3" fill="#2b1a2e"/><circle cx="37" cy="51" r="1" fill="#fff"/><circle cx="65" cy="51" r="1" fill="#fff"/><circle cx="50" cy="71" r="4.2" fill="#2b1a2e"/><path d="M50 75v4M44 80q6 4 12 0" stroke="#2b1a2e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  const panda=()=>`<circle cx="25" cy="28" r="10" fill="#1d1d24"/><circle cx="75" cy="28" r="10" fill="#1d1d24"/><circle cx="50" cy="54" r="30" fill="#f6f6f6"/><ellipse cx="37" cy="50" rx="7.5" ry="10" fill="#1d1d24" transform="rotate(22 37 50)"/><ellipse cx="63" cy="50" rx="7.5" ry="10" fill="#1d1d24" transform="rotate(-22 63 50)"/><circle cx="38" cy="50" r="2.8" fill="#fff"/><circle cx="62" cy="50" r="2.8" fill="#fff"/><ellipse cx="50" cy="63" rx="5.5" ry="4" fill="#1d1d24"/><path d="M43 69q7 6 14 0" stroke="#1d1d24" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const lion=()=>`<circle cx="50" cy="52" r="40" fill="#b4561a"/><circle cx="50" cy="52" r="40" fill="none" stroke="#7a3410" stroke-width="7" stroke-dasharray="7 5" opacity=".75"/><circle cx="29" cy="26" r="8" fill="#e6a24f"/><circle cx="71" cy="26" r="8" fill="#e6a24f"/><circle cx="50" cy="55" r="25" fill="#f4bd62"/><ellipse cx="50" cy="65" rx="13" ry="10" fill="#fde2b0"/><path d="M44 60h12l-6 7z" fill="#5a2a14"/><path d="M50 67v4M44 72q6 4 12 0" stroke="#5a2a14" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="39" cy="50" r="3" fill="#2b1a10"/><circle cx="61" cy="50" r="3" fill="#2b1a10"/><circle cx="40" cy="49" r="1" fill="#fff"/><circle cx="62" cy="49" r="1" fill="#fff"/>`;
  const tiger=()=>`<circle cx="27" cy="27" r="9" fill="#f7931e"/><circle cx="73" cy="27" r="9" fill="#f7931e"/><circle cx="27" cy="27" r="4.5" fill="#fff"/><circle cx="73" cy="27" r="4.5" fill="#fff"/><path d="M20 42C20 28 34 24 50 24s30 4 30 18c0 24-14 40-30 40S20 66 20 42z" fill="#f7931e"/><path d="M50 25v11M41 27l2 10M59 27l-2 10" stroke="#1d1d24" stroke-width="3" stroke-linecap="round"/><path d="M20 46l10 2M20 56l11 0M80 46l-10 2M80 56l-11 0" stroke="#1d1d24" stroke-width="3" stroke-linecap="round"/><ellipse cx="50" cy="66" rx="14" ry="11" fill="#fff4e0"/><path d="M45 61h10l-5 6z" fill="#ff7a8a"/><path d="M50 67v4M44 72q6 4 12 0" stroke="#1d1d24" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="50" rx="4" ry="3.4" fill="#9cf06a"/><ellipse cx="62" cy="50" rx="4" ry="3.4" fill="#9cf06a"/><circle cx="38" cy="50" r="1.8" fill="#111"/><circle cx="62" cy="50" r="1.8" fill="#111"/>`;
  const frog=()=>`<ellipse cx="50" cy="60" rx="35" ry="26" fill="#5fcf4a"/><circle cx="33" cy="36" r="13" fill="#76e05f"/><circle cx="67" cy="36" r="13" fill="#76e05f"/><circle cx="33" cy="36" r="9" fill="#fff"/><circle cx="67" cy="36" r="9" fill="#fff"/><circle cx="34" cy="37" r="4.5" fill="#12202a"/><circle cx="66" cy="37" r="4.5" fill="#12202a"/><circle cx="35.5" cy="35.5" r="1.4" fill="#fff"/><circle cx="67.5" cy="35.5" r="1.4" fill="#fff"/><path d="M22 62q28 20 56 0" stroke="#1f6b2a" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="46" cy="56" r="1.4" fill="#1f6b2a"/><circle cx="54" cy="56" r="1.4" fill="#1f6b2a"/><circle cx="28" cy="64" r="4" fill="#ff8aa0" opacity=".5"/><circle cx="72" cy="64" r="4" fill="#ff8aa0" opacity=".5"/>`;
  const dragon=()=>`<path d="M30 30l-9-20 17 12zM70 30l9-20-17 12z" fill="#f0cb7a"/><path d="M20 50C20 32 34 28 50 28s30 4 30 22c0 20-12 36-30 36S20 70 20 50z" fill="#3fb97a"/><path d="M34 36l4-6M50 32v-6M66 36l-4-6" stroke="#2c8f5c" stroke-width="3" stroke-linecap="round"/><ellipse cx="50" cy="68" rx="18" ry="13" fill="#62dc96"/><circle cx="43" cy="66" r="2" fill="#1d6b43"/><circle cx="57" cy="66" r="2" fill="#1d6b43"/><ellipse cx="37" cy="50" rx="6.5" ry="4.8" fill="#ffd23f"/><ellipse cx="63" cy="50" rx="6.5" ry="4.8" fill="#ffd23f"/><rect x="36" y="46" width="2" height="8" rx="1" fill="#111"/><rect x="62" y="46" width="2" height="8" rx="1" fill="#111"/><path d="M44 80c-7 8 4 8 0 15 9-5 9-11 6-17z" fill="#ff7a2f"><animate attributeName="opacity" values=".4;1;.4" dur=".8s" repeatCount="indefinite"/></path><path d="M56 80c7 8-4 8 0 15-9-5-9-11-6-17z" fill="#ffb347"><animate attributeName="opacity" values="1;.4;1" dur=".8s" repeatCount="indefinite"/></path>`;
  const unicorn=()=>`<path d="M24 26C10 48 14 74 32 84L38 58z" fill="#ff9fd0"/><path d="M30 20c-8 18-4 34 8 46l6-22z" fill="#b8a4ff"/><path d="M36 18c-4 14 0 26 10 36l4-18z" fill="#7cc6ff"/><path d="M56 6L48 36h16z" fill="#f0cb7a"/><path d="M52 18l8 4M50 26l11 4" stroke="#c9961f" stroke-width="1.5"/><path d="M40 34l-6-12 12 8zM66 34l6-12-12 8z" fill="#fff"/><ellipse cx="54" cy="58" rx="24" ry="28" fill="#fff"/><path d="M44 52q4-4 8 0" stroke="#7b5cd6" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M60 52q4-4 8 0" stroke="#7b5cd6" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="54" cy="74" rx="14" ry="9" fill="#ffe3f1"/><circle cx="49" cy="74" r="1.6" fill="#d77aa8"/><circle cx="59" cy="74" r="1.6" fill="#d77aa8"/><circle cx="42" cy="64" r="3.4" fill="#ff8aa0" opacity=".5"/><circle cx="68" cy="64" r="3.4" fill="#ff8aa0" opacity=".5"/>`;
  const owl=()=>`<path d="M18 40C18 20 34 14 50 26 66 14 82 20 82 40v32c0 14-14 22-32 22S18 86 18 72z" fill="#8b5e3c"/><path d="M26 18l10 12-14 4zM74 18L64 30l14 4z" fill="#6a4328"/><ellipse cx="50" cy="74" rx="17" ry="18" fill="#d9b48a"/><path d="M40 70q4 4 8 0M52 70q4 4 8 0M40 78q4 4 8 0M52 78q4 4 8 0" stroke="#a97c50" stroke-width="1.6" fill="none"/><circle cx="35" cy="46" r="13" fill="#f4e4b8" stroke="#5a3a20" stroke-width="2"/><circle cx="65" cy="46" r="13" fill="#f4e4b8" stroke="#5a3a20" stroke-width="2"/><circle cx="35" cy="46" r="6" fill="#1a1a1a"/><circle cx="65" cy="46" r="6" fill="#1a1a1a"/><circle cx="37" cy="44" r="2" fill="#fff"/><circle cx="67" cy="44" r="2" fill="#fff"/><path d="M45 54h10l-5 11z" fill="#f0a030"/>`;
  const wolf=()=>`<path d="M14 12l24 22-20 18zM86 12L62 34l20 18z" fill="#6d7a86"/><path d="M22 14l12 14-12 8zM78 14L66 28l12 8z" fill="#2b3340"/><path d="M20 48C20 34 34 28 50 28s30 6 30 20c0 22-10 36-30 42-20-6-30-20-30-42z" fill="#8e9ba6"/><path d="M28 56c8 0 16 6 22 20 6-14 14-20 22-20-2 16-10 28-22 32-12-4-20-16-22-32z" fill="#e6ebef"/><path d="M30 46l10 4M70 46l-10 4" stroke="#2b3340" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="38" cy="52" rx="4.4" ry="3.4" fill="#ffd23f"/><ellipse cx="62" cy="52" rx="4.4" ry="3.4" fill="#ffd23f"/><circle cx="38" cy="52" r="1.8" fill="#111"/><circle cx="62" cy="52" r="1.8" fill="#111"/><path d="M44 72h12l-6 7z" fill="#1d1d24"/>`;
  const shark=()=>`<path d="M50 4l18 26H32z" fill="#6e8aa0"/><path d="M14 54C14 36 30 30 50 30s36 6 36 24c0 22-16 34-36 34S14 76 14 54z" fill="#7fa0b8"/><path d="M20 64c10 12 50 12 60 0-2 14-14 24-30 24S22 78 20 64z" fill="#e9f3f8"/><circle cx="34" cy="50" r="3.4" fill="#0f1c24"/><circle cx="66" cy="50" r="3.4" fill="#0f1c24"/><circle cx="35" cy="49" r="1.1" fill="#fff"/><circle cx="67" cy="49" r="1.1" fill="#fff"/><path d="M26 62q24 18 48 0q-24 8-48 0z" fill="#16313f"/><path d="M30 64l4 5 4-4 4 6 4-5 4 6 4-5 4 6 4-5 4 5 4-4" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`;
  const octo=()=>`<path d="M22 64c-12 14 0 24 7 21s2-11 7-15M38 72c-5 14 4 20 9 14M62 72c5 14-4 20-9 14M78 64c12 14 0 24-7 21s-2-11-7-15" stroke="#e46b9b" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M18 58C18 28 34 16 50 16s32 12 32 42c0 9-9 15-32 15S18 67 18 58z" fill="#f0719f"/><circle cx="34" cy="30" r="3" fill="#ff9fc0"/><circle cx="62" cy="26" r="2.4" fill="#ff9fc0"/><circle cx="70" cy="38" r="3.4" fill="#ff9fc0"/><circle cx="38" cy="50" r="8" fill="#fff"/><circle cx="62" cy="50" r="8" fill="#fff"/><circle cx="39" cy="51" r="4" fill="#2a1840"/><circle cx="61" cy="51" r="4" fill="#2a1840"/><circle cx="40.5" cy="49.5" r="1.3" fill="#fff"/><circle cx="62.5" cy="49.5" r="1.3" fill="#fff"/><path d="M44 62q6 5 12 0" stroke="#a02a64" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const fairy=()=>`<path d="M50 50C20 8 4 40 22 58 6 66 24 92 46 68z" fill="#ffd1f0" stroke="#fff" stroke-width="1.5" opacity=".95"/><path d="M50 50C80 8 96 40 78 58 94 66 76 92 54 68z" fill="#d1f0ff" stroke="#fff" stroke-width="1.5" opacity=".95"/><circle cx="26" cy="40" r="5" fill="#ff7ac6"/><circle cx="74" cy="40" r="5" fill="#6ec6ff"/><circle cx="30" cy="68" r="3.4" fill="#b8a4ff"/><circle cx="70" cy="68" r="3.4" fill="#ffd27a"/><path d="M50 40v46" stroke="#7a4d9a" stroke-width="4" stroke-linecap="round"/><path d="M50 36C44 20 36 16 32 18M50 36C56 20 64 16 68 18" stroke="#7a4d9a" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="32" cy="18" r="2.2" fill="#ffd27a"/><circle cx="68" cy="18" r="2.2" fill="#ffd27a"/><circle cx="50" cy="40" r="13" fill="#f5cfb0"/><path d="M37 40c0-12 8-16 14-14 8 0 12 6 12 14-4-6-8-8-13-8s-9 2-13 8z" fill="#ff7ab8"/>${eyes('#13203a',42,5,2.2)}${smile(47,4)}`;
  const king=()=>`<path d="M8 100C10 76 28 68 50 68s40 8 42 32z" fill="#b3202a"/><path d="M26 70c6 8 18 12 24 12s18-4 24-12c-4 14-14 20-24 20S30 84 26 70z" fill="#fff"/><g fill="#1d1d24"><circle cx="38" cy="82" r="1.6"/><circle cx="50" cy="86" r="1.6"/><circle cx="62" cy="82" r="1.6"/></g><rect x="43" y="62" width="14" height="10" fill="#e7b48c"/><ellipse cx="50" cy="48" rx="19" ry="22" fill="#f0c19a"/><path d="M31 52c1 18 9 24 19 24s18-6 19-24c-4 6-10 9-19 9s-15-3-19-9z" fill="#c9ced6"/>${eyes()}<path d="M43 59q7 4 14 0" stroke="#7a4a4a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M30 32l-2-20 11 11 11-16 11 16 11-11-2 20z" fill="#f0cb7a" stroke="#c9961f" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="26" r="3" fill="#ff4f6d"/><circle cx="38" cy="29" r="2" fill="#6ec6ff"/><circle cx="62" cy="29" r="2" fill="#6fe3b0"/>`;
  const skull=()=>`<circle cx="50" cy="46" r="38" fill="#b84dff" opacity=".18"><animate attributeName="opacity" values=".1;.3;.1" dur="2.4s" repeatCount="indefinite"/></circle><path d="M25 46C25 26 35 16 50 16s25 10 25 30c0 8-3 12-8 15v14H33V61c-5-3-8-7-8-15z" fill="#f2f2f2"/><circle cx="39" cy="46" r="8" fill="#101018"/><circle cx="61" cy="46" r="8" fill="#101018"/><circle cx="39" cy="46" r="3" fill="#ff3d6e"><animate attributeName="r" values="3;4.2;3" dur="1.4s" repeatCount="indefinite"/></circle><circle cx="61" cy="46" r="3" fill="#ff3d6e"><animate attributeName="r" values="3;4.2;3" dur="1.4s" repeatCount="indefinite"/></circle><path d="M50 55l-4 8h8z" fill="#101018"/><path d="M40 72v-7M46 73v-8M54 73v-8M60 72v-7" stroke="#101018" stroke-width="2"/><path d="M33 75h34" stroke="#d4d4d4" stroke-width="2"/>`;
  const alien=()=>`<path d="M50 12C26 12 18 36 22 54c4 17 16 32 28 32s24-15 28-32c4-18-4-42-28-42z" fill="#7be07b"/><ellipse cx="42" cy="30" rx="8" ry="4" fill="#fff" opacity=".18"/><path d="M26 44c11-3 20 6 19 15-11 2-21-2-19-15z" fill="#0b1a14"/><path d="M74 44c-11-3-20 6-19 15 11 2 21-2 19-15z" fill="#0b1a14"/><circle cx="36" cy="51" r="2" fill="#fff" opacity=".8"/><circle cx="64" cy="51" r="2" fill="#fff" opacity=".8"/><path d="M44 72q6 4 12 0" stroke="#2a7a3a" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="48" cy="62" r="1" fill="#2a7a3a"/><circle cx="52" cy="62" r="1" fill="#2a7a3a"/>`;
  const vamp=()=>`<path d="M6 100L24 64 50 76 76 64 94 100z" fill="#1a1020"/><path d="M24 64L50 92 76 64 50 76z" fill="#a3162a"/><rect x="43" y="62" width="14" height="12" fill="#d9cfe0"/><ellipse cx="50" cy="48" rx="19" ry="22" fill="#e8e0ee"/><path d="M31 44C30 24 42 19 53 20c14 1 17 13 16 24-4-10-12-14-19-8-8 4-14 2-19 8z" fill="#14101c"/>${eyes('#d1143a',48,8,2.8)}<path d="M43 58q7 4 14 0" stroke="#7a2a3a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M44 58l2 7 2-7zM52 58l2 7 2-7z" fill="#fff"/><path d="M33 40l5-2M67 40l-5-2" stroke="#14101c" stroke-width="2" stroke-linecap="round"/>`;
  const wizard=()=>`<path d="M8 100C10 80 28 72 50 72s40 8 42 28z" fill="#3a2a8a"/><path d="M32 54c0 22 8 36 18 40 10-4 18-18 18-40-6 8-12 10-18 10s-12-2-18-10z" fill="#f0f0f8"/><ellipse cx="50" cy="48" rx="17" ry="19" fill="#f0c19a"/><path d="M33 56c3 4 8 6 17 6s14-2 17-6c-2 10-8 16-17 16s-15-6-17-16z" fill="#f0f0f8"/>${eyes('#13203a',46,7,2.4)}<path d="M40 54q10 4 20 0" stroke="#d9d9e6" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 -2L25 36h50z" fill="#5b3fd0"/><ellipse cx="50" cy="36" rx="31" ry="6.5" fill="#4a31b0"/><path d="M44 22l1.4 3 3.2.4-2.4 2.2.7 3.2-2.9-1.7-2.9 1.7.7-3.2-2.4-2.2 3.2-.4z" fill="#ffd27a"/><circle cx="57" cy="14" r="2" fill="#ffd27a"/><circle cx="60" cy="28" r="1.6" fill="#ffd27a"/>`;
  const frame=`<circle cx="50" cy="50" r="47" fill="none" stroke="#f0cb7a" stroke-width="1.8" stroke-dasharray="3 5"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="16s" repeatCount="indefinite"/></circle>${sparkle(86,16,5,2.4)}${sparkle(13,82,4,3.1)}`;
  const D=[
    ['#2b1055','#7597de','stars',()=>person({skin:'#f2c7a5',hair:'#ff4fd8',cloth:'#6b4bd8',style:'spiky',acc:'headphones',accC:'#5df2ff'})],
    ['#ff9a9e','#7b2ff7','dots',()=>person({skin:'#f5cfb0',hair:'#ff7ab8',cloth:'#ff4f9a',style:'long',acc:'cheekstar',accC:'#ffd27a'})],
    ['#0f2027','#2c5364','stars',()=>astro('#5ac8fa','#1d3d7a','#e9eef9','#ff5d73')],
    ['#41295a','#2f0743','stars',()=>astro('#ff9fd0','#6a2a8a','#f6e9ff','#ffd27a')],
    ['#0f2027','#00b09b','code',()=>person({skin:'#e0ac84',hair:'#2b2b3a',cloth:'#1fbf8f',style:'short',acc:'glasses',accC:'#7cc6ff',hood:true})],
    ['#1e3c72','#2a5298','code',()=>person({skin:'#e8b98f',hair:'#7a3b1d',cloth:'#7cc6ff',style:'bun',acc:'glasses',accC:'#ff9fd0'})],
    ['#ffecd2','#fcb69f','dots',()=>person({skin:'#f0c8a0',hair:'#4a2f1b',cloth:'#f09a8a',style:'short',acc:'beret',accC:'#e63946'})],
    ['#a1c4fd','#c2e9fb','rings',()=>person({skin:'#d9a57c',hair:'#ff7a2f',cloth:'#6fd0d0',style:'long',acc:'beret',accC:'#14b8a6'})],
    ['#434343','#101010','stripes',()=>person({skin:'#e3b48f',hair:'#5b3a22',cloth:'#4f7ccf',style:'beard',acc:'cap',accC:'#e63946'})],
    ['#f6d365','#fda085','rings',()=>person({skin:'#a36b45',hair:'#2a1a12',cloth:'#ffd27a',style:'afro',acc:'cheekstar',accC:'#ff4f9a'})],
    ['#84fab0','#8fd3f4','dots',()=>person({skin:'#f6d5b8',hair:'#e8c26a',cloth:'#6fe3b0',style:'short',acc:'cap',accC:'#3b82f6'})],
    ['#a18cd1','#fbc2eb','rings',()=>person({skin:'#a8714f',hair:'#1c1c28',cloth:'#b8a4ff',style:'long',acc:'bandana',accC:'#ff4f6d'})],
    ['#0f0c29','#302b63','stripes',()=>person({skin:'#6b4430',hair:'#101018',cloth:'#ff3d6e',style:'mohawk',acc:'visor',accC:'#39e7a4'})],
    ['#240b36','#c31432','stars',()=>person({skin:'#7d523a',hair:'#2a0f3d',cloth:'#ff9fd0',style:'long',acc:'headphones',accC:'#ff4fd8'})],
    ['#232526','#414345','stripes',ninja],
    ['#1b2a49','#3a506b','code',robot],
    ['#41295a','#ff7e5f','rings',fox],
    ['#56ab2f','#a8e063','bamboo',panda],
    ['#f12711','#f5af19','rings',lion],
    ['#0f2027','#ff8008','stripes',tiger],
    ['#134e5e','#71b280','dots',frog],
    ['#200122','#6f0000','rings',dragon],
    ['#fbc2eb','#a6c1ee','stars',unicorn],
    ['#0f2027','#203a43','moon',owl],
    ['#304352','#9aa6b2','rings',wolf],
    ['#2193b0','#6dd5ed','dots',shark],
    ['#4568dc','#b06ab3','dots',octo],
    ['#7f00ff','#e100ff','stars',fairy],
    ['#141e30','#243b55','stars',king],
    ['#000000','#3a1c71','rings',skull],
    ['#0f2027','#2c5364','stars',alien],
    ['#8e0e00','#1f1c18','stripes',vamp],
    ['#1d2671','#c33764','stars',wizard]
  ];
  const d=D[i]||D[0];
  return bg(d[0],d[1],d[2])+d[3]()+(i>=18?frame:'');
};
const avatarHtml=i=>(Number.isInteger(+i)&&+i>=0&&+i<15)?`<img class="avimg" src="avatars/avatar-${String(+i+1).padStart(2,'0')}.webp" alt="" decoding="async" draggable="false">`:`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">${avatarArt(i)}</svg>`;

window.armnAvatarHtml=avatarHtml;
const norm=r=>{if(!r||typeof r!=='object')return null;const pts=Math.min(1e9,Math.max(0,Math.floor(+r.pts||0)));
 const o={u:typeof r.u==='string'?r.u:'',pts,tot:Math.min(1e9,Math.max(pts,Math.floor(+r.tot||0))),own:{},eq:{},t:+r.t||0,day:typeof r.day==='string'?r.day.slice(0,40):'',prog:typeof r.prog==='string'?r.prog:'',avatar:Number.isInteger(+r.avatar)&&+r.avatar>=0&&+r.avatar<AVATARS.length?+r.avatar:0,at:Math.max(0,Math.floor(+r.at||0))};
 o.own.frames=Array.isArray(r.own&&r.own.frames)?r.own.frames.filter(i=>typeof i==='string'&&FRD[i]):[];o.fr=frOk(r.fr);o.own.covers=(Array.isArray(r.own&&r.own.covers)?r.own.covers:(r.own&&r.own.covers&&typeof r.own.covers==='object'?Object.values(r.own.covers):[])).filter(i=>typeof i==='string'&&CVD[i]);o.cv=cvOk(r.cv);
 o.own.avatars=Array.isArray(r.own&&r.own.avatars)?r.own.avatars.map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<AVATARS.length):[];for(let i=0;i<18;i++)if(!o.own.avatars.includes(i))o.own.avatars.push(i);
 for(const g in G){const src=r.own&&r.own[g];const a=Array.isArray(src)?src:(src&&typeof src==='object'?Object.values(src):[]);
  o.own[g]=a.map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<C[g].length);if(!o.own[g].includes(0))o.own[g].unshift(0);
  const e=r.eq?+r.eq[g]:NaN;if(Number.isInteger(e)&&e>=0&&e<C[g].length)o.eq[g]=e}
 return o};
const wire=u=>({u:u.u,pts:u.pts|0,tot:u.tot|0,own:u.own,eq:u.eq,fr:u.fr||'',cv:u.cv||'',t:u.t||Date.now(),day:u.day||'',prog:u.prog||'',avatar:Number.isInteger(+u.avatar)?+u.avatar:0,at:u.at|0});
/* ---- game progress (bests, options) is kept in localStorage 'armn:*' and mirrored to the account ---- */
function gather(){const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||!k.startsWith(PK))continue;const n=k.slice(PK.length);if(n==='lang'||n==='sound'||!/^[\w-]{1,40}$/.test(n))continue;try{o[n]=JSON.parse(localStorage.getItem(k))}catch(e){}}}catch(e){}return o}
function mix(n,a,b){/* a = this device, b = cloud */
 if(a===undefined||a===null)return b;if(b===undefined||b===null)return a;
 if(typeof a==='number'&&typeof b==='number'){return Math.max(a,b)}
 if(n==='xo-score'&&typeof a==='object'&&typeof b==='object'){const o={};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))o[k]=Math.max(+a[k]||0,+b[k]||0);return o}
 return a;
}
function mergeProg(cp){let ch=false;if(!cp||typeof cp!=='object')return false;const loc=gather();
 for(const n of Object.keys(cp)){if(n==='lang'||n==='sound'||n===SHOPK||!/^[\w-]{1,40}$/.test(n))continue;
  const s=JSON.stringify(mix(n,loc[n],cp[n]));if(s===undefined)continue;
  try{if(localStorage.getItem(PK+n)!==s){localStorage.setItem(PK+n,s);ch=true}}catch(e){}}
 return ch}
function outProg(){const l=gather(),c=cloudProg||{},o={};for(const n of new Set([...Object.keys(l),...Object.keys(c)])){if(n==='lang'||n==='sound'||n===SHOPK)continue;const v=mix(n,l[n],c[n]);if(v!==undefined)o[n]=v}return o}
/* ---- saving ---- */
let syT;
/* PUT that also publishes the player's avatar ("av"); if the database rules reject the extra field we retry without it for a day */
async function putAv(path,body,o){
  let off=0;try{off=+localStorage.getItem('armnhub:noav')||0}catch(e){}
  const u=me(),av=u&&Number.isInteger(+u.avatar)?+u.avatar:0;
  /* a PUT replaces the whole node (it would wipe the avatar): when the avatar is not inside the PUT, re-attach it with its own small PATCH */
  const side=()=>{db('PATCH',path,{av}).then(()=>{try{localStorage.removeItem('armnhub:noav')}catch(_){}}).catch(()=>{})};
  if(Date.now()<off){const r=await db('PUT',path,body,o);side();return r}
  try{return await db('PUT',path,Object.assign({av},body),o)}
  catch(e){if(e&&(e.status===400||e.status===401||e.status===403)){if(e.status!==401){try{localStorage.setItem('armnhub:noav',String(Date.now()+6e5))}catch(_){}}const r=await db('PUT',path,body,o);side();return r}throw e}
}
/* one-time self check: is my avatar really visible to other players? (tells the owner when the Firebase rules block it) */
let avChk=0;
function chkAv(){if(avChk||!sess)return;avChk=1;setTimeout(async()=>{try{const u=me();if(!u||!sess)return;const v=await db('GET','lb/points/'+sess.u,undefined,{auth:false}),mine=Number.isInteger(+u.avatar)?+u.avatar:0;
  if(v&&!(Number.isInteger(+v.av)&&+v.av===mine)){avChk=2;try{console.warn('[GAME ARMN] your avatar is not stored in lb/points/'+sess.u+'/av — add an "av" (number 0-40) rule in Firebase')}catch(_){}if(isOwnerName(sess.u))say(L('⚠️ صورتك لا تظهر للآخرين: أضف قاعدة av في Firebase','⚠️ Others cannot see your avatar: add the av rule in Firebase'))}}catch(e){}},4000)}
function save(meta){const u=me();if(!u)return;if(meta!==false)u.t=Date.now();sv('prof',u);if(!sess)return;clearTimeout(syT);syT=setTimeout(()=>push(),800)}
/* ---- shop data never gets lost: purchases are UNIONED between this device and the cloud, and a second copy rides inside "prog" ---- */
const shopSnap=u=>({own:u.own,eq:u.eq,fr:u.fr||'',cv:u.cv||'',avatar:Number.isInteger(+u.avatar)?+u.avatar:0,at:u.at|0,pts:u.pts|0,t:u.t|0});
function unionShop(u,src){
  if(!u||!src||!src.own)return false;let ch=false;u.own=u.own||{};
  for(const g of Object.keys(src.own)){const a=Array.isArray(src.own[g])?src.own[g]:[];const b=Array.isArray(u.own[g])?u.own[g]:(u.own[g]=[]);
    for(const x of a)if(!b.includes(x)){b.push(x);ch=true}}
  return ch}
/* restore purchases from the backup copy stored inside the cloud "prog" (used when the structured fields were rejected / stripped) */
function applyBackup(c){
  try{const sb=cloudProg&&cloudProg[SHOPK];if(!sb||typeof sb!=='object'||!c)return false;
    const b=norm(Object.assign({},sb,{u:c.u,pts:+sb.pts||0}));if(!b)return false;
    const added=unionShop(c,b);
    c.eq=c.eq||{};for(const g in b.eq)if(c.eq[g]===undefined)c.eq[g]=b.eq[g];
    if(!c.fr&&b.fr)c.fr=b.fr;
    if(!c.cv&&b.cv)c.cv=b.cv;
    if((+b.at||0)>(+c.at||0)&&(c.own.avatars||[]).includes(+b.avatar)){c.avatar=+b.avatar;if(b.fr)c.fr=b.fr;c.at=+b.at}
    return added}catch(e){return false}}
/* merge the cloud record into the live profile before overwriting it (a stale phone can no longer wipe purchases made elsewhere) */
function mergeCloud(u,cl){
  if(!u||!cl||cl.u!==u.u)return false;let ch=unionShop(u,cl);
  u.tot=Math.max(u.tot||0,cl.tot||0);
  const avNew=(cl.at||0)>(u.at||0)||(!(cl.at||0)&&!(u.at||0)&&(cl.t||0)>(u.t||0));
  if(avNew){if(Number.isInteger(+cl.avatar)&&(u.own.avatars||[]).includes(+cl.avatar)&&+cl.avatar!==+u.avatar){u.avatar=+cl.avatar;ch=true}if(cl.fr&&cl.fr!==u.fr){u.fr=cl.fr;ch=true}if(cl.cv&&cl.cv!==u.cv&&(cl.cv==='none'||(u.own.covers||[]).includes(cl.cv))){u.cv=cl.cv;ch=true}if((cl.at||0)>(u.at||0))u.at=cl.at}
  if((cl.t||0)>(u.t||0)){u.pts=cl.pts;u.eq=Object.assign({},u.eq,cl.eq);u.t=cl.t;ch=true}
  return ch}
let lastCvPub='',pushFails=0,pushRetryT=0,lastWarn=0,lastPushT=0,lastPushAt=0;
/* a look change (avatar/frame) gets its own timestamp "at" so stale devices/coin saves can never revert it */
function touchLook(u){u.at=Date.now();publishLook()}
let plT;
function publishLook(){clearTimeout(plT);plT=setTimeout(async()=>{
  const u=me();if(!u||!sess)return;const n=sess.u,av=Number.isInteger(+u.avatar)?+u.avatar:0,fr=frOk(u.fr);
  const ex=async(path,body)=>{try{const c=await db('GET',path);if(c)await db('PATCH',path,body)}catch(e){}};
  try{await ex('lb/points/'+n,{av,fr});if(cvOk(u.cv))await ex('lb/points/'+n,{cv:cvOk(u.cv)});await ex('lb/online_xo/'+n,{av})}catch(e){}
  try{const st=window.armnXoState;if(st&&st.room&&st.side){const k=st.side==='X'?'X':'O';await db('PATCH','rooms/'+st.room,{['player'+k+'Avatar']:av,['player'+k+'Frame']:fr})}}catch(e){}
  try{window.armnRankBust&&window.armnRankBust()}catch(e){}
},900)}
function pushRetry(){if(pushRetryT||!sess)return;const d=Math.min(60000,3000*Math.pow(2,Math.min(pushFails,5)));pushRetryT=setTimeout(()=>{pushRetryT=0;if(!synced){bootRetry(0)}push()},d)}
async function push(ka){
  const u=me();if(!u||!sess)return false;
  if(ka&&u.t===lastPushT&&u.at===lastPushAt)return true;
  if(!synced){pushRetry();bootRetry(0);return false}
  try{
    if(!ka){try{const cl=norm(await db('GET','users/'+sess.uid));if(cl){applyBackupFrom(cl);if(mergeCloud(u,cl)){sv('prof',u);try{paint();applyThemes()}catch(e){}}}}catch(e){}}
    const p=outProg();p[SHOPK]=shopSnap(u);let s=JSON.stringify(p);if(s.length<=39000){u.prog=s;cloudProg=p}
    try{await db('PUT','users/'+sess.uid,wire(u),{ka})}
    catch(e){
      /* the database rules may reject the newer shop fields: save the core record (purchases still ride inside "prog") */
      if(e&&(e.status===400||e.status===401||e.status===403)){const w=wire(u);delete w.at;
        try{await db('PUT','users/'+sess.uid,w,{ka})}catch(e2){if(e2&&(e2.status===400||e2.status===401||e2.status===403)){delete w.cv;delete w.own;delete w.eq;delete w.fr;await db('PUT','users/'+sess.uid,w,{ka})}else throw e2}}
      else throw e}
    await putAv('lb/points/'+sess.u,{n:sess.u,pts:u.tot|0,fr:frOk(u.fr)},{ka}).catch(()=>{});
    if(cvOk(u.cv)){try{await db('PATCH','lb/points/'+sess.u,{cv:cvOk(u.cv)});lastCvPub=u.cv}catch(e){}}
    chkAv();
    sv('prof',u);pushFails=0;lastPushT=u.t;lastPushAt=u.at;return true;
  }catch(e){
    pushFails++;if(!ka)pushRetry();
    if(pushFails>=2&&Date.now()-lastWarn>45000){lastWarn=Date.now();say(L('⚠️ تعذّر الحفظ في حسابك ('+((e&&e.status)||'شبكة')+') — سنعيد المحاولة','⚠️ Could not save to your account ('+((e&&e.status)||'network')+') — retrying'))}
    return false}
}
function applyBackupFrom(cl){try{const old=cloudProg;const pr=JSON.parse(cl.prog||'{}');if(pr&&typeof pr==='object'){cloudProg=pr;applyBackup(cl);cloudProg=old}}catch(e){}}
/* purchases are written to the account immediately and confirmed to the player */
async function saveNow(){
  const u=me();if(!u)return;u.t=Date.now();sv('prof',u);if(!sess)return;clearTimeout(syT);
  const ok=await push();
  say(ok?L('☁️ تم حفظ مشترياتك في حسابك','☁️ Purchase saved to your account'):L('⚠️ لم يُحفظ في الحساب بعد — سنعيد المحاولة تلقائياً','⚠️ Not saved to your account yet — retrying automatically'))}
let bootBusy=false;
function bootRetry(n){
  if(bootBusy||synced||!sess)return;bootBusy=true;
  bootPull().catch(()=>{}).finally(()=>{bootBusy=false;if(sess&&!synced&&n<40)setTimeout(()=>bootRetry(n+1),Math.min(30000,2000*(n+1)))})}
addEventListener('online',()=>{if(sess&&!synced)bootRetry(0);else if(sess)push()});
addEventListener('pagehide',()=>{if(me()&&sess)push(true)});
addEventListener('storage',e=>{if(e.key!==K+'prof'||!e.newValue||!cur)return;
  try{const n=norm(JSON.parse(e.newValue)),u=users[cur];if(!n||!u||n.u!==u.u)return;let ch=false;
  if((n.at||0)>(u.at||0)){u.avatar=n.avatar;u.fr=n.fr;if(n.cv)u.cv=n.cv;u.at=n.at;ch=true}
  if((n.t||0)>(u.t||0)){u.pts=n.pts;u.tot=Math.max(u.tot,n.tot);u.eq=n.eq;u.t=n.t;ch=true}
  unionShop(u,n);if(ch){paint();applyThemes();try{window.armnRenderProfile&&window.armnRenderProfile()}catch(x){}}}catch(x){}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&me()&&sess)push(true);else if(!document.hidden&&sess&&!synced)bootRetry(0)});
setInterval(()=>{const u=me();if(!u||!sess)return;let s;try{s=JSON.stringify(outProg())}catch(e){return}if(s!==u.prog)save(false)},15000);
const G={xo:['إكس-أو','X-O','❌']};
/* per-game catalogs: [ar,en,hue,saturation,glow,corner%] — index 0 is the free default; each game has its own names, colours and frame shapes */
const P=[0,180,360,600,1050,1500];
const C={
xo:[['الأصلي','Classic',0,1,'#dba376',20],['ليل','Night',200,1.1,'#dba376',30],['وردة','Blossom',300,1.4,'#dba376',50],['ذهب','Gold',40,2,'#f0cb7a',6],['زمرد','Emerald',120,1.7,'#7fd6a8',24],['جمر','Ember',-35,2.3,'#f09a8a',2]]};
const EM={xo:['❌','🌙','🌸','👑','💎','🔥']};
if(sess&&goodName(sess.u)&&sess.rt){cur=sess.u;const p=norm(ld('prof',null));users[cur]=(p&&p.u===cur)?p:norm({u:cur,pts:0,t:0})}else{sess=null;cur=null}
const css=document.createElement('style');css.textContent=`
.hero{display:flex;flex-direction:column;align-items:center;text-align:center}.logo{margin-inline:auto;text-align:center}
.gcard{background:linear-gradient(160deg,var(--panel),var(--bg2));border-radius:26px}.gcard:hover{transform:translateY(-7px) scale(1.02);box-shadow:0 24px 55px -22px var(--c,#996ee3)}

.apill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--panel2);color:var(--gold);border-radius:999px;padding:6px 12px;font-weight:700;cursor:pointer;font-size:14px}
#armnHome{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center;margin-top:16px;padding:14px 18px;border:1px solid var(--line);border-radius:22px;background:linear-gradient(135deg,var(--panel),var(--panel2));box-shadow:0 18px 50px -30px #000}
#armnHome .pt{font-size:32px;font-weight:800;color:var(--gold);font-family:var(--display)}
#armnLb{margin:18px auto 22px;max-width:420px;width:100%;border:1px solid var(--line);border-radius:20px;padding:12px 16px;background:var(--panel);text-align:start}
#armnLb h3{margin:0 0 6px;font-size:14px;color:var(--sky)}#armnLb div{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}
.abtn{border:0;border-radius:14px;padding:10px 18px;font-weight:700;background:var(--sky);color:var(--ink);cursor:pointer;font-size:15px}.abtn.g{background:var(--panel2);color:var(--fg);border:1px solid var(--line)}
.amod{position:fixed;inset:0;z-index:300;display:grid;place-items:center;background:rgba(6,5,11,.8);padding:14px;backdrop-filter:blur(6px)}
.amod[hidden]{display:none}.amod .bx{background:var(--panel);border:1px solid var(--line);border-radius:24px;width:min(600px,100%);max-height:90dvh;overflow:auto;padding:22px}
.amod h2{margin:0 0 12px;font-family:var(--display);text-align:center}.amod input{width:100%;margin:6px 0;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--bg2);color:var(--fg);font-size:16px}
.amod .err{color:var(--coral);min-height:20px;font-size:14px;text-align:center}
.tabs{display:flex;gap:8px;margin-bottom:8px}.tabs .abtn{flex:1}
.gch{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px}.gch button{flex:none;border:1px solid var(--line);background:var(--bg2);color:var(--fg);border-radius:14px;padding:8px 12px;cursor:pointer;font-size:14px}.gch button.on{border-color:var(--gold);background:var(--panel2);font-weight:700}
.sgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px}
.sit{border:1px solid var(--line);border-radius:16px;padding:10px;text-align:center;background:var(--bg2)}.sit i{display:block;height:54px;margin:0 auto 8px;width:54px;background:conic-gradient(#ad83f7,#f0cb7a,#7fd6a8,#996ee3,#996ee3,#ad83f7)}
.sit.eq{border-color:var(--mint)}
.menu-btn{align-self:center;margin-top:4px}
#armnToast{position:fixed;top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 26px);white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis;left:50%;transform:translateX(-50%);z-index:400;background:var(--gold);color:var(--ink);padding:8px 16px;border-radius:999px;font-weight:800;opacity:0;transition:opacity .3s;pointer-events:none}

:root{--bg:#100c1b;--bg2:#171128;--panel:#1c1530;--panel2:#231a3e;--line:#342a51;--sky:#996ee3;--mint:#6fe3b0;--coral:#ff9d8a;--gold:#ffd27a;--vio:#cec4df;--rose:#996ee3}
body::before{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(40% 35% at 20% 25%,rgba(153,110,227,.20),transparent 70%),radial-gradient(38% 34% at 80% 20%,rgba(206,196,223,.20),transparent 70%),radial-gradient(45% 40% at 60% 85%,rgba(255,157,138,.14),transparent 70%)}
body::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.55;background-image:radial-gradient(1.2px 1.2px at 12% 18%,#fff,transparent),radial-gradient(1px 1px at 33% 72%,#ece7e2,transparent),radial-gradient(1.4px 1.4px at 58% 30%,#fff,transparent),radial-gradient(1px 1px at 81% 64%,#f4f1ee,transparent),radial-gradient(1.2px 1.2px at 91% 12%,#fff,transparent),radial-gradient(1px 1px at 46% 90%,#ece7e2,transparent);background-size:340px 340px}
@media (prefers-reduced-motion:reduce){body::before,body::after{animation:none}}
@media (pointer:coarse){body::before{animation:none;filter:none;inset:0;will-change:auto}body::after{animation:none}}html.imm body::before,html.imm body::after{animation:none!important}
/* ===== X-O: no draws, compact header, bigger board ===== */
#xo .score{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;gap:8px}
#xo .score .sb.dr{flex-direction:column;justify-content:center;gap:2px;min-width:58px;padding:4px 10px}
#xo .score .sb.dr .top{font-size:11px}
#xo .score .sb{flex-direction:row;align-items:center;justify-content:space-between;gap:8px;padding:5px 12px}
#xo .score .sb .top{min-width:0;gap:6px}
#xo .score .sb .top span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:84px}
#xo .score .sb .num{font-size:22px;line-height:1}
#xo .score .sb .pips{margin:0;gap:4px}
#xo .score .sb .pips i{width:10px;height:10px}
#xo .status{margin:2px 0;min-height:0;font-size:14px}
#xo.online-room .xo-matchbar{padding:6px 8px;margin-bottom:4px;border-radius:16px}
#xo.online-room .xo-players{margin-top:0!important}
#xo.online-room .xo-avatar{width:34px;height:34px;flex-basis:34px}
#xo.online-room .xo-players::after{font-size:15px}
#xo.online-room #xoMatchWait{margin:3px 0 0;font-size:11px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#xo.online-room .xo-react{margin-top:4px;gap:4px}
#xo.online-room .xo-react button{font-size:16px;padding:1px 7px}
#xo.online-room .xo-tools{margin-top:4px}
#xo.online-room .xo-tools .btn{min-height:28px;font-size:12px;padding:0 10px}
#xo.online-room .imm-grid>.row.mid{display:none!important}
#xo .imm-grid{gap:6px}
.xo-res-act{display:flex;justify-content:center}
.xo-res-act .btn{min-width:160px}
/* owner-only hidden hint: 3px dim dot on the corner of the suggested cell, gone in ~0.3s */
.cell>i.pk2{position:absolute;right:5px;bottom:5px;width:3px;height:3px;border-radius:50%;background:#fff;opacity:.6;pointer-events:none;animation:pk2o .34s linear forwards}
@keyframes pk2o{0%{opacity:.6}70%{opacity:.5}100%{opacity:0}}
#xo.online-room .xo-matchbar{position:relative}
/* step1: hide the settings (3-lines) button inside an online X-O room */
body:has(#xo.online-room:not([hidden])) #btnOpts{display:none!important}
#xo .xo-more{display:none}
#xo.online-room .xo-more{display:grid;place-items:center;position:absolute;top:4px;inset-inline-end:6px;width:26px;height:26px;padding:0;border-radius:50%;border:1px solid var(--line);background:rgba(24,18,42,.7);color:var(--sky);font:900 16px/1 var(--display);z-index:3}
#xo.online-room:not(.xo-tools-open) .xo-react,#xo.online-room:not(.xo-tools-open) .xo-tools{display:none!important}
#xo.online-room .imm-grid{gap:4px}
#xo.online-room .arena{margin:0}
#xo.online-room .status{margin:0;font-size:13px;line-height:1.2}
#xo.online-room .score .sb{padding-block:3px}
#xo.online-room .score .sb .num{font-size:20px}
button,a,.cell{touch-action:manipulation}
.logo .g{background:linear-gradient(90deg,#996ee3,#cec4df,#996ee3);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 6px 22px rgba(153,110,227,.35))}
.gcard{border-color:color-mix(in srgb,var(--c,#996ee3) 35%,var(--line));backdrop-filter:blur(6px)}
.gcard .prev{background:radial-gradient(80% 90% at 50% 0,var(--ca,rgba(153,110,227,.18)),transparent 75%)}
.gcard .gname::before{margin-inline-end:8px;font-size:1.1em}
.gcard[href="#xo"] .gname::before{content:"❌⭕"}
.btn:hover{filter:brightness(1.12)}.apill{box-shadow:0 0 18px -6px var(--gold)}
.pvw{position:relative;width:68px;height:68px;margin:0 auto 10px}.pvw i{margin:0}.pvw em{position:absolute;inset:0;display:grid;place-items:center;font-size:32px;font-style:normal;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}
.sit .pvw i{position:absolute;inset:0;width:auto;height:auto;margin:0;border-radius:20px;background:var(--tb);box-shadow:0 0 18px -3px var(--tg),inset 0 0 0 1px rgba(255,255,255,.22),inset 0 -12px 18px rgba(0,0,0,.28)}
.sit .pvw i::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(160deg,rgba(255,255,255,.26),transparent 46%)}
.pvw.pvav em{filter:none}.pvw.pvav em svg,.pvw.pvav em img{border-radius:20px}
.drawer .abtn{width:100%;margin-top:10px}

#armnTop{position:sticky;top:8px;z-index:40;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin:2px 0 6px;padding:10px 14px;border:1px solid var(--line);border-radius:20px;background:color-mix(in srgb,var(--panel) 82%,transparent);backdrop-filter:blur(14px);box-shadow:0 14px 40px -26px #000}
#armnTop .who{display:flex;align-items:center;gap:10px;min-width:0}#armnTop .who b{display:block;font-size:15px}#armnTop small{color:var(--mut);font-size:12px}
#armnTop .av{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#996ee3,#cec4df 60%,#996ee3);color:#100c1b;font-weight:800;font-size:18px;flex:none}
#armnTop .tbr{display:flex;align-items:center;gap:8px;margin-inline-start:auto}
#armnTop .coin{font-weight:800;color:var(--gold);background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:7px 14px}
#armnTop .abtn{padding:8px 14px;font-size:14px}
.hero{padding-block:clamp(10px,3vw,28px) clamp(16px,3vw,30px)}

html.imm .imm-grid>.row,html.imm .imm-grid .dpad[hidden],html.imm .imm-grid .gpad[hidden]{display:none!important}
/* big, translucent, thumb-friendly gamepad (corners, away from the board) */
html.imm .imm-grid>.gpad:not([hidden]){display:flex!important;position:fixed;left:0;right:0;bottom:max(12px,env(safe-area-inset-bottom,0px));width:auto!important;padding:0 12px;justify-content:space-between;align-items:flex-end;gap:8px;z-index:30;pointer-events:none;direction:ltr}
.gpad .gg{display:flex;gap:8px;align-items:flex-end}
.gpad button{--bw:min(var(--pad,76px),calc((100vw - 24px - var(--n,4)*8px)/var(--u,4)));pointer-events:auto;width:var(--bw);height:var(--pad,76px);border-radius:calc(var(--pad,76px)*.3);border:1.5px solid rgba(153,110,227,.42);background:rgba(16,12,27,.55);color:var(--fg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;transition:background .08s,transform .08s}
.gpad button.wide{width:calc(var(--bw)*1.45)}
.gpad button svg{width:calc(var(--pad,76px)*.36);height:calc(var(--pad,76px)*.36);fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.gpad button small{font:700 10px/1 var(--display,system-ui);opacity:.65;letter-spacing:.2px}
.gpad button.on,.gpad button:active{background:rgba(153,110,227,.6);color:#0f0b1a;transform:scale(.95)}
html.imm .imm-grid:has(>.gpad:not([hidden])){padding-bottom:calc(var(--pad,76px) + 26px)}
html.imm .imm-grid:has(>.dpad:not([hidden])){padding-bottom:156px}
@media (orientation:landscape) and (max-height:520px){html.imm .imm-grid:has(>.gpad:not([hidden])),html.imm .imm-grid:has(>.dpad:not([hidden])){padding-bottom:0}.gpad button small{display:none}.gpad button{width:min(var(--pad,76px),58px);height:min(var(--pad,76px),58px)}.gpad button.wide{width:78px}html.imm .imm-grid .dpad:not([hidden]){left:auto!important;right:14px!important;transform:none!important;grid-template-columns:repeat(3,52px)!important;grid-template-rows:repeat(2,52px)!important}}
/* on-screen buttons (Control method = On-screen): float over the bottom of the screen so the board stays full-size */
html.imm .imm-grid .dpad:not([hidden]){display:grid!important;position:fixed;z-index:30;bottom:max(14px,env(safe-area-inset-bottom,0px));left:50%;transform:translateX(-50%);margin:0;opacity:.92;touch-action:none;-webkit-user-select:none;user-select:none}
html.imm .imm-grid .dpad:not([hidden]){grid-template-columns:repeat(3,68px);grid-template-rows:repeat(2,68px);gap:8px}
html.imm .imm-grid .dpad:not([hidden]) button{background:rgba(16,12,29,.62);border-color:rgba(153,110,227,.45);-webkit-tap-highlight-color:transparent;touch-action:none}
html.imm .bar-actions{display:none!important}
html:not(.imm) #armnMenuBtn{display:none}
#armnMenuBtn{font-size:22px;margin-inline-start:auto}
html.imm .drawer:not(.open){position:fixed!important;transform:translateX(105%)!important;visibility:hidden!important}
html[dir=rtl].imm .drawer:not(.open){transform:translateX(-105%)!important}
html.imm .drawer.open{position:fixed!important;transform:none!important;visibility:visible!important;z-index:260;width:min(360px,92vw);top:0;bottom:0;inset-inline-end:0;border-radius:0;max-height:none}
html.imm .scrim{display:block!important;z-index:255}html.imm .drawer [data-close]{display:inline-flex!important}
html.imm .arena{background:radial-gradient(60% 60% at 50% 50%,rgba(153,110,227,.08),transparent 78%);border-radius:24px}
html.imm body{padding-inline:6px}
html.imm .imm-grid>.hud{max-width:640px;width:100%;margin-inline:auto}
#armnMenu{position:fixed;inset:0;z-index:250;background:rgba(12,10,10,.55);backdrop-filter:blur(4px);display:flex;justify-content:center;align-items:flex-start;padding:calc(env(safe-area-inset-top,0px) + 54px) 10px 10px}
#armnMenu[hidden]{display:none}
#armnMenu .mp{width:min(560px,100%);max-height:calc(100dvh - 76px);overflow:auto;background:color-mix(in srgb,var(--panel) 94%,transparent);border:1px solid var(--line);border-radius:22px;padding:14px;box-shadow:0 30px 80px -30px #000;animation:mDrop .18s ease-out}
@keyframes mDrop{from{opacity:0;transform:translateY(-10px)}}
#armnMenu h4{margin:12px 4px 6px;font-size:12px;letter-spacing:.06em;color:var(--mut)}
.mg{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
.mt{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 6px;border:1px solid var(--line);border-radius:16px;background:var(--bg2);color:var(--fg);font-size:12.5px;cursor:pointer;text-align:center;font-family:inherit}
.mt b{font-size:22px;font-weight:400}.mt:hover,.mt:focus-visible{border-color:var(--sky);background:var(--panel2)}
.mmoreb{display:block;width:100%;margin:10px 0 0;padding:9px;border:1px dashed var(--line);border-radius:14px;background:transparent;color:var(--mut);font:inherit;font-size:13px;cursor:pointer}
.mmoreb:hover{color:var(--fg);border-color:var(--sky)}
.adv-b{display:block;width:100%;margin:12px 0 4px;padding:9px;border:1px dashed var(--line);border-radius:14px;background:transparent;color:var(--mut);font:inherit;font-size:13px;cursor:pointer}
.adv-b:hover{color:var(--fg);border-color:var(--sky)}
.adv[hidden]{display:none}
.macc{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:6px 4px 4px}
`;document.head.appendChild(css);
const thS=document.createElement('style');document.head.appendChild(thS);
/* online X-O: the whole room uses the room creator's equipped X-O skin (null = use my own) */
let roomTheme=null;
window.armnRoomTheme=i=>{i=(i===null||i===undefined||i==='')?null:+i;roomTheme=(Number.isInteger(i)&&i>=0&&i<C.xo.length)?i:null;try{applyThemes()}catch(e){}};
function applyThemes(){const u=me();thS.textContent=u&&0?Object.keys(G).map(g=>{let i=(u.eq||{})[g]||0;if(g==='xo'&&roomTheme!==null)i=roomTheme;const t=C[g][i];if(!i)return'';return`#${g} .arena{filter:hue-rotate(${t[2]}deg) saturate(${t[3]});}#${g} .cv-wrap{box-shadow:0 0 44px -8px ${t[4]};border-radius:${t[5]}%/${Math.min(t[5],26)}%;border-color:${t[4]}}`}).join(''):'';
}
const toast=document.body.appendChild(Object.assign(document.createElement('div'),{id:'armnToast',role:'status'}));let tt;
function say(m){try{window.armnOnSay&&window.armnOnSay(m)}catch(e){}toast.textContent=m;toast.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>toast.style.opacity=0,1600)}
let pend=0,win=[];
function add(n){if(n<=0)return;const now=Date.now();win=win.filter(x=>now-x[0]<60000);const used=win.reduce((a,x)=>a+x[1],0);n=Math.min(n,Math.max(0,60-used));if(n<=0)return;win.push([now,n]);const u=me();if(!u){pend+=n;say('+'+n+' 🪙 — '+L('سجّل دخولك لحفظها','log in to keep them'));paint();return}u.pts=(u.pts||0)+n;u.tot=(u.tot||0)+n;save();say('+'+n+' 🪙');paint()}
/* coin rates: [counter, score needed per 1 coin] — lowered so coins stay precious */
const W=[['#scX',1]];
W.forEach(([sel,r])=>{const el=$(sel);if(!el)return;let prev=parseInt(el.textContent)||0,acc=0;new MutationObserver(()=>{const v=parseInt(el.textContent)||0;if(v>prev){acc+=(v-prev)/r;const p=Math.floor(acc);if(p>=1){acc-=p;add(p)}}prev=v}).observe(el,{childList:true,characterData:true,subtree:true})});
const TB=document.createElement('div');TB.id='armnTop';$('#home').prepend(TB);
const RK=[[3000,'👑','أسطورة','Legend'],[1000,'🥇','محترف','Pro'],[200,'🥈','لاعب','Player'],[0,'🥉','مبتدئ','Rookie']];
function paint(){const u=me();
if(!u){TB.innerHTML=`<div class="who"><span class="av">👤</span><div><b>${L('زائر','Guest')}</b><small>${pend?'+'+pend+' 🪙 '+L('بانتظار الحفظ','waiting to be saved'):L('سجّل دخولك لحفظ تقدمك ونقاطك','Log in to save your progress and points')}</small></div></div><div class="tbr"><button class="abtn g" id="aRk" aria-label="${L('الترتيب العالمي','Global ranking')}"><i class="em spin">🌍</i></button><button class="abtn" id="aIn"><i class="em wig">🔑</i> ${L('دخول / حساب جديد','Log in / Sign up')}</button></div>`;$('#aIn').onclick=()=>auth('in');$('#aRk').onclick=()=>board('points')}
else{const pt=u.pts||0,r=RK.find(x=>(u.tot||0)>=x[0]);
TB.innerHTML=`<div class="who"><span class="av">${avatarHtml(+u.avatar||0)}</span><div><b>${esc(cur)}</b><small>${r[1]} ${L(r[2],r[3])}</small></div></div><div class="tbr"><span class="coin"><i class="em flip">🪙</i> ${pt}</span><button class="abtn" id="aShop"><i class="em wig">🛍️</i> ${L('المتجر','Shop')}</button><button class="abtn g" id="aRk" aria-label="${L('الترتيب العالمي','Global ranking')}"><i class="em spin">🌍</i></button><button class="abtn g" id="aAcc" aria-label="${L('حسابي','Account')}"><i class="em cog">⚙️</i></button><button class="abtn g" id="aOut">${L('تسجيل الخروج','Log out')}</button></div>`;
$('#aShop').onclick=()=>shop();$('#aRk').onclick=()=>board();$('#aAcc').onclick=()=>acct();$('#aOut').onclick=()=>logout()}
try{window.armnOnPaint&&window.armnOnPaint()}catch(e){}}
function daily(){/* the daily reward is now claimed manually from the bottom bar */}
function claimDaily(){const u=me();if(!u)return{ok:false,why:'login'};const d=new Date().toDateString();if(u.day===d)return{ok:false,why:'done'};u.day=d;u.pts=(u.pts||0)+20;u.tot=(u.tot||0)+20;save();paint();say(L('مكافأة يومية +20 🪙','Daily reward +20 🪙'));return{ok:true}}
function dailyReady(){const u=me();return !!u&&u.day!==new Date().toDateString()}
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:'.lnk{background:none;border:0;color:var(--sky);text-decoration:underline;cursor:pointer;font-size:14px;padding:6px 0;display:block;margin:2px auto}.abtn:disabled{opacity:.5;cursor:default}.amod .ok{color:var(--mint);min-height:20px;font-size:14px;text-align:center}.amod .hint{color:var(--mut);font-size:13px;text-align:center;line-height:1.6;margin:4px 0}.amod .row2{display:flex;gap:8px;margin-top:10px}.amod .row2 .abtn{flex:1}.armn-avatars{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:10px 0}.armn-avatar{aspect-ratio:1;border:1px solid var(--line);border-radius:14px;background:linear-gradient(145deg,#22193b,#130e21);font-size:27px;cursor:pointer}.armn-avatar.selected{border:2px solid var(--mint);box-shadow:0 0 0 2px #39e7a455,0 0 16px #39e7a477}.armn-avatar:disabled{opacity:.55;filter:grayscale(1)}.xo-avatar{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#231a3e;border:1px solid var(--sky);font-size:19px;flex:0 0 28px}'}));
const A=document.createElement('div');A.className='amod';A.hidden=true;document.body.appendChild(A);let mode='in';
const AC=document.createElement('div');AC.className='amod';AC.hidden=true;document.body.appendChild(AC);
const inp0=(id,type,ph,ac)=>`<input id="${id}" type="${type}" autocomplete="${ac}" placeholder="${esc(ph)}" autocapitalize="off" spellcheck="false"${type==='email'?' inputmode="email"':''}>`;
const inp=(id,type,ph,ac)=>type==='password'?`<span class="pw">${inp0(id,type,ph,ac)}<button type="button" class="eye" aria-label="${L('إظهار كلمة المرور','Show password')}">👁</button></span>`:inp0(id,type,ph,ac);
const val=id=>{const e=document.getElementById(id);return e?e.value:''};
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:'.amod .pw{position:relative;display:block}.amod .pw input{padding-inline-end:48px}.amod .eye{position:absolute;inset-inline-end:6px;top:50%;transform:translateY(-50%);background:none;border:0;font-size:20px;line-height:1;padding:8px 10px;cursor:pointer;color:var(--mut);opacity:.85}.amod .eye:hover{opacity:1}'}));
AC.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.eye');if(!b)return;const i=b.parentNode.querySelector('input');if(!i)return;const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'🙈':'👁';b.setAttribute('aria-label',show?L('إخفاء كلمة المرور','Hide password'):L('إظهار كلمة المرور','Show password'));i.focus()});
/* ---- actions ---- */
async function resolveEmail(idn){
  idn=String(idn||'').trim().toLowerCase();if(!idn)throw{code:'EMPTY'};
  if(idn.includes('@')){if(!EMAILOK.test(idn))throw{code:'INVALID_EMAIL'};return idn}
  if(!goodName(idn))throw{code:'INVALID_LOGIN_CREDENTIALS'};
  let rec;try{rec=await db('GET','usernames/'+idn,undefined,{auth:false})}catch(e){throw dbErr(e)}
  if(!rec||!rec.email)throw{code:'INVALID_LOGIN_CREDENTIALS'};
  return rec.email;
}
async function ensureClaim(){
  if(!sess||!goodName(sess.u))return;
  try{const rec=await db('GET','usernames/'+sess.u,undefined,{auth:false});
   if(!rec){try{await db('PUT','claims/'+sess.uid,sess.u)}catch(e){}await db('PUT','usernames/'+sess.u,{uid:sess.uid,email:sess.email})}}catch(e){}
}
async function finishLogin(c){
  sess.u=c.u;sv('sess',sess);cur=c.u;users={};users[cur]=c;
  cloudProg=(()=>{try{const p=JSON.parse(c.prog||'{}');return p&&typeof p==='object'?p:{}}catch(e){return{}}})();
  const ch=mergeProg(cloudProg);applyBackup(c);
  if(pend){c.pts+=pend;c.tot+=pend;say('+'+pend+' 🪙');pend=0}
  synced=true;await ensureClaim();c.t=Date.now();sv('prof',c);await push();
  paint();applyThemes();daily();
  if(ch)setTimeout(()=>location.reload(),700);
}
async function doLogin(idn,pw){
  if(!pw)throw{code:'MISSING_PASSWORD'};
  const email=await resolveEmail(idn);
  const a=await idt('signInWithPassword',{email,password:pw,returnSecureToken:true});
  sess={uid:a.localId,u:'',email:(a.email||email).toLowerCase(),rt:a.refreshToken,idt:a.idToken,exp:Date.now()+(+a.expiresIn||3600)*1000};
  let c=null;
  try{c=norm(await db('GET','users/'+sess.uid))}catch(e){sess=null;sv('sess',null);throw{code:'NETWORK'}}
  if(!c||!goodName(c.u)){
    let nm=null;try{nm=await db('GET','claims/'+sess.uid)}catch(e){}
    if(!goodName(nm)){sess=null;sv('sess',null);throw{code:'PROFILE_MISSING'}}
    c=norm({u:nm,pts:0,t:0})||c;c.u=nm;
  }
  await finishLogin(c);
}
async function doSignup(u,email,pw,pw2){
  u=String(u||'').trim().toLowerCase();email=String(email||'').trim().toLowerCase();
  if(!goodName(u))throw{code:'BAD_USERNAME'};
  {const ec=emailCheck(email);if(ec)throw ec}
  if(pw.length<6)throw{code:'WEAK_PASSWORD'};
  if(pw!==pw2)throw{code:'PW_MISMATCH'};
  let ex;try{ex=await db('GET','usernames/'+u,undefined,{auth:false})}catch(e){throw dbErr(e)}
  if(ex)throw{code:'USERNAME_TAKEN'};
  const a=await idt('signUp',{email,password:pw,returnSecureToken:true});
  sess={uid:a.localId,u,email,rt:a.refreshToken,idt:a.idToken,exp:Date.now()+(+a.expiresIn||3600)*1000};
  try{
    await db('PUT','claims/'+sess.uid,u);
    await db('PUT','usernames/'+u,{uid:sess.uid,email});
  }catch(e){
    await idt('delete',{idToken:a.idToken}).catch(()=>{});sess=null;sv('sess',null);
    throw (e&&(e.status===401||e.status===403))?{code:'USERNAME_TAKEN'}:dbErr(e);
  }
  await finishLogin(norm({u,pts:0,tot:0,t:Date.now()}));
}
async function doRename(n){
  n=String(n||'').trim().toLowerCase();
  if(!goodName(n)||n===sess.u)throw{code:'BAD_USERNAME'};
  let ex;try{ex=await db('GET','usernames/'+n,undefined,{auth:false})}catch(e){throw dbErr(e)}
  if(ex)throw{code:'USERNAME_TAKEN'};
  try{await db('PUT','usernames/'+n,{uid:sess.uid,email:sess.email})}catch(e){throw (e&&(e.status===401||e.status===403))?{code:'USERNAME_TAKEN'}:dbErr(e)}
  try{await db('PUT','claims/'+sess.uid,n)}catch(e){try{await db('DELETE','usernames/'+n)}catch(_){}throw dbErr(e)}
  const old=sess.u,u=users[cur];sess.u=n;sv('sess',sess);delete users[cur];cur=n;u.u=n;users[n]=u;sv('prof',u);
  try{await db('DELETE','usernames/'+old)}catch(e){}
  try{await db('DELETE','lb/points/'+old)}catch(e){}
  await push();paint();try{window.armnRenderProfile&&window.armnRenderProfile()}catch(e){}
}
async function doForgot(idn){
  let email;try{email=await resolveEmail(idn)}catch(e){if(e.code==='INVALID_LOGIN_CREDENTIALS')return;throw e}
  try{await idt('sendOobCode',{requestType:'PASSWORD_RESET',email})}catch(e){if(e.code==='EMAIL_NOT_FOUND')return;throw e}
}
async function doChangePw(old,n1,n2){
  if(!old)throw{code:'MISSING_PASSWORD'};
  if(n1.length<6)throw{code:'WEAK_PASSWORD'};
  if(n1!==n2)throw{code:'PW_MISMATCH'};
  if(n1===old)throw{code:'PW_SAME'};
  const a=await idt('signInWithPassword',{email:sess.email,password:old,returnSecureToken:true});
  const b=await idt('update',{idToken:a.idToken,password:n1,returnSecureToken:true});
  sess.idt=b.idToken;sess.rt=b.refreshToken||a.refreshToken;sess.exp=Date.now()+(+b.expiresIn||3600)*1000;sv('sess',sess);
}
async function logout(){
  try{await Promise.race([push(),sleep(3500)])}catch(e){}
  sess=null;cur=null;users={};sv('sess',null);sv('prof',null);
  /* progress belongs to the account: clear it from this device so the next player starts clean */
  try{Object.keys(localStorage).forEach(k=>{if(k.startsWith(PK)&&k!==PK+'lang'&&k!==PK+'sound')localStorage.removeItem(k)})}catch(e){}
  try{history.replaceState(null,'',location.pathname+location.search+'#home')}catch(e){try{location.hash='home'}catch(e2){}}
  try{scrollTo(0,0)}catch(e){}
  location.reload();
}
/* ---- login / sign-up / forgot modal ---- */
function auth(m){
  if(m)mode=m;A.hidden=false;
  let body,btn;
  if(mode==='in'){body=inp('aU','text',L('اسم المستخدم أو الإيميل','Username or email'),'username')+inp('aP','password',L('كلمة المرور','Password'),'current-password')+`<button class="lnk" id="aF">${L('نسيت كلمة المرور؟','Forgot password?')}</button>`;btn=L('دخول','Log in')}
  else if(mode==='up'){body=inp('aU','text',L('اسم المستخدم (a-z و 0-9 و _ ، من 3 إلى 16)','Username (a-z, 0-9, _ ; 3–16 chars)'),'username')+inp('aM','email',L('الإيميل (Gmail / Yahoo / iCloud / Outlook)','Email (Gmail / Yahoo / iCloud / Outlook)'),'email')+inp('aP','password',L('كلمة المرور (6 أحرف على الأقل)','Password (at least 6 characters)'),'new-password')+inp('aP2','password',L('تأكيد كلمة المرور','Confirm password'),'new-password');btn=L('إنشاء الحساب','Create account')}
  else{body=`<p class="hint">${L('أدخل إيميلك أو اسم المستخدم وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.','Enter your email or username and we will send you a link to set a new password.')}</p>`+inp('aU','text',L('الإيميل أو اسم المستخدم','Email or username'),'username')+`<button class="lnk" id="aB">${L('← العودة لتسجيل الدخول','← Back to log in')}</button>`;btn=L('إرسال رابط الاستعادة','Send reset link')}
  A.innerHTML=`<div class="bx"><button class="abtn g" id="aX" style="float:inline-end;padding:4px 12px" aria-label="close">✕</button><h2>GAME ARMN</h2>${mode==='forgot'?'':`<div class="tabs"><button class="abtn ${mode==='in'?'':'g'}" data-m="in">${L('دخول','Log in')}</button><button class="abtn ${mode==='up'?'':'g'}" data-m="up">${L('حساب جديد','Sign up')}</button></div>`}${body}<div class="err" id="aE"></div><div class="ok" id="aOk"></div><button class="abtn" style="width:100%" id="aGo">${btn}</button></div>`;
  A.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>auth(b.dataset.m));
  A.onclick=e=>{if(e.target===A)A.hidden=true};$('#aX').onclick=()=>A.hidden=true;
  if($('#aF'))$('#aF').onclick=()=>auth('forgot');if($('#aB'))$('#aB').onclick=()=>auth('in');
  const go=$('#aGo'),er=$('#aE'),ok=$('#aOk');
  go.onclick=async()=>{
    er.textContent='';ok.textContent='';
    const lk=ld('lock',{n:0,until:0});
    if(mode==='in'&&Date.now()<lk.until){er.textContent=L('محاولات كثيرة، انتظر ','Too many attempts, wait ')+Math.ceil((lk.until-Date.now())/1000)+'s';return}
    go.disabled=true;er.textContent='…';
    try{
      if(mode==='up'){await doSignup(val('aU'),val('aM'),val('aP'),val('aP2'))}
      else if(mode==='in'){await doLogin(val('aU'),val('aP'));sv('lock',{n:0,until:0})}
      else{await doForgot(val('aU'));er.textContent='';ok.textContent=L('إذا كان الحساب موجوداً فقد أُرسل رابط استعادة كلمة المرور إلى إيميله. تحقق أيضاً من البريد المزعج.','If the account exists, a reset link was sent to its email. Check your spam folder too.');go.disabled=false;return}
      A.hidden=true;say(L('أهلاً '+cur,'Welcome '+cur)+' 👋');
    }catch(x){
      const c=(x&&x.code)||'ERROR';er.textContent=emsg(c)+((x&&x.hint)?' '+x.hint:'');
      if(mode==='in'&&/CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND/.test(c)){const n=lk.n+1;sv('lock',{n,until:n>=5?Date.now()+30000*(n-4):0})}
    }
    go.disabled=false;
  };
  A.querySelectorAll('input').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')go.click()});
  const f=$('#aU');if(f&&!COARSE_)f.focus();
}
const COARSE_=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
/* ---- account modal: change password, log out ---- */
function acct(){
  const u=me();if(!u||!sess){auth('in');return}
  AC.hidden=false;
  AC.innerHTML=`<div class="bx"><button class="abtn g" id="cX" style="float:inline-end;padding:4px 12px" aria-label="close">✕</button><h2>⚙️ ${L('حسابي','My account')}</h2><p class="hint"><b>${esc(cur)}</b><br>${esc(sess.email||'')}<br>🪙 ${u.pts||0}</p><h3 style="margin:14px 0 8px;font-size:15px;color:var(--sky)">🧑 ${L('صورتك الشخصية','Your avatar')}</h3><div class="armn-avatars">${AVATARS.map((a,i)=>((u.own.avatars||[]).includes(i)?`<button type="button" class="armn-avatar ${(+u.avatar||0)===i?'selected':''}" data-avatar="${i}" aria-label="Avatar ${i+1}">${avatarHtml(i)}</button>`:`<button type="button" class="armn-avatar" disabled title="${AVATAR_PRICES[i]} coins">🔒</button>`)).join('')}</div><p class="hint">${L('اختر شخصية لتظهر بجانب اسمك في اللعب أونلاين.','Choose an avatar to show beside your name online.')}</p><h3 style="margin:14px 0 4px;font-size:15px;color:var(--sky)">${L('تغيير اسم المستخدم','Change username')}</h3>${inp('rN','text',L('اسم المستخدم الجديد','New username'),'off')}<div class="err" id="rE"></div><div class="ok" id="rOk"></div><button class="abtn" style="width:100%" id="rGo">${L('حفظ الاسم الجديد','Save new username')}</button><h3 style="margin:14px 0 4px;font-size:15px;color:var(--sky)">${L('تغيير كلمة المرور','Change password')}</h3>${inp('cO','password',L('كلمة المرور الحالية','Current password'),'current-password')}${inp('cN','password',L('كلمة المرور الجديدة','New password'),'new-password')}${inp('cN2','password',L('تأكيد كلمة المرور الجديدة','Confirm new password'),'new-password')}<div class="err" id="cE"></div><div class="ok" id="cOk"></div><button class="abtn" style="width:100%" id="cGo">${L('حفظ كلمة المرور','Save password')}</button><div class="row2"><button class="abtn g" id="cOut">${L('تسجيل الخروج','Log out')}</button></div></div>`;
  AC.onclick=e=>{if(e.target===AC)AC.hidden=true};$('#cX').onclick=()=>AC.hidden=true;$('#cOut').onclick=()=>logout();
  AC.querySelectorAll('[data-avatar]').forEach(b=>b.onclick=()=>{u.avatar=+b.dataset.avatar;touchLook(u);save();AC.querySelectorAll('[data-avatar]').forEach(x=>x.classList.toggle('selected',x===b));paint();});
  const rg=$('#rGo');
  rg.onclick=async()=>{
    const er=$('#rE'),ok=$('#rOk');er.textContent='…';ok.textContent='';rg.disabled=true;
    try{await doRename(val('rN'));er.textContent='';ok.textContent=L('تم تغيير الاسم ✓','Username changed ✓');setTimeout(acct,900)}
    catch(x){er.textContent=emsg((x&&x.code)||'ERROR')}
    rg.disabled=false;
  };
  const go=$('#cGo');
  go.onclick=async()=>{
    const er=$('#cE'),ok=$('#cOk');er.textContent='…';ok.textContent='';go.disabled=true;
    try{await doChangePw(val('cO'),val('cN'),val('cN2'));er.textContent='';ok.textContent=L('تم تغيير كلمة المرور ✓','Password changed ✓');['cO','cN','cN2'].forEach(i=>$('#'+i).value='')}
    catch(x){er.textContent=emsg((x&&x.code)||'ERROR')}
    go.disabled=false;
  };
  AC.querySelectorAll('input').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')go.click()});
}
const S=document.createElement('div');S.className='amod';S.hidden=true;document.body.appendChild(S);let sg='frames';
const AVN=[['الحصان الساحر','Mystic Unicorn'],['تنين النار','Dragon Lord'],['أمير الضفادع','Frog Prince'],['النمر الناري','Fire Tiger'],['أسد الشمس','Sun Lion'],['جنية الفراشات','Butterfly Fairy'],['قبطان الكراكن','Kraken Captain'],['القرش الأعظم','Great Shark'],['ذئب القمر','Moon Wolf'],['بومة الليل','Night Owl'],['كبير السحرة','Archmage'],['الكونت الأحمر','Count Vampire'],['قائد الفضاء','Alien Commander'],['الحاصد','The Reaper'],['الإمبراطور','The Emperor']];
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:'.sit .pvw.pvav{width:118px;height:118px;margin-bottom:12px}.sit .pvw.pvav i{border-radius:26px;box-shadow:0 0 26px -2px rgba(255,210,100,.55),inset 0 0 0 1px rgba(255,255,255,.2)}.pvw.pvav em svg,.pvw.pvav em img{border-radius:26px}'}));
function frameCards(u){const owned=u.own.frames||[],eq=frNow(u),av=avatarHtml(+u.avatar||0);
 const card=(id,name,price,em)=>{const isEq=eq===id,have=!price||owned.includes(id);
  return `<div class="sit frc ${isEq?'eq':''}"><div class="frp"><span class="ring fr-${id}"><span>${av}</span></span></div><b>${em} ${name}</b><small>${price?'':L('مجاني','Free')}</small><button class="abtn ${have?'g':''}" data-fr="${id}" style="margin-top:6px;width:100%">${isEq?L('مُفعّل ✓','Equipped ✓'):have?L('استخدم','Equip'):'🪙 '+price}</button></div>`};
 return `<div class="frh">${L('أطر مجانية','Free frames')}</div>`+FRFREE.map(f=>card(f[0],L(f[1],f[2]),0,'')).join('')+`<div class="frh">${L('أطر متحركة مميزة','Premium animated frames')} ✨</div>`+FR.slice(0,9).map(f=>card(f[0],L(f[1],f[2]),f[3],f[4])).join('')+`<div class="frh">${L('إطارات ثلاثية الأبعاد متوهجة','3D glowing frames')} ✨ 🪙 1300+</div>`+FR.slice(9).map(f=>card(f[0],L(f[1],f[2]),f[3],f[4])).join('')}
function coverCards(u){const owned=u.own.covers||[],eq=cvOk(u.cv),av=avatarHtml(+u.avatar||0),fr=frNow(u);
 const card=c=>{const id=c[0],price=c[3],have=!price||owned.includes(id),isEq=eq===id;
  return `<div class="sit cvc ${isEq?'eq':''}"><div class="cvp"><span class="cvr cv-${id}"><i></i><i></i><i></i></span><span class="ring fr-${fr}"><span>${av}</span></span></div><b>${c[4]} ${L(c[1],c[2])}</b><small>${price?'':L('مجاني','Free')}</small><button class="abtn ${have?'g':''}" data-cv="${id}" style="margin-top:6px;width:100%">${isEq?L('مُفعّل ✓','Equipped ✓'):have?L('استخدم','Equip'):'🪙 '+price}</button></div>`};
 return `<div class="frh">${L('أغلفة مجانية','Free covers')}</div>`+CV.filter(c=>!c[3]).map(card).join('')+`<div class="frh">${L('أغلفة متحركة مميزة','Premium animated covers')} ✨ 🪙 2000+</div>`+CV.filter(c=>c[3]).map(card).join('')+`<button type="button" class="abtn g" data-cv="none" style="grid-column:1/-1;margin-top:6px">${L('إزالة الغلاف (الافتراضي)','Remove cover (default)')}</button>`}
/* shop tile colours: every theme gets a tile built from its own colour (same radius for all) */
const hex2rgb=c=>{const n=parseInt(String(c).replace('#',''),16)||0;return[n>>16&255,n>>8&255,n&255]};
const mixc=(a,b,t)=>'rgb('+a.map((v,k)=>Math.round(v+(b[k]-v)*t)).join(',')+')';
function themeTile(g,i,t){
 const hx=t[4],c=hex2rgb(hx);
 return['linear-gradient(150deg,'+mixc(c,[255,255,255],.02)+' 0%,'+mixc(c,[11,18,48],.5)+' 100%)',hx+'88'];
}
function shop(g){const u=me();if(!u){say(L('سجّل دخولك لتفتح المتجر','Log in to open the shop'));auth();return}const cs=location.hash.slice(1);sg='frames';S.hidden=false;
const avatarTab=sg==='avatars',frameTab=sg==='frames',coverTab=g==='covers';const own=u.own[sg]||[0],eq=u.eq[sg]||0,list=(avatarTab||frameTab)?[]:C[sg];
S.innerHTML=`<div class="bx"><h2>🛍️ ${L('المتجر','Shop')} — 🪙 ${u.pts||0}</h2>${isOwnerName(u.u)?`<p class="hint" style="margin:-4px 0 10px">👑 ${L('أنت مالك الموقع: كل عناصر المتجر مفتوحة لك مجاناً','You are the site owner: every shop item is unlocked for free')}</p>`:''}<div class="shtabs"><button type="button" data-shoptab="frames" class="${coverTab?'':'on'}">🖼️ ${L('الإطارات','Frames')}</button><button type="button" data-shoptab="covers" class="${coverTab?'on':''}">🌄 ${L('الأغلفة','Covers')}</button></div><div class="sgrid ${coverTab?'frs cvs':frameTab?'frs':''}">${coverTab?coverCards(u):frameTab?frameCards(u):avatarTab?AVATARS.slice(18).map((a,j)=>{const i=j+18,owned=(u.own.avatars||[]).includes(i),selected=(+u.avatar||0)===i;const rt=AVATAR_PRICES[i]>=3000?['leg','أسطوري','Legendary']:AVATAR_PRICES[i]>=1500?['epic','ملحمي','Epic']:['rare','نادر','Rare'];return`<div class="sit sav r-${rt[0]} ${selected?'eq':''}"><span class="rchip">${L(rt[1],rt[2])}</span><div class="pvw pvav"><i style="--tb:radial-gradient(circle,#49366a,#181229);--tg:rgba(153,110,227,.45)"></i><em>${avatarHtml(i)}</em></div><b>${L(AVN[j][0],AVN[j][1])}</b><br><button class="abtn ${owned?'g':''}" data-avatar-buy="${i}" style="margin-top:6px;width:100%">${selected?L('مُفعّل ✓','Equipped ✓'):owned?L('استخدم','Equip'):'🪙 '+AVATAR_PRICES[i]}</button></div>`}).join(''):list.map((t,i)=>{const th=themeTile(sg,i,t);return`<div class="sit ${eq===i?'eq':''}"><div class="pvw"><i style="--tb:${th[0]};--tg:${th[1]}"></i><em>${EM[sg][i]}</em></div><b>${L(t[0],t[1])}</b><br><button class="abtn ${own.includes(i)?'g':''}" data-i="${i}" style="margin-top:6px;width:100%">${eq===i?L('مُفعّل ✓','Equipped ✓'):own.includes(i)?L('استخدم','Equip'):'🪙 '+P[i]}</button></div>`}).join('')}</div><button class="abtn g" id="sX" style="width:100%;margin-top:12px">${L('إغلاق','Close')}</button></div>`;
S.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>shop(b.dataset.g));$('#sX').onclick=()=>S.hidden=true;
S.querySelectorAll('[data-shoptab]').forEach(b=>b.onclick=()=>shop(b.dataset.shoptab));
S.querySelectorAll('[data-cv]').forEach(b=>b.onclick=()=>{const id=b.dataset.cv;u.own.covers=u.own.covers||[];
 if(id!=='none'){const c=CVD[id];if(!c)return;const price=c[3];
  if(price&&!u.own.covers.includes(id)){if((u.pts||0)<price){say(L('نقاطك لا تكفي','Not enough coins'));return}u.pts-=price;u.own.covers.push(id);say(L('تم شراء الغلاف ✨','Cover purchased ✨'))}}
 u.cv=id;touchLook(u);saveNow();paint();shop('covers');try{window.armnRenderProfile&&window.armnRenderProfile()}catch(e){}});
S.querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>{const id=b.dataset.fr,f=FRD[id],price=f?f[3]:0;u.own.frames=u.own.frames||[];
 if(price&&!u.own.frames.includes(id)){if((u.pts||0)<price){say(L('نقاطك لا تكفي','Not enough coins'));return}u.pts-=price;u.own.frames.push(id);say(L('تم شراء الإطار ✨','Frame purchased ✨'))}
 u.fr=id;touchLook(u);try{localStorage.setItem('armnhub:frame',JSON.stringify(id))}catch(e){}saveNow();paint();shop('frames');try{window.armnRenderProfile&&window.armnRenderProfile()}catch(e){}});
S.querySelectorAll('[data-avatar-buy]').forEach(b=>b.onclick=()=>{const i=+b.dataset.avatarBuy;u.own.avatars=u.own.avatars||Array.from({length:18},(_,n)=>n);if(!u.own.avatars.includes(i)){if((u.pts||0)<AVATAR_PRICES[i]){say(L('نقاطك لا تكفي','Not enough coins'));return}u.pts-=AVATAR_PRICES[i];u.own.avatars.push(i)}u.avatar=i;touchLook(u);saveNow();paint();shop('avatars')});
S.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;u.own[sg]=u.own[sg]||[0];
if(!u.own[sg].includes(i)){if((u.pts||0)<P[i]){say(L('نقاطك لا تكفي','Not enough points'));return}u.pts-=P[i];u.own[sg].push(i)}
u.eq[sg]=i;saveNow();applyThemes();paint();shop(sg)})}
/* back / menu buttons inside every game + confirm on exit */
const HELP={xo:['كل لاعب يملك 3 قطع فقط؛ القطعة الرابعة تمحو الأقدم. صُفّ 3 قطع في خط واحد لتفوز.','Each player has 3 pieces; the 4th erases your oldest. Line up 3 to win.']};
const clk=sel=>{const e=document.querySelector(sel);if(e)e.click();return!!e};
const tgl=(g,k,n)=>{const e=document.querySelector('[data-game='+g+'][data-opt='+k+']');if(!e)return;e.click();setTimeout(()=>say(L(n[0],n[1])+': '+(e.classList.contains('on')||e.getAttribute('aria-checked')==='true'?'✓':'✗')),30)};
const cyc=(g,k)=>{const bs=[...document.querySelectorAll('[data-game='+g+'][data-opt='+k+'] button')],i=bs.findIndex(b=>b.classList.contains('on'));if(bs.length){const n=bs[(i+1)%bs.length];n.click();say('⚡ '+n.textContent)}};
const X={xo:[['↩','تراجع','Undo','#xoUndo'],['💡','تلميح','Hint','#xoHint']]};
const mkM=()=>{const m=document.createElement('div');m.className='amod';m.hidden=true;document.body.appendChild(m);return m};
const HM=mkM(),BM=mkM();
function help(g){HM.hidden=false;HM.innerHTML=`<div class="bx"><h2>${G[g][2]} ${esc(L(G[g][0],G[g][1]))}</h2><p style="line-height:1.8;text-align:center">${esc(L(HELP[g][0],HELP[g][1]))}</p><button class="abtn" id="hX" style="width:100%">${L('فهمت','Got it')}</button></div>`;$('#hX').onclick=()=>HM.hidden=true;HM.onclick=e=>{if(e.target===HM)HM.hidden=true}}
/* ===== best score helper ===== */
const lsj=k=>{try{return JSON.parse(localStorage.getItem('armn:'+k))}catch(e){return null}};
function metric(g){let v=0;if(g==='xo')v=(lsj('xo-wins')|0);return Number.isFinite(v)?Math.min(1e7,Math.max(0,v)):0}
/* the only ranking is the global X-O online-wins ranking (hub.js) */
function board(){if(window.armnOpenRanking)window.armnOpenRanking()}
/* ===== top menu: every shortcut + settings in one place ===== */
const MB=document.createElement('button');MB.id='armnMenuBtn';MB.className='icon-btn';MB.textContent='☰';MB.setAttribute('aria-label','Menu');$('.bar').appendChild(MB);
const MN=document.createElement('div');MN.id='armnMenu';MN.hidden=true;document.body.appendChild(MN);
const curG=()=>{const h=location.hash.slice(1);return G[h]?h:null};
const modalOpen=()=>[A,S,HM,BM,AC].some(m=>!m.hidden)||document.querySelector('.drawer.open')||!$('#about').hidden;
const closeMenu=()=>{MN.hidden=true};
function share(){const d={title:'GAME ARMN',text:L('العب ألعاب أحمد أبو مسلم!','Play Ahmed Abu Muslim\'s games!'),url:location.href.split('#')[0]};if(navigator.share)navigator.share(d).catch(()=>{});else if(navigator.clipboard){navigator.clipboard.writeText(d.url).then(()=>say(L('تم نسخ الرابط','Link copied'))).catch(()=>say(d.url))}}
function renderMenu(g){const q=(...a)=>a.find(x=>document.querySelector(x));
const pa=null,rs=q('#xoNew'),act=[],tools=[],set=[];
if(pa)act.push(['⏯','إيقاف / متابعة','Pause / resume',()=>clk(pa)]);if(rs)act.push(['🔄','إعادة الجولة','Restart',()=>clk(rs)]);
(X[g]||[]).forEach(([em,ar,en,fn])=>act.push([em,ar,en,typeof fn==='string'?()=>clk(fn):fn]));
if(g==='xo')tools.push(['🏆','أفضل نتيجة','Best score',()=>{const v=metric(g);say('🏆 '+L('أفضل نتيجة','Best')+': '+(v||'-'))}]);
tools.push(['📖','كيف ألعب','How to play',()=>help(g)],['🌍','الترتيب العالمي','Global ranking',()=>board(g)],['🛍️','المتجر','Shop',()=>shop(g)]);
tools.push(['📤','مشاركة','Share',share]);
if(document.querySelector('.screen:not([hidden]) .drawer')&&!document.querySelector('#xo.online-room:not([hidden])'))act.push(['⚙️','خيارات اللعبة','Game options',()=>clk('#btnOpts')]);
{const so=!document.querySelector('#btnSound').classList.contains('off');act.push([so?'🔊':'🔇',so?'الصوت: يعمل':'الصوت: صامت',so?'Sound: On':'Sound: Muted',()=>clk('#btnSound')])}
set.push(['⛶','ملء الشاشة','Fullscreen',()=>clk('#btnFull')],['🌐','English / عربي','Language',()=>clk('#btnLang')],['🏠','الرئيسية','Home',()=>clk('#btnBack')]);
const onl=g==='xo'&&!!document.querySelector('#xo.online-room:not([hidden])');if(onl){act.length=0;tools.length=0;set.length=0;act.push(['🔊','الصوت','Sound',()=>clk('#btnSound')])}
const fns=[];const grid=(arr)=>`<div class="mg">${arr.map(x=>{fns.push(x[3]);return`<button class="mt" data-k="${fns.length-1}"><b>${x[0]}</b>${esc(L(x[1],x[2]))}</button>`}).join('')}</div>`;
const u=me();
MN.innerHTML=`<div class="mp"><div class="macc"><span>${u?`<b>${esc(cur)}</b> · 🪙 ${u.pts||0}`:L('زائر','Guest')}</span>${u?`<button class="abtn g" data-k="acc" style="padding:6px 12px;font-size:13px">${L('حسابي','Account')}</button><button class="abtn g" data-k="out" style="padding:6px 12px;font-size:13px">${L('تسجيل الخروج','Log out')}</button>`:`<button class="abtn" data-k="in" style="padding:6px 12px;font-size:13px">${L('تسجيل الدخول','Log in')}</button>`}</div>${grid(act)}<button class="mmoreb" data-k="more" aria-expanded="false">${L('المزيد','More')} ▾</button><div class="mmore" hidden><h4>${L('أدوات','TOOLS')}</h4>${grid(tools)}<h4>${L('الإعدادات','SETTINGS')}</h4>${grid(set)}</div></div>`;
if(onl)MN.querySelectorAll('.mmoreb,.mmore,[data-k=out]').forEach(e=>e.remove());
MN.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='more'){const m=MN.querySelector('.mmore');m.hidden=!m.hidden;b.setAttribute('aria-expanded',String(!m.hidden));b.innerHTML=L('المزيد','More')+(m.hidden?' ▾':' ▴');return}closeMenu();if(k==='out')logout();else if(k==='acc')acct();else if(k==='in')auth('in');else fns[+k]()})}
function openMenu(){const g=curG();if(!g)return;MN.hidden=false;renderMenu(g)}
MB.onclick=()=>MN.hidden?openMenu():closeMenu();MN.onclick=e=>{if(e.target===MN)closeMenu()};
addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!MN.hidden)closeMenu();else if(curG()&&!modalOpen())openMenu()});
addEventListener('hashchange',()=>{closeMenu();if(!curG()){if(reloadLater)location.reload()}});
function restartRound(h){const s=document.getElementById(h);if(!s)return;if(h==='xo'){const z=s.querySelector('#xoReset');if(z){z.click();return}}const sel='[data-a=restart],#'+h+'Restart';const r=s.querySelector(sel);if(r)r.click()}
/* Back navigation is handled by the primary route listener above. Do not hijack it to restart a round. */
document.addEventListener('langchange',()=>{paint();if(!A.hidden)auth();if(!AC.hidden)acct();const g=curG();if(!MN.hidden&&g)renderMenu(g)});

/* ===== visual pack: animated logo, icon motion, avatar styling (light on GPU) ===== */
(function(){
const ps=document.createElement('style');
ps.textContent=`
@keyframes lgIn{from{opacity:0;transform:translateY(-46px) scale(.35) rotate(-14deg)}to{opacity:1;transform:none}}
@keyframes lgWave{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-7px) rotate(-2deg)}75%{transform:translateY(3px) rotate(2deg)}}
@keyframes lgHue{to{background-position:400% 0}}
@keyframes lgBob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.06)}}
@keyframes lgTw{0%,100%{opacity:0;transform:scale(.3) rotate(0)}50%{opacity:1;transform:scale(1) rotate(90deg)}}
.logo{position:relative}
.logo .g{display:flex;justify-content:center;background:none;filter:none;animation:none;color:inherit;-webkit-text-fill-color:initial}
.logo .g .c{display:inline-block;background:linear-gradient(100deg,#996ee3 0%,#cec4df 20%,#996ee3 40%,#ffd27a 60%,#6fe3b0 80%,#996ee3 100%);background-size:400% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;padding:0 .01em;
 animation:lgIn .9s cubic-bezier(.2,1.5,.4,1) both,lgWave 3.8s ease-in-out infinite,lgHue 9s linear infinite;
 animation-delay:calc(var(--i)*.09s),calc(1s + var(--i)*.2s),calc(var(--i)*-1.1s)}
.logo .l span{display:inline-block;text-shadow:0 0 16px currentColor,0 0 38px color-mix(in srgb,currentColor 55%,transparent);
 animation:lgIn .9s cubic-bezier(.2,1.5,.4,1) both,lgBob 3.4s ease-in-out infinite;animation-delay:calc(.45s + var(--i)*.1s),calc(1.4s + var(--i)*.28s)}
.logo .sp{position:absolute;font-style:normal;color:#fff;opacity:0;pointer-events:none;text-shadow:0 0 10px #fff,0 0 22px #996ee3;animation:lgTw 3.2s ease-in-out infinite}
.logo .s1{top:2%;left:6%;font-size:.16em;animation-delay:.6s}.logo .s2{top:18%;right:4%;font-size:.22em;animation-delay:1.7s}.logo .s3{bottom:6%;left:28%;font-size:.13em;animation-delay:2.5s}
/* icon motion */
@keyframes icoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes icoWig{0%,82%,100%{transform:rotate(0)}86%{transform:rotate(-16deg)}90%{transform:rotate(14deg)}94%{transform:rotate(-8deg)}97%{transform:rotate(4deg)}}
@keyframes icoCog{to{transform:rotate(360deg)}}
@keyframes icoFlip{0%,70%,100%{transform:rotateY(0)}85%{transform:rotateY(180deg)}}
@keyframes icoPop{0%{transform:scale(1)}40%{transform:scale(1.35) rotate(-8deg)}100%{transform:scale(1)}}
.em{display:inline-block;font-style:normal;transform-origin:center}
.em.wig{animation:icoWig 5s ease-in-out infinite}.em.spin{animation:icoCog 14s linear infinite}.em.cog{animation:icoCog 9s linear infinite}.em.flip{animation:icoFlip 4.5s ease-in-out infinite}
.gcard .gname::before{display:inline-block;animation:icoFloat 3.4s ease-in-out infinite}
.gcard:nth-child(2n) .gname::before{animation-delay:-1.1s}.gcard:nth-child(3n) .gname::before{animation-delay:-2.2s}
.gcard:hover .gname::before{animation:icoPop .6s ease both}
.gcard .prev{transition:transform .35s}.gcard:hover .prev{transform:scale(1.03)}
.mt b{display:inline-block;transition:transform .2s}.mt:hover b,.mt:focus-visible b{animation:icoPop .55s ease}
.abtn,.icon-btn,.mt,.apill{transition:transform .15s,filter .15s,background .2s,border-color .2s}
.abtn:active,.icon-btn:active,.mt:active{transform:scale(.94)}
.icon-btn:hover svg{transform:scale(1.12);transition:transform .2s}
#armnMenuBtn{transition:transform .25s}#armnMenuBtn:hover{transform:rotate(90deg)}
@media (prefers-reduced-motion:reduce){.logo .g .c,.logo .l span,.logo .sp,.em,.gcard .gname::before{animation:none!important;opacity:1}.logo .sp{display:none}}
html.imm .logo *,html.imm .em{animation-play-state:paused}
.xo-avatar,.av,.armn-avatar{overflow:hidden}.xo-avatar svg,.av svg,.armn-avatar svg,.pvw em svg{width:100%;height:100%;display:block;border-radius:inherit}.armn-avatar{padding:0}.pvw em svg{border-radius:14px}
.armn-avatar:not(:disabled):hover{transform:scale(1.06);transition:transform .15s}
@property --pa{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes armnSpin{to{--pa:360deg}}
.featured .gcard,#home .cards .gcard.glow,#home .cards.navd .gcard.glow{border:2px solid transparent;background:linear-gradient(160deg,var(--panel),var(--bg2)) padding-box,conic-gradient(from var(--pa),#996ee3,#cec4df,#996ee3,#ffd27a,#6fe3b0,#996ee3) border-box;animation:armnSpin 6s linear infinite}
#home .cards .gcard.glow,#home .cards.navd .gcard.glow{animation:armnSpin 6s linear infinite,armnGlow 2.8s ease-in-out infinite}
#armnTop{box-shadow:0 0 0 1px rgba(153,110,227,.18),0 14px 40px -26px #000}
@media (prefers-reduced-motion:reduce){.featured .gcard,#home .cards .gcard.glow{animation:none!important}}
`;
document.head.appendChild(ps);
/* pause every CSS animation while the tab is hidden */
document.addEventListener('visibilitychange',()=>document.documentElement.style.setProperty('--armn-run',document.hidden?'paused':'running'));
})();

async function bootPull(){
  let c=norm(await db('GET','users/'+sess.uid));
  if(!c||!goodName(c.u)){
    let nm=null;try{nm=await db('GET','claims/'+sess.uid)}catch(e){}
    if(!goodName(nm))return;
    c=norm({u:nm,pts:0,t:0});c.u=nm;
  }
  try{const p=JSON.parse(c.prog||'{}');cloudProg=p&&typeof p==='object'?p:{}}catch(e){cloudProg={}}
  const ch=mergeProg(cloudProg),l=me();applyBackup(c);
  if(!l||l.u!==c.u||(c.t||0)>(l.t||0)){if(l&&l.u===c.u)unionShop(c,l);cur=c.u;users={};users[cur]=c;sv('prof',c);sess.u=c.u;sv('sess',sess)}
  else if(l&&l.u===c.u){unionShop(l,c);sv('prof',l)}
  synced=true;paint();applyThemes();daily();save(false);ensureClaim();
  if(ch){if(curG())reloadLater=true;else setTimeout(()=>location.reload(),500)}
}
/* bridge for hub.js (home dashboard, ranking, chat) */
window.armnApp={
  me:()=>me(),get name(){return cur},get loggedIn(){return !!(sess&&me())},
  games:()=>Object.keys(G).map(k=>({id:k,ar:G[k][0],en:G[k][1]})),
  daily:()=>claimDaily(),dailyReady:()=>dailyReady(),
  shop:g=>shop(g),acct:()=>acct(),auth:m=>auth(m||'in'),logout:()=>logout(),say:m=>say(m),help:g=>help(g),
  setAvatar(i){const u=me();if(!u||!Number.isInteger(i))return false;u.avatar=i;touchLook(u);save();paint();return true},
  setFrame(id){const u=me();if(!u||!frOk(id))return false;if(FRD[id]&&!(u.own.frames||[]).includes(id))return false;u.fr=id;touchLook(u);save();paint();return true},
  owns(i){const u=me();return !!(u&&((u.own&&u.own.avatars)||[]).includes(i))||i<18}
};
paint();applyThemes();
if(location.hash===''||location.hash==='#home')setTimeout(()=>window.armnLoadXoRank&&window.armnLoadXoRank(),0);
if(sess)bootRetry(0);
/* ===== home layout: X-O featured on top, the other games in a swipeable row below ===== */
(function(){
const cards=$('#home .cards'),xo=cards&&cards.querySelector('.gcard.xo');if(!cards||!xo)return;
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:
'.featured{max-width:560px;margin:0 auto 26px}.featured .gcard{border-width:2px;box-shadow:0 26px 60px -30px var(--c)}.featured .prev{height:210px}.featured .gname{font-size:30px}.featured .mini{grid-template-columns:repeat(3,58px);gap:8px}.featured .mini div{height:58px;font-size:28px}'+
'.more{display:flex;align-items:center;justify-content:center;gap:10px;margin:6px 2px 10px}.more h2{margin:0;font-size:18px;font-family:var(--display)}.more .nav{display:flex;gap:8px;direction:ltr}'+
'#home .cards{display:flex;grid-template-columns:none;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:12px 2px 14px;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--line) transparent;overscroll-behavior-x:contain}'+
'#home .cards .gcard{flex:0 0 min(300px,78%);scroll-snap-align:center}'+
'.swipehint{text-align:center;color:var(--mut);font-size:13px;margin:0 0 6px}'}));
const feat=document.createElement('div');feat.className='featured';cards.before(feat);feat.appendChild(xo);
const more=document.createElement('div');more.className='more';
more.innerHTML='<h2></h2><div class="nav"><button class="icon-btn" id="cL" aria-label="left"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><button class="icon-btn" id="cR" aria-label="right"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>';
cards.before(more);
const hint=document.createElement('p');hint.className='swipehint';cards.after(hint);
const txt=()=>{const h=$('h2',more);if(h)h.remove();hint.textContent=L('اسحب يميناً ويساراً لتغيير اللعبة ↔','Swipe left or right to browse games ↔')};
txt();document.addEventListener('langchange',txt);
const step=d=>cards.scrollBy({left:d*Math.max(220,cards.clientWidth*.8),behavior:'smooth'});
$('#cL').onclick=()=>step(-1);$('#cR').onclick=()=>step(1);
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:'#home .cards{padding:28px 18px 32px}@keyframes armnGlow{0%,100%{box-shadow:0 0 14px 0 var(--gl),0 16px 40px -22px var(--c)}50%{box-shadow:0 0 30px 5px var(--gl),0 16px 40px -22px var(--c)}}#home .cards.navd .gcard.glow{--gl:var(--c);--gl:color-mix(in srgb,var(--c) 55%,transparent);border-color:var(--c);transform:translateY(-4px) scale(1.03);animation:armnGlow 2.8s ease-in-out infinite}@media (prefers-reduced-motion:reduce){#home .cards.navd .gcard.glow{animation:none;box-shadow:0 0 24px 3px var(--gl)}}'}));
let raf=0;const mark=()=>{raf=0;const r=cards.getBoundingClientRect(),mid=r.left+r.width/2;let best=null,bd=1e9;const all=[...cards.querySelectorAll('.gcard')];all.forEach(c=>{const b=c.getBoundingClientRect(),d=Math.abs(b.left+b.width/2-mid);if(d<bd){bd=d;best=c}});all.forEach(c=>c.classList.toggle('glow',c===best))};
cards.addEventListener('scroll',()=>{cards.classList.add('navd');if(!raf)raf=requestAnimationFrame(mark)},{passive:true});
addEventListener('resize',mark);mark();
addEventListener('keydown',e=>{if(location.hash.slice(1)&&location.hash!=='#home')return;if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;if(!A.hidden||!S.hidden||!HM.hidden||!BM.hidden||!AC.hidden||!$('#about').hidden)return;if(/INPUT|TEXTAREA/.test((document.activeElement||{}).tagName))return;e.preventDefault();step(e.key==='ArrowRight'?1:-1)});
})();

})();

