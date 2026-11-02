
/* GAME ARMN — performance core: frame-rate governor (30/60/90) + modes (lite / normal / ultra).
   Wraps requestAnimationFrame BEFORE any other script runs, so every game loop obeys the chosen cap. */
(function(){
  var KEY='armn:perf', root=document.documentElement, st={fps:60,mode:'normal'};
  try{var j=JSON.parse(localStorage.getItem(KEY)||'null');if(j){if(j.fps===30||j.fps===60||j.fps===90)st.fps=j.fps;if(j.mode==='lite'||j.mode==='ultra'||j.mode==='normal')st.mode=j.mode}
    else{var weak=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=2;if(weak)st.mode='lite'}}catch(e){}
  var nraf=window.requestAnimationFrame.bind(window), q=new Map(), nid=0, pending=0, last=0;
  function ivl(){ if(st.fps>=90) return 0; return (1000/st.fps)*0.7; }
  function tick(ts){
    pending=0; var iv=ivl();
    if(iv && last && ts-last<iv){ if(q.size){pending=1;nraf(tick)} return; }
    last=ts; var list=Array.from(q); q.clear();
    for(var i=0;i<list.length;i++){ try{ list[i][1](ts) }catch(e){ setTimeout(function(er){throw er}.bind(null,e)) } }
    if(q.size&&!pending){pending=1;nraf(tick)}
  }
  window.requestAnimationFrame=function(cb){ var id=++nid; q.set(id,cb); if(!pending){pending=1;nraf(tick)} return id };
  window.cancelAnimationFrame=function(id){ q.delete(id) };
  function apply(){
    root.classList.toggle('perf-lite',st.mode==='lite');
    root.classList.toggle('perf-ultra',st.mode==='ultra');
    root.classList.toggle('d3-off',st.mode==='lite');
    root.setAttribute('data-fps',String(st.fps));
    try{document.dispatchEvent(new CustomEvent('armnperf',{detail:{fps:st.fps,mode:st.mode}}))}catch(e){}
  }
  /* canvas glow (shadowBlur) is the most expensive 2D operation in the games: halve it in normal mode, drop it in lite, keep it full in ultra */
  try{
    var P2=CanvasRenderingContext2D.prototype,d=Object.getOwnPropertyDescriptor(P2,'shadowBlur');
    if(d&&d.set){Object.defineProperty(P2,'shadowBlur',{configurable:true,enumerable:d.enumerable,get:d.get,
      set:function(v){var m=st.mode==='lite'?0:(st.mode==='ultra'?1:0.5);d.set.call(this,(+v||0)*m)}})}
  }catch(e){}
  window.ARMN_PERF={
    get:function(){return {fps:st.fps,mode:st.mode}},
    set:function(o){ if(o.fps===30||o.fps===60||o.fps===90)st.fps=o.fps; if(o.mode==='lite'||o.mode==='ultra'||o.mode==='normal')st.mode=o.mode;
      try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){} apply(); }
  };
  apply();
})();
