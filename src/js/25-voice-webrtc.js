
/* X-O online room: push-to-talk voice (WebRTC, room only). Signalling rides on the room record in Firebase. */
(function(){
  'use strict';
  var bar=document.getElementById('xoMatchBar');
  if(!bar||!window.RTCPeerConnection||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return;
  var en=function(){return (document.documentElement.lang||'ar').slice(0,2)==='en'};
  var T=function(a,e){return en()?e:a};
  var LSK='armn:xovoice:spk',MAXTALK=60000,MAXLATCH=180000,CONNECT_MS=10000,TAP_MS=350;
  var ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}],iceCandidatePoolSize:2,bundlePolicy:'max-bundle',rtcpMuxPolicy:'require'};
  var spk0=false;try{spk0=localStorage.getItem(LSK)==='1'}catch(e){}
  var ST={code:null,side:null,pc:null,dc:null,sender:null,id:null,lastAns:null,ready:false,hasOpp:false,answered:false,
          holding:false,talking:false,tk:0,stream:null,remoteTalk:false,spk:spk0,t0:0,tries:0,starting:false,failed:false,msg:'',msgT:0,capT:0,nonce:'',hiN:0,hiSent:false,peerHi:null};
  function hiVal(){return ST.nonce+':'+ST.hiN}

  /* ---- UI ---- */
  var tools=bar.querySelector('.xo-tools');
  var box=document.createElement('div');box.className='xo-voice';box.hidden=true;
  box.innerHTML='<button type="button" class="xv-mic" disabled aria-label="'+T('اضغط باستمرار للتحدث','Hold to talk')+'">\uD83C\uDF99\uFE0F</button>'+
    '<button type="button" class="xv-spk" aria-label="'+T('تشغيل/كتم صوت الصديق','Friend sound on/off')+'"></button><div class="xv-st" role="status" aria-live="polite"></div>';
  bar.insertBefore(box,tools);
  var mic=box.querySelector('.xv-mic'),spkB=box.querySelector('.xv-spk'),stEl=box.querySelector('.xv-st');
  var au=document.createElement('audio');au.autoplay=true;au.setAttribute('playsinline','');au.muted=!ST.spk;au.style.display='none';document.body.appendChild(au);
  function oppPlayer(){return bar.querySelectorAll('.xo-player')[1]}
  function note(m){ST.msg=m;ST.msgT=Date.now()+4500;paint();setTimeout(paint,4600)}
  function paint(){
    var can=ST.ready&&ST.hasOpp;
    mic.disabled=!can;
    mic.classList.toggle('on',ST.holding&&ST.talking);mic.classList.toggle('lock',!!ST.latched);
    spkB.textContent=ST.spk?'\uD83D\uDD0A':'\uD83D\uDD07';spkB.setAttribute('aria-pressed',String(ST.spk));
    var m;
    if(ST.msg&&Date.now()<ST.msgT)m=ST.msg;
    else if(!window.isSecureContext)m=T('المايك يحتاج اتصال HTTPS آمن','Mic needs a secure HTTPS connection');
    else if(!ST.hasOpp)m=T('الصوت يعمل عند دخول صديقك للغرفة','Voice works once your friend joins the room');
    else if(ST.failed)m=T('تعذّر ربط الصوت على هذه الشبكة — الدردشة تعمل','Voice could not connect on this network — chat still works');
    else if(!ST.ready)m=T('جارٍ ربط الصوت…','Connecting voice…');
    else if(ST.holding&&ST.latched)m=T('🎙️ المايك شغّال — اضغط عليه مرة وحدة للإغلاق','🎙️ Mic is on — tap once to turn it off');
    else if(ST.holding)m=T('🎙️ المايك مفتوح — ارفع إصبعك ليُغلق (أو ضغطة سريعة لتثبيته)','🎙️ Mic is open — release to close (or quick tap to keep it on)');
    else if(ST.remoteTalk)m=ST.spk?T('🔊 صديقك يتحدث…','🔊 Your friend is talking…'):T('🔇 صديقك يتحدث — اضغط 🔇 لسماعه','🔇 Your friend is talking — tap 🔇 to hear');
    else m=T('اضغط باستمرار للتحدث، أو ضغطة سريعة لتثبيت المايك','Hold to talk, or tap once to keep the mic on');
    stEl.textContent=m;
    var op=oppPlayer();if(op)op.classList.toggle('talking',ST.remoteTalk);
  }

  /* ---- signalling (room record; falls back to a plain field like the chat does) ---- */
  function api(){return window.armnOnlineApi}
  async function putSig(p){
    try{await api().db('PUT','rooms/'+ST.code+'/voice/'+ST.side,p)}
    catch(e){await api().db('PATCH','rooms/'+ST.code,{['vo'+ST.side]:p})}
  }
  function delSig(code,side){
    try{api().db('DELETE','rooms/'+code+'/voice/'+side).catch(function(){})}catch(e){}
    try{api().db('PATCH','rooms/'+code,{['vo'+side]:null}).catch(function(){})}catch(e){}
  }
  function getSig(room,s){return (room.voice&&room.voice[s])||room['vo'+s]||null}
  function gathered(pc){return new Promise(function(res){
    if(pc.iceGatheringState==='complete')return res();
    var done=function(){clearTimeout(t);pc.removeEventListener('icegatheringstatechange',ch);res()};
    var ch=function(){if(pc.iceGatheringState==='complete')done()};
    var t=setTimeout(done,1200);pc.addEventListener('icegatheringstatechange',ch);
  })}

  /* ---- peer connection ---- */
  function wireDc(dc){
    ST.dc=dc;
    dc.onmessage=function(e){ST.remoteTalk=e.data==='1';if(ST.remoteTalk&&ST.spk)au.play().catch(function(){});paint()};
    dc.onclose=function(){ST.remoteTalk=false;paint();if(dc===ST.dc&&ST.code&&ST.hasOpp&&ST.pc){ST.ready=false;retry()}};
  }
  function sendDc(v){try{if(ST.dc&&ST.dc.readyState==='open')ST.dc.send(v)}catch(e){}}
  function mkPc(){
    var pc=new RTCPeerConnection(ICE);
    pc.ontrack=function(e){au.srcObject=(e.streams&&e.streams[0])||new MediaStream([e.track]);if(ST.spk)au.play().catch(function(){})};
    pc.onconnectionstatechange=function(){
      if(pc!==ST.pc)return;var s=pc.connectionState;
      if(s==='connected'){ST.ready=true;ST.failed=false;ST.tries=0;if(ST.code&&ST.side)delSig(ST.code,ST.side)}
      else if(s==='failed'||s==='closed'){ST.ready=false;ST.remoteTalk=false;retry()}
      else if(s==='disconnected'){ST.ready=false;setTimeout(function(){if(pc===ST.pc&&pc.connectionState!=='connected')retry()},2500)}
      paint();
    };
    return pc;
  }
  function teardownPc(){
    stopTalk();
    var pc=ST.pc;ST.pc=null;ST.dc=null;ST.sender=null;ST.ready=false;ST.remoteTalk=false;ST.answered=false;ST.t0=0;
    if(pc){try{pc.onconnectionstatechange=null;pc.ontrack=null;pc.close()}catch(e){}}
    try{au.srcObject=null}catch(e){}
  }
  var retryT=0;
  function retry(){
    if(retryT||!ST.code)return;
    retryT=setTimeout(function(){
      retryT=0;if(!ST.code)return;
      teardownPc();
      if(ST.side==='X'){ST.id=null;ST.tries++;if(ST.tries>3){ST.failed=true;paint();return}}
      else{ST.id=null;ST.hiSent=false}
      paint();
    },1000);
  }
  async function startOffer(){
    if(ST.starting)return;ST.starting=true;
    try{
      teardownPc();
      var id=Math.random().toString(36).slice(2,10);ST.id=id;
      var pc=mkPc();ST.pc=pc;
      ST.sender=pc.addTransceiver('audio',{direction:'sendrecv'}).sender;
      wireDc(pc.createDataChannel('ptt',{ordered:true}));
      await pc.setLocalDescription(await pc.createOffer());
      await gathered(pc);
      if(ST.pc!==pc)return;
      await putSig({id:id,o:pc.localDescription.sdp});
      ST.t0=Date.now();
    }catch(e){teardownPc();ST.id=null;ST.tries++;if(ST.tries>3)ST.failed=true;paint()}
    finally{ST.starting=false}
  }
  async function answer(sig){
    if(ST.starting)return;ST.starting=true;ST.lastAns=sig.id;
    try{
      teardownPc();
      var pc=mkPc();ST.pc=pc;ST.id=sig.id;
      pc.ondatachannel=function(e){wireDc(e.channel)};
      await pc.setRemoteDescription({type:'offer',sdp:sig.o});
      var t=pc.getTransceivers().filter(function(x){return x.receiver&&x.receiver.track&&x.receiver.track.kind==='audio'})[0];
      if(t){t.direction='sendrecv';ST.sender=t.sender}
      await pc.setLocalDescription(await pc.createAnswer());
      await gathered(pc);
      if(ST.pc!==pc)return;
      await putSig({id:sig.id,a:pc.localDescription.sdp,hi:hiVal()});
      ST.t0=Date.now();
    }catch(e){teardownPc();ST.id=null}
    finally{ST.starting=false}
  }

  /* ---- push to talk ---- */
  async function startTalk(){
    if(ST.holding||!ST.ready||!ST.hasOpp||!ST.sender)return;
    var my=++ST.tk;ST.holding=true;ST.talking=false;paint();
    var stream;
    try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}
    catch(e){if(my===ST.tk){ST.holding=false;note(T('لم يُسمح باستخدام المايك — فعّل الإذن من المتصفح','Mic permission was not granted — allow it in your browser'))}return}
    if(my!==ST.tk||!ST.holding||!ST.sender){stream.getTracks().forEach(function(t){t.stop()});if(my===ST.tk){ST.holding=false;paint()}return}
    ST.stream=stream;
    var trk=stream.getAudioTracks()[0];try{trk.contentHint='speech'}catch(e){}
    try{await ST.sender.replaceTrack(trk)}catch(e){stopTalk();return}
    try{var pr=ST.sender.getParameters();if(!pr.encodings||!pr.encodings.length)pr.encodings=[{}];pr.encodings[0].maxBitrate=32000;pr.encodings[0].priority='high';pr.encodings[0].networkPriority='high';ST.sender.setParameters(pr).catch(function(){})}catch(e){}
    if(my!==ST.tk||!ST.holding){return}
    ST.talking=true;sendDc('1');paint();
    clearTimeout(ST.capT);ST.capT=setTimeout(stopTalk,ST.latched?MAXLATCH:MAXTALK);
  }
  function stopTalk(){
    var was=ST.holding||!!ST.stream;
    ST.tk++;ST.holding=false;ST.talking=false;ST.latched=false;clearTimeout(ST.capT);
    if(ST.stream){ST.stream.getTracks().forEach(function(t){t.stop()});ST.stream=null}
    try{if(ST.sender)ST.sender.replaceTrack(null).catch(function(){})}catch(e){}
    if(was)sendDc('0');
    paint();
  }
  function onDown(e){
    if(e){e.preventDefault();try{mic.setPointerCapture(e.pointerId)}catch(x){}}
    if(ST.latched){ST.ignoreUp=true;stopTalk();return}
    ST.down=true;ST.downT=Date.now();startTalk();
  }
  function onUp(){
    if(ST.ignoreUp){ST.ignoreUp=false;ST.down=false;return}
    if(!ST.down)return;ST.down=false;
    if(ST.holding&&Date.now()-ST.downT<TAP_MS){ST.latched=true;clearTimeout(ST.capT);ST.capT=setTimeout(stopTalk,MAXLATCH);paint();return}
    stopTalk();
  }
  mic.addEventListener('pointerdown',onDown);
  ['pointerup','pointercancel'].forEach(function(n){mic.addEventListener(n,onUp)});
  mic.addEventListener('lostpointercapture',function(){if(ST.down)onUp()});
  mic.addEventListener('contextmenu',function(e){e.preventDefault()});
  mic.addEventListener('keydown',function(e){if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();onDown()}});
  mic.addEventListener('keyup',function(e){if(e.key===' '||e.key==='Enter')onUp()});
  mic.addEventListener('blur',function(){if(!ST.latched&&ST.down)onUp()});
  spkB.addEventListener('click',function(){
    ST.spk=!ST.spk;au.muted=!ST.spk;try{localStorage.setItem(LSK,ST.spk?'1':'0')}catch(e){}
    if(ST.spk)au.play().catch(function(){});paint();
  });
  document.addEventListener('visibilitychange',function(){if(document.hidden){stopTalk();return}
    var c=ST.pc&&ST.pc.connectionState;if(ST.code&&ST.hasOpp&&ST.pc&&c!=='connected'&&c!=='connecting')retry()});
  addEventListener('pagehide',function(){api&&ST.code&&closeAll()});

  /* ---- hooks called by the X-O online code ---- */
  function closeAll(){
    var c=ST.code,s=ST.side;
    teardownPc();clearTimeout(retryT);retryT=0;
    if(c&&s)delSig(c,s);
    ST.code=null;ST.side=null;ST.id=null;ST.lastAns=null;ST.hasOpp=false;ST.tries=0;ST.failed=false;ST.msg='';ST.hiSent=false;ST.peerHi=null;
    box.hidden=true;paint();
  }
  window.armnXoVoice={
    open:function(code,side,room){
      closeAll();ST.code=code;ST.side=side;box.hidden=false;ST.nonce=Math.random().toString(36).slice(2,8);ST.hiN=0;ST.hiSent=false;ST.peerHi=null;
      if(room)this.sync(room,side,code);paint();
    },
    close:function(){closeAll()},
    sync:function(room,side,code){
      if(!room||!ST.code||code!==ST.code)return;
      var had=ST.hasOpp;ST.hasOpp=!!(room.playerX&&room.playerO);
      if(!ST.hasOpp){if(had||ST.pc){teardownPc();ST.id=null;ST.lastAns=null;ST.tries=0;ST.failed=false}ST.hiSent=false;ST.peerHi=null;paint();return}
      if(side==='X'){
        /* the friend came back in a fresh page while our old link still looks alive: they announce themselves, we re-offer at once */
        var oa=getSig(room,'O');
        if(oa&&oa.hi&&oa.hi!==ST.peerHi&&!oa.a){
          ST.peerHi=oa.hi;
          if((ST.ready||ST.answered||ST.failed)&&!ST.starting){teardownPc();clearTimeout(retryT);retryT=0;ST.id=null;ST.tries=0;ST.failed=false;startOffer();paint();return}
        }
      }
      if(ST.failed){paint();return}
      if(side==='X'){
        if(!ST.pc&&!ST.starting&&!retryT)startOffer();
        else if(ST.pc&&ST.id&&!ST.answered){
          var a=getSig(room,'O');
          if(a&&a.id===ST.id&&a.a){if(a.hi)ST.peerHi=a.hi;ST.answered=true;var pc=ST.pc;pc.setRemoteDescription({type:'answer',sdp:a.a}).catch(function(){if(pc===ST.pc)retry()})}
        }
        if(ST.pc&&!ST.ready&&ST.t0&&Date.now()-ST.t0>CONNECT_MS)retry();
      }else{
        var o=getSig(room,'X');
        if(o&&o.o&&o.id&&o.id!==ST.lastAns&&!ST.starting&&!retryT)answer(o);
        else if(!ST.pc&&!ST.starting&&!retryT&&!ST.hiSent){ST.hiSent=true;ST.hiN++;putSig({hi:hiVal()}).catch(function(){})}
        if(ST.pc&&!ST.ready&&ST.t0&&Date.now()-ST.t0>CONNECT_MS){teardownPc();ST.id=null}
      }
      paint();
    }
  };
  paint();
})();

