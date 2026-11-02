
(function(){
  function mk(host,close){
    var b=document.createElement('button');b.type='button';b.className='armn-x';b.setAttribute('aria-label','Close');b.textContent='\u2715';
    b.addEventListener('click',function(e){e.stopPropagation();close()});
    host.insertBefore(b,host.firstChild);
  }
  function scan(){
    document.querySelectorAll('.amod .bx').forEach(function(bx){
      if(bx.querySelector(':scope>.armn-x'))return;
      var m=bx.closest('.amod');mk(bx,function(){m.hidden=true});
    });
    document.querySelectorAll('.about .box').forEach(function(bx){
      if(bx.querySelector(':scope>.armn-x'))return;
      mk(bx,function(){var c=document.getElementById('abClose');if(c)c.click();else bx.closest('.about').hidden=true});
    });
  }
  var q=0;new MutationObserver(function(){if(!q)q=requestAnimationFrame(function(){q=0;scan()})}).observe(document.body,{childList:true,subtree:true});
  addEventListener('keydown',function(e){if(e.key!=='Escape')return;var o=[].filter.call(document.querySelectorAll('.amod'),function(m){return !m.hidden}).pop();if(o)o.hidden=true});
  scan();
})();
