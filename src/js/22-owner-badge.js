
/* ===== OWNER BADGE: a golden crown "المالك / Owner" next to the owner's name everywhere it is shown ===== */
(function(){
'use strict';
var OWNER_RX=/^\s*yakuza(\s*[(\[][^)\]]*[)\]])?\s*$/i;           /* "yakuza" or "yakuza (you)" */
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,TITLE:1,NOSCRIPT:1,SELECT:1};
var FREE='.xc-log,.xc-quick,.xc-in,.js-bio,.ap-bio';       /* user-typed text: never badge it (anyone could type "yakuza") */
var COMPACT='.sb,.xo-player,.xc-bubble,.bb-name,.xo-react,.mini';
var CROWN='<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M2.5 19.5h19l1.2-12.2-5.6 4.4L12 3.6 6.9 11.7 1.3 7.3z" fill="#5b3600" stroke="#fff6c4" stroke-width="1.1" stroke-linejoin="round"/><circle cx="12" cy="3.4" r="1.7" fill="#fff6c4"/><circle cx="1.6" cy="7.2" r="1.4" fill="#fff6c4"/><circle cx="22.4" cy="7.2" r="1.4" fill="#fff6c4"/><rect x="3.4" y="19.6" width="17.2" height="2.4" rx="1" fill="#5b3600"/></svg>';
function lbl(){return document.documentElement.lang==='ar'?'مالك الموقع':'SITE OWNER'}
function mk(compact){
  var b=document.createElement('span');b.className='own-badge'+(compact?' sm':'');b.setAttribute('data-own-badge','1');
  b.setAttribute('title',document.documentElement.lang==='ar'?'لاعب مالك الموقع':'Player & site owner');
  b.innerHTML=CROWN+(compact?'':'<b>'+lbl()+'</b>');return b}
function isBadge(n){return n&&n.nodeType===1&&n.hasAttribute&&n.hasAttribute('data-own-badge')}
function fix(t){
  var par=t.parentNode;if(!par||par.nodeType!==1||SKIP[par.tagName]||isBadge(par))return;
  if(par.closest&&par.closest(FREE)){if(isBadge(t.nextSibling))t.nextSibling.remove();return}
  var has=isBadge(t.nextSibling);
  if(OWNER_RX.test(t.data)){
    if(!has)par.insertBefore(mk(!!(par.closest&&par.closest(COMPACT))),t.nextSibling);
  }else if(has){t.nextSibling.remove()}
}
function scan(root){
  if(!root)return;
  if(root.nodeType===3){fix(root);return}
  if(root.nodeType!==1||SKIP[root.tagName]||isBadge(root))return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode()))if(n.data.length<40&&/yakuza/i.test(n.data))list.push(n);
  list.forEach(fix);
}
var css=document.createElement('style');
css.textContent='.own-badge{display:inline-flex;align-self:flex-start;width:fit-content;align-items:center;gap:3px;margin-inline:6px 0;padding:1px 8px 1px 5px;border-radius:999px;vertical-align:middle;white-space:nowrap;position:relative;overflow:hidden;background:linear-gradient(135deg,#fff6bd 0%,#ffd84a 35%,#f0a81c 70%,#b87400 100%);color:#4a2c00;font:900 10.5px/1.55 system-ui,sans-serif;letter-spacing:.02em;border:1px solid #fff0a0;box-shadow:0 0 12px rgba(255,200,50,.75),0 1px 0 rgba(255,255,255,.6) inset;text-shadow:0 1px 0 rgba(255,255,255,.45);-webkit-text-fill-color:#4a2c00}'+
'.own-badge b{font:inherit;color:inherit;-webkit-text-fill-color:inherit;overflow:visible;text-overflow:clip;display:inline}.own-badge svg{flex:none;filter:drop-shadow(0 0 2px rgba(255,240,160,.9))}'+
'.own-badge::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.75) 50%,transparent 65%);transform:translateX(-120%);animation:ownShine 3.2s ease-in-out infinite}'+
'.own-badge.sm{padding:2px 4px;margin-inline:4px 0}@keyframes ownShine{0%,55%{transform:translateX(-120%)}100%{transform:translateX(120%)}}'+
'.xo-player span:has(>.own-badge),.rk-nm b:has(.own-badge){max-width:none!important;overflow:visible!important;text-overflow:clip!important}'+
'@media (prefers-reduced-motion:reduce){.own-badge::after{animation:none;display:none}}';
document.head.appendChild(css);
var queue=new Set(),raf=0;
function flush(){raf=0;var q=Array.from(queue);queue.clear();q.forEach(scan)}
function later(n){queue.add(n);if(!raf)raf=requestAnimationFrame(flush)}
new MutationObserver(function(ms){
  for(var i=0;i<ms.length;i++){var m=ms[i];
    if(m.type==='characterData'){later(m.target)}
    else for(var j=0;j<m.addedNodes.length;j++){var a=m.addedNodes[j];if(!isBadge(a))later(a)}}
}).observe(document.body,{childList:true,characterData:true,subtree:true});
document.addEventListener('langchange',function(){document.querySelectorAll('[data-own-badge]').forEach(function(b){var x=b.querySelector('b');if(x)x.textContent=lbl();b.title=document.documentElement.lang==='ar'?'لاعب مالك الموقع':'Player & site owner'})});
scan(document.body);
})();

