
(function(){
  /* tap / click the GAME ARMN logo: letters hop in a wave + sparkles burst out */
  var busy=false;
  document.addEventListener('click',function(e){
    var h=e.target&&e.target.closest?e.target.closest('.hl'):null;
    if(!h||busy)return;busy=true;
    try{navigator.vibrate&&navigator.vibrate(18)}catch(_){}
    var sp=h.querySelectorAll('.hl-a span,.hl-g span');
    sp.forEach(function(s,i){try{s.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-20px) scale(1.18) rotate(-4deg)'},{transform:'translateY(0) scale(1)'}],{duration:520,delay:i*65,easing:'cubic-bezier(.3,1.6,.5,1)'})}catch(_){}});
    var g=['✦','✧','★','✺','✦','✧','✺','★'];
    for(var k=0;k<g.length;k++){(function(k){
      var el=document.createElement('i');el.className='lg-spk';el.textContent=g[k];h.appendChild(el);
      var a=(Math.PI*2*k/g.length)+Math.random()*.4,d=70+Math.random()*60;
      try{el.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:1},{transform:'translate(calc(-50% + '+Math.cos(a)*d+'px),calc(-50% + '+Math.sin(a)*d*.7+'px)) scale(1.2) rotate(180deg)',opacity:0}],{duration:850,easing:'ease-out'})}catch(_){}
      setTimeout(function(){el.remove()},880);
    })(k)}
    setTimeout(function(){busy=false},900);
  });
})();

(function(){
  /* keep the daily-reward button in sync (red dot when a reward is waiting) */
  function sync(){try{var a=window.armnApp,r=!!(a&&a.dailyReady&&a.dailyReady());document.querySelectorAll('.bn-daily').forEach(function(b){b.classList.toggle('ready',r)})}catch(_){}}
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('.bn-daily'))setTimeout(sync,200)});
  setInterval(sync,2500);setTimeout(sync,800);
})();
