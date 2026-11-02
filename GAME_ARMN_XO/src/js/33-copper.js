
(function(){
  'use strict';
  var D=document,ar=function(){return D.documentElement.lang!=='en'};
  function seg(tgl){
    if(tgl.dataset.cs)return;tgl.dataset.cs='1';
    var row=tgl.closest('.trow');if(!row)return;
    var w=D.createElement('div');w.className='trow ctl-seg';
    w.innerHTML='<span>'+(ar()?'طريقة التحكم':'Control method')+'</span><span class="seg" role="group"><button type="button" data-m="touch">'+(ar()?'لمس':'Touch')+'</button><button type="button" data-m="pad">'+(ar()?'أزرار':'On-screen')+'</button></span>';
    row.parentNode.insertBefore(w,row);row.style.display='none';
    var bt=w.querySelectorAll('button');
    function sync(){var on=tgl.getAttribute('aria-checked')==='true';bt[0].setAttribute('aria-pressed',String(!on));bt[1].setAttribute('aria-pressed',String(on))}
    bt.forEach(function(b){b.addEventListener('click',function(){var want=b.dataset.m==='pad';if((tgl.getAttribute('aria-checked')==='true')!==want)tgl.click();sync()})});
    new MutationObserver(sync).observe(tgl,{attributes:true,attributeFilter:['aria-checked']});sync();
  }
  function scan(){D.querySelectorAll('button.tgl[data-opt="dpad"]').forEach(seg)}
  new MutationObserver(function(){scan()}).observe(D.body,{childList:true,subtree:true});
  scan();
})();
