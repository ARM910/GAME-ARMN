
(function(){
  var D=document;
  function ar(){return D.documentElement.lang!=='en'}
  function L(a,e){return ar()?a:e}
  var bar=null;
  function paint(){
    if(!bar||!window.ARMN_PERF)return;var P=ARMN_PERF.get();
    bar.querySelectorAll('[data-fps]').forEach(function(b){b.setAttribute('aria-pressed',String(P.mode!=='ultra'&&+b.dataset.fps===P.fps))});
    bar.querySelector('[data-m=lite]').setAttribute('aria-pressed',String(P.mode==='lite'));
    bar.querySelector('[data-m=ultra]').setAttribute('aria-pressed',String(P.mode==='ultra'));
    bar.querySelector('.pfb-lf').textContent=L('الفريمات','FPS');
    bar.querySelector('[data-m=lite]').textContent=L('🪶 تبسيط','🪶 Lite');
    bar.querySelector('[data-m=ultra]').textContent=L('⚡ فائق','⚡ Ultra');
    bar.querySelector('[data-m=lite]').title=L('تبسيط الموقع للهواتف الضعيفة (سلاسة فائقة)','Simplify the site for weak phones (ultra smooth)');
    bar.querySelector('[data-m=ultra]').title=L('كل المؤثرات كما هي بأعلى فريمات','All effects as they are, at the highest frame rate');
  }
  function build(){
    return;var hub=D.getElementById('hub');if(!hub||hub.querySelector('.pfb-bar'))return;
    bar=D.createElement('div');bar.className='pfb-bar';bar.setAttribute('role','group');
    bar.innerHTML='<div class="pfb-g"><span class="pfb-l pfb-lf"></span><div class="pfb-seg"><button type="button" data-fps="30" aria-pressed="false">30</button><button type="button" data-fps="60" aria-pressed="false">60</button><button type="button" data-fps="90" aria-pressed="false">90</button></div></div><div class="pfb-g"><button type="button" class="pfb-m" data-m="lite" aria-pressed="false"></button><button type="button" class="pfb-m u" data-m="ultra" aria-pressed="false"></button></div>';
    hub.insertBefore(bar,hub.firstChild);
    bar.addEventListener('click',function(e){
      var b=e.target.closest('button');if(!b)return;var P=ARMN_PERF.get();
      if(b.dataset.fps){ARMN_PERF.set({fps:+b.dataset.fps,mode:P.mode==='ultra'?'normal':P.mode})}
      else if(b.dataset.m){ARMN_PERF.set({mode:P.mode===b.dataset.m?'normal':b.dataset.m})}
      paint();
    });
    paint();
  }
  D.addEventListener('armnperf',paint);D.addEventListener('langchange',paint);
  var tries=0,iv=setInterval(function(){build();if((bar&&bar.isConnected)||++tries>80)clearInterval(iv)},150);
  var obs=new MutationObserver(function(){var h=D.getElementById('hub');if(h&&!h.__pfo){h.__pfo=1;obs.observe(h,{childList:true})}if(!bar||!bar.isConnected){bar=null;build()}});
  obs.observe(D.body,{childList:true});
  var hm=D.getElementById('home');if(hm)obs.observe(hm,{childList:true});
  D.addEventListener('langchange',function(){setTimeout(function(){if(!bar||!bar.isConnected){bar=null;build()}paint()},60)});
})();
