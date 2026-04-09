const FC={apiKey:"AIzaSyCr2dekkLLifIg0_JlLfEleaV32b5XdvIQ",authDomain:"dacewav-store-3b0f5.firebaseapp.com",databaseURL:"https://dacewav-store-3b0f5-default-rtdb.firebaseio.com",projectId:"dacewav-store-3b0f5",storageBucket:"dacewav-store-3b0f5.firebasestorage.app",messagingSenderId:"163354805352",appId:"1:163354805352:web:d8a99d1d71323de1ed27dd"};
const DACE_VER='4.3';
const ANIMS=['none','flotar','pulsar','rotar','deslizar','rebotar','parpadeo','sacudida','cambio-color','brillo','spin-lento'];
let db=null,allBeats=[],siteSettings={},T={},customEmojis=[],floatingEls=[];
let activeGenre='Todos',modalBeatId=null,_inspectorMode=false,activeTags=[];
let _ldTheme=false,_ldSettings=false,_ldBeats=false;
let _isLightMode=false;
let _wishlist=JSON.parse(localStorage.getItem('dace-wishlist')||'[]');
let _waveformCache=JSON.parse(localStorage.getItem('dace-waveforms')||'{}');

// ═══ WISHLIST SYSTEM ═══
function getWishlist(){return _wishlist}
function toggleWish(id,event){
  if(event){event.stopPropagation();event.preventDefault()}
  var idx=_wishlist.indexOf(id);
  var btn=document.querySelector('.wish-btn[data-id="'+id+'"]');
  if(idx>-1){_wishlist.splice(idx,1);if(btn){btn.classList.remove('active');btn.textContent='♡'}}
  else{_wishlist.push(id);if(btn){btn.classList.add('active');btn.textContent='♥';btn.classList.add('pop');setTimeout(function(){btn.classList.remove('pop')},300)}}
  localStorage.setItem('dace-wishlist',JSON.stringify(_wishlist));
  _updateWishBadge();_renderWishList();
}
function _updateWishBadge(){
  var badge=document.getElementById('wish-nav-badge');
  var count=document.getElementById('wl-count');
  if(badge){
    var prev=badge.textContent;
    badge.textContent=_wishlist.length;
    badge.style.display=_wishlist.length?'flex':'none';
    if(prev!==String(_wishlist.length)){badge.classList.remove('pop');void badge.offsetWidth;badge.classList.add('pop')}
  }
  if(count)count.textContent=_wishlist.length;
}
function _renderWishList(){
  var list=document.getElementById('wl-list');if(!list)return;
  if(!_wishlist.length){list.innerHTML='<div class="wl-empty"><div class="wl-empty-icon">❤️</div><div class="wl-empty-text">Aún no tienes favoritos.<br>Haz click en ♡ para guardar beats.</div></div>';return}
  list.innerHTML=_wishlist.map(function(id){
    var b=allBeats.find(function(x){return x.id===id});
    if(!b)return'';
    var lics=b.licenses||[];var minL=lics[0];
    var img=b.imageUrl?'<img src="'+b.imageUrl+'" alt="" loading="lazy">':'<span style="font-size:1.2rem">♦</span>';
    return'<div class="wl-item" onclick="openModal(\''+b.id+'\');toggleWishlist()"><div class="wl-item-img">'+img+'</div><div class="wl-item-info"><div class="wl-item-name">'+b.name+'</div><div class="wl-item-meta">'+b.bpm+' BPM · '+b.key+(minL?' · $'+minL.priceMXN+' MXN':'')+'</div></div><button class="wl-item-remove" onclick="event.stopPropagation();toggleWish(\''+b.id+'\')" title="Quitar">✕</button></div>';
  }).join('');
}
function toggleWishlist(){
  var panel=document.getElementById('wishlist-panel');
  panel.classList.toggle('open');
  if(panel.classList.contains('open')){_renderWishList();_updateWishBadge()}
}
function sendWishlistWhatsApp(){
  if(!_wishlist.length){showToast('No hay favoritos');return}
  var lines=_wishlist.map(function(id,i){
    var b=allBeats.find(function(x){return x.id===id});if(!b)return null;
    var lics=b.licenses||[];var minL=lics[0];
    return(i+1)+'. '+b.name+' ('+b.bpm+' BPM · '+b.key+(minL?' · $'+minL.priceMXN+' MXN':'')+')';
  }).filter(Boolean);
  var msg=encodeURIComponent('Hola DACE, me interesan estos beats:\n\n'+lines.join('\n')+'\n\n¿Podemos hablar de licencias?');
  var wa=siteSettings.whatsapp?'https://wa.me/'+siteSettings.whatsapp+'?text='+msg:'#';
  window.open(wa,'_blank');
}

// ═══ WAVEFORM SYSTEM ═══
function generateWaveform(audioUrl,beatId,callback){
  if(_waveformCache[beatId]){callback(_waveformCache[beatId]);return}
  try{
    var ctx=new (window.AudioContext||window.webkitAudioContext)();
    var xhr=new XMLHttpRequest();xhr.open('GET',audioUrl,true);xhr.responseType='arraybuffer';
    xhr.onload=function(){
      ctx.decodeAudioData(xhr.response,function(buffer){
        var data=buffer.getChannelData(0);var bars=40;var step=Math.floor(data.length/bars);var wave=[];
        for(var i=0;i<bars;i++){var sum=0;for(var j=0;j<step;j++)sum+=Math.abs(data[i*step+j]);wave.push(sum/step)}
        var max=Math.max.apply(null,wave);wave=wave.map(function(v){return v/max});
        _waveformCache[beatId]=wave;
        try{localStorage.setItem('dace-waveforms',JSON.stringify(_waveformCache))}catch(e){}
        callback(wave);ctx.close();
      },function(){callback(null)});
    };xhr.onerror=function(){callback(null)};xhr.send();
  }catch(e){callback(null)}
}
function waveformToSVG(wave,width,height){
  if(!wave||!wave.length)return'';var barW=width/wave.length;var gap=1;var svgW=barW-gap;
  return wave.map(function(v,i){var h=Math.max(2,v*height);var y=height-h;return'<rect x="'+(i*barW)+'" y="'+y+'" width="'+svgW+'" height="'+h+'" rx="1"/>'}).join('');
}
function applyWaveformToCard(beatId){
  var b=allBeats.find(function(x){return x.id===beatId});if(!b||!b.previewUrl)return;
  var card=document.getElementById('card-'+beatId);if(!card)return;
  var waveRow=card.querySelector('.beat-wave-row');if(!waveRow)return;
  generateWaveform(b.previewUrl,beatId,function(wave){
    if(!wave)return;
    var svg='<svg class="waveform-svg" viewBox="0 0 200 52" preserveAspectRatio="none"><defs><clipPath id="wcp-'+beatId+'"><rect class="wf-clip-rect" x="0" y="0" width="0" height="52"/></clipPath></defs><g class="wf-bg">'+waveformToSVG(wave,200,52)+'</g><g class="wf-progress" clip-path="url(#wcp-'+beatId+')">'+waveformToSVG(wave,200,52)+'</g></svg>';
    waveRow.insertAdjacentHTML('afterend',svg);waveRow.style.display='none';
  });
}

// ═══ THEME TOGGLE ═══
function toggleTheme(){
  _isLightMode=!_isLightMode;
  applyLightMode();
  localStorage.setItem('dace-light-mode',_isLightMode?'1':'0');
  if(typeof db!=='undefined'&&db){db.ref('settings/lightMode').set(_isLightMode).catch(function(){})}
  try{localStorage.setItem('dace-theme-broadcast',JSON.stringify({ts:Date.now(),lightMode:_isLightMode}))}catch(e){}
}
function applyLightMode(){
  document.body.classList.toggle('light-mode',_isLightMode);
  var btn=document.getElementById('theme-toggle');
  if(btn)btn.textContent=_isLightMode?'☀️':'🌙';
}
(function initThemeSync(){
  var saved=localStorage.getItem('dace-light-mode');
  if(saved==='1'){_isLightMode=true}
  applyLightMode();
  window.addEventListener('load',function(){
    if(typeof db!=='undefined'&&db){
      db.ref('settings/lightMode').on('value',function(snap){
        var val=snap.val();if(val===null)return;
        var newVal=!!val;
        if(newVal!==_isLightMode){_isLightMode=newVal;applyLightMode();localStorage.setItem('dace-light-mode',_isLightMode?'1':'0')}
      });
    }
  });
  window.addEventListener('storage',function(e){
    if(e.key==='dace-theme-broadcast'&&e.newValue){
      try{var d=JSON.parse(e.newValue);if(typeof d.lightMode==='boolean'&&d.lightMode!==_isLightMode){_isLightMode=d.lightMode;applyLightMode();localStorage.setItem('dace-light-mode',_isLightMode?'1':'0')}}catch(er){}
    }
  });
})();

function hexRgba(h,a){h=(h||'#000').replace('#','');if(h.length<6)return h;return'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')'}
function loadFont(family,id){if(!family)return;var lid=id||'gf-'+family.replace(/\s+/g,'-').toLowerCase();if(document.getElementById(lid))return;var l=document.createElement('link');l.id=lid;l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family)+':wght@400;700;800&display=swap';document.head.appendChild(l)}
function applyAnim(el,cfg){if(!el||!cfg||cfg.type==='none'){if(el)ANIMS.forEach(function(a){if(a!=='none')el.classList.remove('anim-'+a)});return}ANIMS.forEach(function(a){if(a!=='none')el.classList.remove('anim-'+a)});el.classList.add('anim-'+cfg.type);el.style.setProperty('--ad',(cfg.dur||2)+'s');el.style.setProperty('--adl',(cfg.del||0)+'s')}
function _checkReady(){if(!_ldTheme||!_ldSettings||!_ldBeats)return;var l=document.getElementById('loader');l.style.opacity='0';setTimeout(function(){l.style.display='none'},500)}

// ═══ CURSOR GLOW ═══
var _cgX=0,_cgY=0,_cgTX=0,_cgTY=0;
document.addEventListener('mousemove',function(e){_cgTX=e.clientX;_cgTY=e.clientY});
(function lerpCursor(){_cgX+=(_cgTX-_cgX)*0.08;_cgY+=(_cgTY-_cgY)*0.08;var g=document.getElementById('cursor-glow');if(g)g.style.transform='translate('+(_cgX-200)+'px,'+(_cgY-200)+'px)';requestAnimationFrame(lerpCursor)})();

// ═══ SCROLL PROGRESS ═══
window.addEventListener('scroll',function(){var sp=document.getElementById('scroll-progress');var h=document.documentElement.scrollHeight-window.innerHeight;sp.style.width=(h>0?(window.scrollY/h)*100:0)+'%'},{passive:true});

// ═══ HERO PARALLAX ═══
window.addEventListener('scroll',function(){
  var hero=document.getElementById('hero-section');if(!hero)return;
  var st=window.scrollY;var heroH=hero.offsetHeight;
  if(st<heroH*1.5){hero.style.transform='translateY('+st*0.15+'px)';hero.querySelector('.hero-title').style.transform='translateY('+st*0.08+'px)';var op=1-st/(heroH*1.2);hero.style.opacity=Math.max(0.3,op)}
},{passive:true});

// ═══ SCROLL-AWARE NAV ═══
var _lastScrollY=0;
window.addEventListener('scroll',function(){var nav=document.querySelector('nav');if(!nav)return;var st=window.scrollY;nav.classList.toggle('nav-scrolled',st>60);if(st>200&&st>_lastScrollY+5){nav.classList.add('nav-hidden')}else if(st<_lastScrollY-5){nav.classList.remove('nav-hidden')}_lastScrollY=st},{passive:true});

// ═══ 3D TILT ON CARDS ═══
function setupCardTilt(){document.querySelectorAll('.beat-card').forEach(function(card){card.addEventListener('mousemove',function(e){var inner=card.querySelector('.beat-card-inner');if(!inner)return;var r=card.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-0.5;var y=(e.clientY-r.top)/r.height-0.5;inner.style.transform='perspective(800px) rotateY('+x*4+'deg) rotateX('+-y*4+'deg) scale(1.01)'});card.addEventListener('mouseleave',function(){var inner=card.querySelector('.beat-card-inner');if(!inner)return;inner.style.transform='perspective(800px) rotateY(0) rotateX(0) scale(1)'})})}

// ═══ EQ VISUALIZER ═══
var _eqInterval=null;
function startEQ(){var bars=document.querySelectorAll('#pi-eq span');if(!bars.length)return;_eqInterval=setInterval(function(){bars.forEach(function(b){b.style.height=(4+Math.random()*16)+'px'})},120)}
function stopEQ(){clearInterval(_eqInterval);document.querySelectorAll('#pi-eq span').forEach(function(b){b.style.height='4px'})}

// ═══ ANIMATED COUNTER ═══
function animateCounter(el,target){var current=0;var step=Math.max(1,Math.ceil(target/30));var iv=setInterval(function(){current+=step;if(current>=target){current=target;clearInterval(iv)}el.textContent=current},30)}

// ═══ STAGGERED REVEAL ═══
function observeStagger(){var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target)}})},{threshold:0.05,rootMargin:'0px 0px -40px 0px'});document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el)});document.querySelectorAll('.beat-card').forEach(function(c,i){c.style.setProperty('--si',i);c.classList.add('reveal','reveal-stagger');obs.observe(c)})}

// ═══ AUDIO PLAYER ═══
var AP=(function(){
  var _audio=null,_idx=-1,_playing=false,_modalMode=false,_countedPlays={};
  function _create(url){if(_audio){_audio.pause();_audio.src='';_audio.load()}_audio=new Audio(url);_audio.volume=parseFloat(document.getElementById('vol').value);_audio.addEventListener('timeupdate',_onTime);_audio.addEventListener('ended',_next)}
  function _onTime(){if(!_audio||!_audio.duration)return;var pct=(_audio.currentTime/_audio.duration)*100;document.getElementById('track-fill').style.width=pct+'%';document.getElementById('tc').textContent=_fmt(_audio.currentTime);document.getElementById('td').textContent=_fmt(_audio.duration);var mf=document.getElementById('m-fill');if(mf)mf.style.width=pct+'%';document.getElementById('m-tc').textContent=_fmt(_audio.currentTime);document.getElementById('m-td').textContent=_fmt(_audio.duration);_updateWaveProgress(pct)}
  function _updateWaveProgress(pct){var playing=document.querySelector('.beat-card.is-playing');if(!playing)return;var rect=playing.querySelector('.wf-clip-rect');if(rect)rect.setAttribute('width',(pct/100)*200)}
  function trackPlay(beatId){if(!beatId||beatId==='undefined'||_countedPlays[beatId])return;_countedPlays[beatId]=true;if(typeof db!=='undefined'&&db){db.ref('beats/'+beatId+'/plays').transaction(function(c){return(c||0)+1}).catch(function(){})}}
  function _next(){if(!_modalMode&&_idx<allBeats.length-1)_playIdx(_idx+1);else{_playing=false;stopEQ();_updateIcons()}}
  function _fmt(s){return Math.floor(s/60)+':'+Math.floor(s%60).toString().padStart(2,'0')}
  function _updateIcons(){var pb='<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h2v12H4zM10 2h2v12h-2z"/></svg>';var pbb='<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l10 5-10 5V3z"/></svg>';var pm='<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h2v12H4zM10 2h2v12h-2z"/></svg>';var pmm='<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l10 5-10 5V3z"/></svg>';var bb=document.getElementById('bar-play-btn');var mb=document.getElementById('m-play-btn');if(bb)bb.innerHTML=_playing?pb:pbb;if(mb)mb.innerHTML=_playing?pm:pmm;if(_playing)startEQ();else stopEQ();renderAll()}
  function _playIdx(idx){var b=allBeats[idx];if(!b)return;_idx=idx;_modalMode=false;var url=b.previewUrl||b.audioUrl||'';if(!url){openModal(b.id);return}_create(url);_audio.play().catch(function(){});_playing=true;trackPlay(b.id);document.getElementById('pi-name').textContent=b.name;document.getElementById('pi-meta').textContent=b.bpm+' BPM · '+b.key+' · '+b.genre;var th=document.getElementById('pi-thumb');th.innerHTML=b.imageUrl?'<img src="'+b.imageUrl+'" alt="" loading="lazy">':'♦';document.getElementById('player-bar').classList.add('up');_updateIcons()}
  return{playIdx:function(i){_playIdx(i)},openForModal:function(beat){_modalMode=true;var url=beat.previewUrl||beat.audioUrl||'';var isSame=_idx!==-1&&allBeats[_idx]&&allBeats[_idx].id===beat.id;if(!isSame&&url){var bi=allBeats.findIndex(function(b){return b.id===beat.id});_create(url);_audio.play().catch(function(){});_playing=true;_idx=bi;trackPlay(beat.id);document.getElementById('player-bar').classList.add('up');document.getElementById('pi-name').textContent=beat.name;document.getElementById('pi-meta').textContent=beat.bpm+' BPM · '+beat.key+' · '+beat.genre;var th=document.getElementById('pi-thumb');th.innerHTML=beat.imageUrl?'<img src="'+beat.imageUrl+'" alt="" loading="lazy">':'♦'}_updateIcons()},toggle:function(){if(!_audio||!_audio.src)return;if(_playing){_audio.pause();_playing=false}else{_audio.play().catch(function(){});_playing=true}_updateIcons()},prev:function(){if(_idx>0&&!_modalMode)_playIdx(_idx-1)},next:function(){if(_idx<allBeats.length-1&&!_modalMode)_playIdx(_idx+1)},skip:function(s){if(!_audio)return;_audio.currentTime=Math.max(0,Math.min(_audio.duration||0,_audio.currentTime+s))},seek:function(e){if(!_audio||!_audio.duration)return;var r=document.getElementById('track').getBoundingClientRect();_audio.currentTime=((e.clientX-r.left)/r.width)*_audio.duration},seekEl:function(e,el){if(!_audio||!_audio.duration)return;var r=el.getBoundingClientRect();_audio.currentTime=((e.clientX-r.left)/r.width)*_audio.duration},setVol:function(v){if(_audio)_audio.volume=parseFloat(v)},exitModal:function(){_modalMode=false;_updateIcons()},get currentBeatIdx(){return _idx},get playing(){return _playing}}
})();

var particles=[],pCanvas=null,pCtx=null,pAnimId=null,_pImgCache={};
function _pImg(url){if(_pImgCache[url])return _pImgCache[url];var img=new Image();img.crossOrigin='anonymous';img.src=url;_pImgCache[url]=img;img.onload=function(){_pImgCache[url]=img};return img}
function _drawStar(ctx,cx,cy,r,pts){ctx.beginPath();for(var i=0;i<pts*2;i++){var a=(i*Math.PI)/pts-Math.PI/2,rd=i%2===0?r:r*0.4,x=cx+Math.cos(a)*rd,y=cy+Math.sin(a)*rd;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.closePath();ctx.fill()}
function initParticles(){pCanvas=document.getElementById('particles-canvas');if(!pCanvas)return;pCtx=pCanvas.getContext('2d');pCanvas.width=window.innerWidth;pCanvas.height=window.innerHeight;window.addEventListener('resize',function(){pCanvas.width=window.innerWidth;pCanvas.height=window.innerHeight});particles=[];var count=T.particlesCount||40;for(var i=0;i<count;i++){particles.push({x:Math.random()*pCanvas.width,y:Math.random()*pCanvas.height,r:(T.particlesMin||2)+Math.random()*((T.particlesMax||6)-(T.particlesMin||2)),vx:(Math.random()-.5)*(T.particlesSpeed||1),vy:(Math.random()-.5)*(T.particlesSpeed||1),o:.1+Math.random()*.4,rot:Math.random()*Math.PI*2,rv:(Math.random()-.5)*0.02})}if(pAnimId)cancelAnimationFrame(pAnimId);animateParticles()}
function animateParticles(){if(!T.particlesOn||!pCtx){if(pCtx)pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);return}pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);var col=T.particlesColor||T.accent||'#dc2626';var type=T.particlesType||'circle';var text=T.particlesText||'♪';var imgUrl=T.particlesImgUrl||'';var baseOp=T.particlesOpacity!=null?T.particlesOpacity:0.5;particles.forEach(function(p){p.x+=p.vx;p.y+=p.vy;if(p.rot!=null)p.rot+=p.rv||0;if(p.x<-p.r*2)p.x=pCanvas.width+p.r;if(p.x>pCanvas.width+p.r)p.x=-p.r;if(p.y<-p.r*2)p.y=pCanvas.height+p.r;if(p.y>pCanvas.height+p.r)p.y=-p.r;var op=(p.o||0.3)*baseOp;pCtx.save();pCtx.globalAlpha=op;if(type==='square'){pCtx.fillStyle=col;pCtx.translate(p.x,p.y);pCtx.rotate(p.rot||0);pCtx.fillRect(-p.r,-p.r,p.r*2,p.r*2)}else if(type==='star'){pCtx.fillStyle=col;pCtx.translate(p.x,p.y);pCtx.rotate(p.rot||0);_drawStar(pCtx,0,0,p.r,5)}else if(type==='text'){pCtx.fillStyle=col;pCtx.font=Math.max(8,p.r*3)+'px sans-serif';pCtx.textAlign='center';pCtx.textBaseline='middle';pCtx.fillText(text,p.x,p.y)}else if(type==='image'){var img=_pImg(imgUrl);if(img&&img.complete&&img.naturalWidth)pCtx.drawImage(img,p.x-p.r,p.y-p.r,p.r*2,p.r*2);else{pCtx.fillStyle=col;pCtx.beginPath();pCtx.arc(p.x,p.y,p.r*.5,0,Math.PI*2);pCtx.fill()}}else{pCtx.fillStyle=col;pCtx.beginPath();pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);pCtx.fill()}pCtx.restore()});pAnimId=requestAnimationFrame(animateParticles)}

function applyTheme(t){
  T=t;var r=document.documentElement;
  var map={bg:'--bg',surface:'--surface',surface2:'--surface2',accent:'--accent',text:'--text',muted:'--muted',hint:'--hint',border:'--border',border2:'--border2',red:'--red',redL:'--red-l'};
  Object.keys(map).forEach(function(k){if(t[k])r.style.setProperty(map[k],t[k])});
  if(t.cardOpacity!=null&&t.surface)r.style.setProperty('--surface',hexRgba(t.surface,Math.min(1,t.cardOpacity)));
  if(t.blurBg!=null)r.style.setProperty('--blur-bg',t.blurBg+'px');
  if(t.grainOpacity!=null)r.style.setProperty('--grain-opacity',t.grainOpacity);
  if(t.radiusGlobal!=null){r.style.setProperty('--r',t.radiusGlobal+'px');r.style.setProperty('--r-lg',Math.round(t.radiusGlobal*1.6)+'px')}
  if(t.padSection!=null)r.style.setProperty('--pad-section',t.padSection+'rem');
  if(t.beatGap!=null)r.style.setProperty('--beat-gap',t.beatGap+'px');
  if(t.wbarColor)r.style.setProperty('--wbar-color',t.wbarColor);
  if(t.wbarActive)r.style.setProperty('--wbar-active',t.wbarActive);
  if(t.btnLicBg)r.style.setProperty('--btn-lic-bg',t.btnLicBg);
  if(t.btnLicClr)r.style.setProperty('--btn-lic-clr',t.btnLicClr);
  if(t.btnLicBdr)r.style.setProperty('--btn-lic-bdr',t.btnLicBdr);
  if(t.bgOpacity!=null)r.style.setProperty('--bg-opacity',t.bgOpacity);
  if(t.btnOpacityNormal!=null)r.style.setProperty('--btn-opacity',t.btnOpacityNormal);
  if(t.btnOpacityHover!=null)r.style.setProperty('--btn-opacity-hover',t.btnOpacityHover);
  if(t.waveOpacityOff!=null)r.style.setProperty('--wave-opacity-off',t.waveOpacityOff);
  if(t.waveOpacityOn!=null)r.style.setProperty('--wave-opacity-on',t.waveOpacityOn);
  if(t.logoScale)r.style.setProperty('--logo-scale',t.logoScale);
  if(t.logoTextGap!=null)r.style.setProperty('--logo-text-gap',t.logoTextGap+'px');
  if(t.cardShadowIntensity!=null&&t.cardShadowColor)r.style.setProperty('--card-shadow','0 12px 40px '+hexRgba(t.cardShadowColor,t.cardShadowIntensity));
  if(t.layout){if(t.layout.heroMarginTop!=null)r.style.setProperty('--hero-pad-top',t.layout.heroMarginTop+'rem');if(t.layout.playerBottom!=null)r.style.setProperty('--player-bottom',t.layout.playerBottom+'px');if(t.layout.logoOffsetX!=null)r.style.setProperty('--logo-offset-x',t.layout.logoOffsetX+'px')};
  var a=t.glowColor||t.accent||'#dc2626',gi=t.glowIntensity??1,go=t.glowOpacity??1;
  if(t.glowActive===false||gi===0){r.style.setProperty('--glow-sm','none');r.style.setProperty('--glow-md','none')}
  else{var gc=hexRgba(a,gi*go),gc50=hexRgba(a,gi*go*.5);var gBlur=t.glowBlur||20;r.style.setProperty('--glow-sm','0 0 '+gBlur+'px '+gc);r.style.setProperty('--glow-md','0 0 '+(gBlur*2)+'px '+gc50)};
  var gAnim=t.glowAnim||'none';
  if(gAnim!=='none'){r.style.setProperty('--glow-anim-name','glow-'+gAnim);r.style.setProperty('--glow-anim-duration',(t.glowAnimSpeed||2)+'s')}
  else{r.style.setProperty('--glow-anim-name','none')};
  if(t.fontDisplay){loadFont(t.fontDisplay);r.style.setProperty('--font-d',"'"+t.fontDisplay+"',sans-serif")}
  if(t.fontBody){loadFont(t.fontBody);r.style.setProperty('--font-m',"'"+t.fontBody+"',monospace")}
  if(t.fontSize)r.style.fontSize=t.fontSize+'px';
  if(t.lineHeight)r.style.lineHeight=t.lineHeight;
  var brand=document.getElementById('nav-brand');if(brand){brand.style.transform='translateX(var(--logo-offset-x,0px))'};
  var heroTitle=document.getElementById('hero-title');var heroSection=document.getElementById('hero-section');
  if(heroTitle){
    var hGlowOn=t.heroGlowOn!==false;var hGlowInt=t.heroGlowInt||t.glowIntensity||1;var hGlowBlur=t.heroGlowBlur||t.glowBlur||20;var heroAccent=t.heroStrokeClr||t.glowColor||a;
    if(hGlowOn)heroTitle.style.textShadow='0 0 '+hGlowBlur+'px '+hexRgba(heroAccent,hGlowInt);else heroTitle.style.textShadow='none';
    if(t.heroTitleSize)heroTitle.style.fontSize=t.heroTitleSize+'rem';if(t.heroLetterSpacing!=null)heroTitle.style.letterSpacing=t.heroLetterSpacing+'em';if(t.heroLineHeight)heroTitle.style.lineHeight=t.heroLineHeight;
    heroTitle.querySelectorAll('.glow-word').forEach(function(el){
      if(t.heroStrokeOn===true){el.style.webkitTextStroke=(t.heroStrokeW||1)+'px '+heroAccent;el.style.color='transparent'}else{el.style.webkitTextStroke='none';el.style.color=heroAccent};
      el.style.setProperty('--hero-word-blur',(t.heroWordBlur||10)+'px');el.style.setProperty('--hero-word-op',t.heroWordOp!=null?t.heroWordOp:0.35)})};
  if(heroSection){var gradOn=t.heroGradOn!==false;var gradClr=t.heroGradClr||a;var gradOp=t.heroGradOp!=null?t.heroGradOp:0.14;var gradW=t.heroGradW||80;var gradH=t.heroGradH||60;
    if(gradOn)heroSection.style.setProperty('--hero-grad','radial-gradient(ellipse '+gradW+'% '+gradH+'% at 50% 0%, '+hexRgba(gradClr,gradOp)+', transparent)');else heroSection.style.setProperty('--hero-grad','none');
    if(t.heroPadTop!=null)heroSection.style.setProperty('--hero-pad-top',t.heroPadTop+'rem')};
  var eyebrow=document.querySelector('.hero-eyebrow');
  if(eyebrow){eyebrow.style.display=t.heroEyebrowOn===false?'none':'inline-flex';var eyClr=t.heroEyebrowClr||a;eyebrow.style.color=eyClr;eyebrow.style.borderColor=hexRgba(eyClr,.3);eyebrow.style.background=hexRgba(eyClr,.08);if(t.heroEyebrowSize)eyebrow.style.fontSize=t.heroEyebrowSize+'px'};
  var lb=document.getElementById('loader-brand');if(lb&&t.accent){var em=lb.querySelector('em');if(em)em.style.color=t.accent;document.querySelectorAll('.ld').forEach(function(d){d.style.background=t.accent})};
  if(t.bg){var loader=document.getElementById('loader');if(loader)loader.style.background=t.bg};
  var banner=document.getElementById('site-banner');if(banner){banner.style.background=t.bannerBg||'#7f1d1d';banner.style.setProperty('--banner-speed',(t.bannerSpeed||20)+'s')};
  if(t.navOpacity!=null)r.style.setProperty('--nav-op',t.navOpacity);if(t.beatImgOpacity!=null)r.style.setProperty('--beat-img-op',t.beatImgOpacity);if(t.textOpacity!=null)r.style.setProperty('--text-op',t.textOpacity);if(t.heroBgOpacity!=null)r.style.setProperty('--hero-bg-op',t.heroBgOpacity);if(t.sectionOpacity!=null)r.style.setProperty('--section-op',t.sectionOpacity);
  if(t.orbBlendMode)r.style.setProperty('--orb-blend',t.orbBlendMode);if(t.grainBlendMode)r.style.setProperty('--grain-blend',t.grainBlendMode);if(t.wbarHeight!=null)r.style.setProperty('--wbar-h',t.wbarHeight+'px');if(t.wbarRadius!=null)r.style.setProperty('--wbar-r',t.wbarRadius+'px');if(t.fontWeight)r.style.setProperty('--font-w',t.fontWeight);
  applyAnim(document.querySelector('.nav-brand'),t.animLogo);applyAnim(document.getElementById('hero-title'),t.animTitle);applyAnim(document.getElementById('player-bar'),t.animPlayer);
  document.querySelectorAll('.beat-card').forEach(function(c){applyAnim(c,t.animCards)});
  document.querySelectorAll('.btn-lic,.nav-cta,.btn-wa').forEach(function(b){applyAnim(b,t.animButtons)});
  initParticles()
}

function applySettings(){
  var s=siteSettings;var brand=document.getElementById('nav-brand');
  if(brand){if(T.logoUrl){var scale=T.logoScale||1;var imgHtml='<img src="'+T.logoUrl+'" style="width:'+(T.logoWidth||80)+'px;'+(T.logoHeight&&T.logoHeight>0?'height:'+T.logoHeight+'px;':'')+'transform:rotate('+(T.logoRotation||0)+'deg) scale('+scale+');display:block;transition:transform .3s" alt="logo">';if(T.showLogoText)brand.innerHTML='<span class="nav-logo-wrap">'+imgHtml+'</span><span class="nav-text-wrap" style="display:flex;align-items:center">'+(s.siteName||'DACE')+'<em>·</em></span>';else brand.innerHTML=imgHtml}else{brand.innerHTML=(s.siteName||'DACE')+'<em>·</em>'}};
  document.getElementById('footer-brand').innerHTML=(s.siteName||'DACE')+'<em>·</em>';
  var ban=document.getElementById('site-banner');
  if(s.bannerActive){ban.style.display='block';var bText=T.bannerText||s.bannerText||'';(customEmojis||[]).forEach(function(e){if(e.name&&e.url)bText=bText.split(':'+e.name+':').join('<img src="'+e.url+'" style="height:'+(e.height||24)+'px;vertical-align:middle;margin:0 2px">')});var bAnim=s.bannerAnim||'scroll';var bSpeed=(T.bannerSpeed||s.bannerSpeed||20);var bEasing=s.bannerEasing||'linear';var bDir=s.bannerDir||'normal';var bDelay=s.bannerDelay||0;var bTxtClr=s.bannerTxtClr||'#ffffff';var durMap={'scroll':bSpeed+'s','fade-pulse':(bSpeed/5)+'s','bounce':(bSpeed/10)+'s','glow-pulse':(bSpeed/5)+'s'};var bDur=durMap[bAnim]||bSpeed+'s';var bInner=document.getElementById('banner-inner');bInner.innerHTML=bText;if(bAnim==='static')bInner.style.animation='none';else bInner.style.animation='banner-'+bAnim+' '+bDur+' '+bEasing+' '+bDelay+'s infinite '+bDir;bInner.style.color=bTxtClr}else ban.style.display='none';
  var _heroText=s.heroTitle||T.heroTitleCustom;if(_heroText){var lines=_heroText.split('\n');document.getElementById('hero-title').innerHTML=lines.map(function(l,i){return i===lines.length-1?'<span class="glow-word" data-t="'+l+'">'+l+'</span>':l}).join('<br>')};
  document.getElementById('hero-sub').textContent=s.heroSubtitle||T.heroSubCustom||'';
  var eyebrow=document.querySelector('.hero-eyebrow');if(eyebrow&&T.heroEyebrow){eyebrow.textContent='';eyebrow.appendChild(document.createTextNode(T.heroEyebrow))};
  if(s.whatsapp){var wa='https://wa.me/'+s.whatsapp;document.getElementById('nav-wa').href=wa;document.getElementById('f-wa').href=wa;var cwa=document.getElementById('cta-wa');if(cwa)cwa.href=wa}
  if(s.instagram){var ig='https://instagram.com/'+s.instagram;document.getElementById('nav-ig').href=ig;document.getElementById('f-ig').href=ig}
  if(s.email)document.getElementById('f-email').href='mailto:'+s.email;

  // Section divider (editable)
  var dt=document.getElementById('divider-title');var ds=document.getElementById('divider-sub');
  if(dt&&s.dividerTitle)dt.innerHTML=s.dividerTitle;
  if(ds&&s.dividerSub)ds.textContent=s.dividerSub;
  if(s.testimonialsActive&&s.testimonials&&s.testimonials.length){document.getElementById('testimonials').style.display='block';document.getElementById('testi-grid').innerHTML=s.testimonials.map(function(t){return'<div class="testi-card"><div class="testi-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div><p class="testi-text">'+t.text+'</p><div class="testi-name">'+t.name+'</div><div class="testi-role">'+(t.role||'')+'</div></div>'}).join('')}
}

function renderCustomLinks(links){var byLoc={header:[],hero:[],footer:[]};Object.values(links).forEach(function(l){if(byLoc[l.location])byLoc[l.location].push(l)});document.getElementById('nav-custom-links').innerHTML=byLoc.header.map(function(l){return'<a class="nav-link" href="'+l.url+'" target="_blank">'+l.label+'</a>'}).join('');document.getElementById('hero-custom-links').innerHTML=byLoc.hero.map(function(l){return'<a class="nav-cta" href="'+l.url+'" target="_blank" style="display:inline-block;margin:4px">'+l.label+'</a>'}).join('');document.getElementById('footer-custom-links').innerHTML=byLoc.footer.map(function(l){return'<a class="footer-link" href="'+l.url+'" target="_blank">'+l.label+'</a>'}).join('')}

function renderFloating(elements){var layer=document.getElementById('floating-layer');layer.innerHTML='';Object.values(elements).forEach(function(el){if(!el||!el.visible)return;var div=document.createElement('div');div.className='fe-static';div.style.cssText='left:'+(el.x||0)+'px;top:'+(el.y||0)+'px;width:'+(el.width||100)+'px;height:'+(el.height||100)+'px;opacity:'+(el.opacity||1);if(el.type==='text')div.innerHTML='<div class="fe-text-static" style="font-size:'+(el.fontSize||16)+'px">'+(el.content||'')+'</div>';else div.innerHTML='<img src="'+(el.content||'')+'" alt="" draggable="false">';if(el.anim&&el.anim!=='none'){applyAnim(div,{type:el.anim,dur:el.animDur||2,del:0})}layer.appendChild(div)})}

function renderAll(){
  var feat=allBeats.filter(function(b){return b.featured});var fs=document.getElementById('section-featured');
  if(feat.length){fs.style.display='block';document.getElementById('feat-grid').innerHTML=feat.map(function(b){return beatCard(b,allBeats.indexOf(b))}).join('')}else fs.style.display='none';
  buildFilterOptions();buildTagCloud();buildFilters();applyFilters();
  animateCounter(document.getElementById('st-beats'),allBeats.length);
  animateCounter(document.getElementById('st-genres'),new Set(allBeats.map(function(b){return b.genre})).size);
  var sk=document.getElementById('skeleton-grid');if(sk)sk.style.display='none';
  setTimeout(function(){setupCardTilt();observeStagger()},50);
  // Generate waveforms async (non-blocking)
  setTimeout(function(){allBeats.forEach(function(b){if(b.previewUrl)applyWaveformToCard(b.id)})},500);
}

function buildFilterOptions(){
  // Populate keys
  var keys=Array.from(new Set(allBeats.map(function(b){return b.key}).filter(Boolean))).sort();
  var ks=document.getElementById('filter-key');
  var kv=ks.value;ks.innerHTML='<option value="">Key</option>'+keys.map(function(k){return'<option value="'+k+'">'+k+'</option>'}).join('');
  if(keys.includes(kv))ks.value=kv;
  // Populate moods
  var moods=new Set();
  allBeats.forEach(function(b){(b.tags||[]).forEach(function(t){moods.add(t.toLowerCase())})});
  var moodList=Array.from(moods).sort();
  var ms=document.getElementById('filter-mood');
  var mv=ms.value;ms.innerHTML='<option value="">Mood</option>'+moodList.map(function(m){return'<option value="'+m+'">'+m.charAt(0).toUpperCase()+m.slice(1)+'</option>'}).join('');
  if(moodList.includes(mv))ms.value=mv;
}

function buildFilters(){
  var genres=['Todos'].concat(Array.from(new Set(allBeats.map(function(b){return b.genre}))));
  document.getElementById('filters').innerHTML=genres.map(function(g){
    return'<button class="filter'+(g===activeGenre?' active':'')+'" onclick="setGenre(\''+g+'\')">'+g+'</button>'
  }).join('');
}

function setGenre(g){activeGenre=g;buildFilters();applyFilters()}

function clearSearch(){
  document.getElementById('search-input').value='';
  document.getElementById('search-clear').classList.remove('show');
  applyFilters();
}

function applyFilters(){
  var query=(document.getElementById('search-input').value||'').trim().toLowerCase();
  var keyF=document.getElementById('filter-key').value;
  var moodF=document.getElementById('filter-mood').value;
  var sortF=document.getElementById('filter-sort').value;
  document.getElementById('search-clear').classList.toggle('show',query.length>0);
  var filtered=allBeats.filter(function(b){
    if(activeGenre!=='Todos'&&b.genre!==activeGenre)return false;
    if(query){
      var nameMatch=b.name&&b.name.toLowerCase().indexOf(query)>-1;
      var tagMatch=(b.tags||[]).some(function(t){return t.toLowerCase().indexOf(query)>-1});
      var genreMatch=b.genre&&b.genre.toLowerCase().indexOf(query)>-1;
      var descMatch=b.description&&b.description.toLowerCase().indexOf(query)>-1;
      var keyMatch=b.key&&b.key.toLowerCase().indexOf(query)>-1;
      if(!nameMatch&&!tagMatch&&!genreMatch&&!descMatch&&!keyMatch)return false;
    }
    if(keyF&&b.key!==keyF)return false;
    if(moodF){var hasMood=(b.tags||[]).some(function(t){return t.toLowerCase()===moodF});if(!hasMood)return false}
    if(activeTags.length>0){
      var beatTagsLower=(b.tags||[]).map(function(t){return t.toLowerCase()});
      if(!activeTags.every(function(at){return beatTagsLower.indexOf(at)>-1}))return false;
    }
    return true;
  });
  if(sortF==='newest')filtered.sort(function(a,b){return(b.createdAt||0)-(a.createdAt||0)});
  else if(sortF==='oldest')filtered.sort(function(a,b){return(a.createdAt||0)-(b.createdAt||0)});
  else if(sortF==='name-az')filtered.sort(function(a,b){return a.name.localeCompare(b.name)});
  else if(sortF==='name-za')filtered.sort(function(a,b){return b.name.localeCompare(a.name)});
  else if(sortF==='bpm-asc')filtered.sort(function(a,b){return(a.bpm||0)-(b.bpm||0)});
  else if(sortF==='bpm-desc')filtered.sort(function(a,b){return(b.bpm||0)-(a.bpm||0)});
  else if(sortF==='price-asc')filtered.sort(function(a,b){var pa=(a.licenses&&a.licenses[0]&&a.licenses[0].priceMXN)||0;var pb=(b.licenses&&b.licenses[0]&&b.licenses[0].priceMXN)||0;return pa-pb});
  else if(sortF==='price-desc')filtered.sort(function(a,b){var pa=(a.licenses&&a.licenses[0]&&a.licenses[0].priceMXN)||0;var pb=(b.licenses&&b.licenses[0]&&b.licenses[0].priceMXN)||0;return pb-pa});
  else filtered.sort(function(a,b){return(a.order||0)-(b.order||0)});
  document.getElementById('ct-badge').textContent=filtered.length+' beats';
  var tagsHtml='';
  if(query)tagsHtml+='<span class="active-filter-tag">🔍 "'+query+'" <button onclick="clearSearch()">✕</button></span>';
  if(activeGenre!=='Todos')tagsHtml+='<span class="active-filter-tag">🎵 '+activeGenre+' <button onclick="activeGenre=\'Todos\';buildFilters();applyFilters()">✕</button></span>';
  if(keyF)tagsHtml+='<span class="active-filter-tag">🎹 '+keyF+' <button onclick="document.getElementById(\'filter-key\').value=\'\';applyFilters()">✕</button></span>';
  if(moodF)tagsHtml+='<span class="active-filter-tag">✨ '+moodF.charAt(0).toUpperCase()+moodF.slice(1)+' <button onclick="document.getElementById(\'filter-mood\').value=\'\';applyFilters()">✕</button></span>';
  if(sortF&&sortF!=='order')tagsHtml+='<span class="active-filter-tag">📊 '+document.getElementById('filter-sort').selectedOptions[0].text+' <button onclick="document.getElementById(\'filter-sort\').value=\'order\';applyFilters()">✕</button></span>';
  activeTags.forEach(function(at){var label=at.charAt(0).toUpperCase()+at.slice(1);tagsHtml+='<span class="active-filter-tag">🏷️ '+label+' <button onclick="removeActiveTag(\''+at.replace(/'/g,"\\'")+'\')">✕</button></span>'});
  var clearAll=(query||activeGenre!=='Todos'||keyF||moodF||(sortF&&sortF!=='order')||activeTags.length>0);
  if(clearAll)tagsHtml+='<button class="filter" onclick="resetAllFilters()" style="font-size:9px;padding:3px 10px">Limpiar todo</button>';
  document.getElementById('active-filters').innerHTML=tagsHtml;
  updateTagCloudState();
  if(filtered.length===0){
    document.getElementById('main-grid').innerHTML='<div class="no-results" style="grid-column:1/-1"><div class="no-results-icon">🎵</div><div class="no-results-text">No se encontraron beats</div><div class="no-results-sub">Prueba con otros filtros o busca otro nombre</div></div>';
  }else{
    document.getElementById('main-grid').innerHTML=filtered.map(function(b){return beatCard(b,allBeats.indexOf(b))}).join('');
  }
  document.querySelectorAll('.beat-card').forEach(function(c){applyAnim(c,T.animCards)});
  setTimeout(function(){setupCardTilt();observeStagger()},50);
}

function resetAllFilters(){
  document.getElementById('search-input').value='';
  document.getElementById('search-clear').classList.remove('show');
  document.getElementById('filter-key').value='';
  document.getElementById('filter-mood').value='';
  document.getElementById('filter-sort').value='order';
  activeGenre='Todos';
  activeTags=[];
  buildFilters();
  buildTagCloud();
  applyFilters();
}

// ═══ TAG CLOUD ═══
var TAG_CLOUD_MAX=20;
function buildTagCloud(){
  var tagCount={};
  allBeats.forEach(function(b){(b.tags||[]).forEach(function(t){var tl=t.toLowerCase();tagCount[tl]=(tagCount[tl]||0)+1})});
  var sortedTags=Object.keys(tagCount).sort(function(a,b){if(tagCount[b]!==tagCount[a])return tagCount[b]-tagCount[a];return a.localeCompare(b)});
  if(!sortedTags.length){var c=document.getElementById('tag-cloud');if(c)c.innerHTML='';return}
  var html='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;color:var(--hint);font-weight:600;text-transform:uppercase;letter-spacing:.5px">🏷️ Tags populares</span>';
  if(sortedTags.length>TAG_CLOUD_MAX)html+='<button style="font-size:10px;color:var(--accent);background:none;border:none;cursor:pointer;font-family:var(--font-m);padding:2px 6px;border-radius:4px" id="tag-cloud-toggle" onclick="toggleTagCloudExpand()">ver más ('+sortedTags.length+')</button>';
  html+='</div><div class="tag-cloud-items" id="tag-cloud-items">';
  sortedTags.forEach(function(tag,i){
    var hidden=i>=TAG_CLOUD_MAX?' tag-cloud-item--hidden':'';
    var active=activeTags.indexOf(tag)>-1?' tag-cloud-item--active':'';
    var label=tag.charAt(0).toUpperCase()+tag.slice(1);
    html+='<button class="tag-cloud-item'+hidden+active+'" data-tag="'+tag+'" onclick="toggleTagFilter(\''+tag.replace(/'/g,"\\'")+'\')">'+label+' <span style="font-size:9px;opacity:.6">'+tagCount[tag]+'</span></button>';
  });
  html+='</div>';
  document.getElementById('tag-cloud').innerHTML=html;
}
function toggleTagFilter(tag){var idx=activeTags.indexOf(tag);if(idx>-1)activeTags.splice(idx,1);else activeTags.push(tag);updateTagCloudState();applyFilters()}
function removeActiveTag(tag){var idx=activeTags.indexOf(tag);if(idx>-1)activeTags.splice(idx,1);updateTagCloudState();applyFilters()}
function updateTagCloudState(){document.querySelectorAll('.tag-cloud-item').forEach(function(el){var tag=el.getAttribute('data-tag');el.classList.toggle('tag-cloud-item--active',activeTags.indexOf(tag)>-1)})}
function toggleTagCloudExpand(){var c=document.getElementById('tag-cloud-items'),t=document.getElementById('tag-cloud-toggle');if(!c||!t)return;if(c.classList.contains('tag-cloud-items--expanded')){c.classList.remove('tag-cloud-items--expanded');t.textContent='ver más'}else{c.classList.add('tag-cloud-items--expanded');t.textContent='ver menos'}}
function beatCard(b,globalIdx){var isCurrent=AP.currentBeatIdx===globalIdx;var isPlay=isCurrent&&AP.playing;var bars=Array.from({length:20},function(_,i){var _wh=T.wbarHeight||12;var h=Math.max(4,_wh*0.4+Math.sin(i*0.9+parseInt(b.id||0)*2)*_wh+Math.cos(i*1.4)*(_wh*0.6));var dur=(0.3+Math.random()*0.5).toFixed(2);return'<div class="wbar'+(isPlay?' anim':'')+'" style="height:'+h+'px;--wd:'+dur+'s;animation-delay:'+(i*0.05).toFixed(2)+'s"></div>'}).join('');var lics=b.licenses||[];var minL=lics[0];var imgH=b.imageUrl?'<img src="'+b.imageUrl+'" alt="'+b.name+'" loading="lazy">':'<div class="beat-img-ph">♦</div>';var isWished=_wishlist.indexOf(b.id)>-1;
return'<div class="beat-card'+(isPlay?' is-playing':'')+(b.featured?' featured':'')+'" id="card-'+b.id+'" onclick="handleCardClick(\''+b.id+'\','+globalIdx+')" style="--card-tint:'+(b.accentColor?'linear-gradient(135deg,'+b.accentColor+',transparent)':'linear-gradient(135deg,rgba(185,28,28,0.3),transparent)')+'"><div class="shimmer-overlay"></div><button class="wish-btn'+(isWished?' active':'')+'" data-id="'+b.id+'" onclick="toggleWish(\''+b.id+'\',event)">'+(isWished?'♥':'♡')+'</button><div class="beat-card-inner"><div class="beat-img">'+imgH+'<div class="beat-wave-row">'+bars+'</div><div class="play-hint"><div class="play-circle"><svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="'+(isPlay?'M4 2h2v12H4zM10 2h2v12h-2z':'M5 3l10 5-10 5V3z')+'"/></svg></div></div></div><div class="beat-body"><div class="beat-name">'+b.name+(b.exclusive?'<span class="tag" style="border-color:rgba(185,28,28,.5);color:var(--accent);margin-left:6px">EXCL</span>':'')+'</div><div class="beat-meta-row"><span>'+b.bpm+' BPM</span><span>'+b.key+'</span><span>'+b.genre+'</span>'+(b.plays?'<span>▶ '+b.plays+'</span>':'')+'</div><div class="beat-tags-row">'+(b.tags||[]).map(function(t){return'<span class="tag">'+t+'</span>'}).join('')+'</div><div class="beat-foot">'+(b.available!==false?'<div><div class="price-from">desde</div><div class="price-main">$'+(minL?minL.priceMXN.toLocaleString():'350')+' <span style="font-size:11px;color:var(--muted);font-weight:400">MXN</span><span class="price-usd">· $'+(minL?minL.priceUSD:'18')+' USD</span></div></div><button class="btn-lic" onclick="event.stopPropagation();openModal(\''+b.id+'\')">Ver licencias</button>':'<span class="unavail-lbl">No disponible</span>')+'</div></div></div>'}
function handleCardClick(id,idx){var b=allBeats.find(function(x){return x.id===id});if(!b||b.available===false)return;if(!b.audioUrl&&!b.previewUrl){openModal(id);return}if(AP.currentBeatIdx===idx){AP.toggle();return}AP.playIdx(idx)}

// ═══ DYNAMIC OG TAGS ═══
function _setMeta(prop,content){var el=document.querySelector('meta[property="'+prop+'"]')||document.querySelector('meta[name="'+prop+'"]');if(el)el.setAttribute('content',content)}
var _ogDefaults={title:null,desc:null,img:null};
function _updateOG(beat){
  if(!_ogDefaults.title){_ogDefaults.title=document.querySelector('meta[property="og:title"]').content;_ogDefaults.desc=document.querySelector('meta[property="og:description"]').content;_ogDefaults.img=document.querySelector('meta[property="og:image"]').content}
  var title=beat.name+' · DACE Beats';
  var desc=beat.bpm+' BPM · '+beat.key+' · '+beat.genre+(beat.licenses&&beat.licenses[0]?' · Desde $'+beat.licenses[0].priceMXN+' MXN':'');
  var img=beat.imageUrl||_ogDefaults.img;
  _setMeta('og:title',title);_setMeta('twitter:title',title);
  _setMeta('og:description',desc);_setMeta('twitter:description',desc);
  _setMeta('og:image',img);_setMeta('twitter:image',img);
  document.title=beat.name+' · DACE · Beats';
}
function _restoreOG(){
  if(!_ogDefaults.title)return;
  _setMeta('og:title',_ogDefaults.title);_setMeta('twitter:title',_ogDefaults.title);
  _setMeta('og:description',_ogDefaults.desc);_setMeta('twitter:description',_ogDefaults.desc);
  _setMeta('og:image',_ogDefaults.img);_setMeta('twitter:image',_ogDefaults.img);
  document.title='DACE · Beats';
}
function openModal(id){var b=allBeats.find(function(x){return x.id===id});if(!b)return;modalBeatId=id;
  // Update OG tags for sharing
  _updateOG(b);
  document.getElementById('m-name').textContent=b.name;document.getElementById('m-sub').innerHTML='<span>'+b.bpm+' BPM</span><span>'+b.key+'</span><span>'+b.genre+'</span>';var mhero=document.getElementById('mhero');var oi=mhero.querySelector('img');if(oi)oi.remove();document.getElementById('mhero-ph').style.display=b.imageUrl?'none':'flex';if(b.imageUrl){var img=document.createElement('img');img.src=b.imageUrl;img.alt=b.name;img.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover';mhero.insertBefore(img,mhero.firstChild)}document.getElementById('m-desc').textContent=b.description||'';document.getElementById('m-tags').innerHTML=(b.tags||[]).map(function(t){return'<span class="tag">'+t+'</span>'}).join('');var platHtml=[b.spotify&&'<a class="plat-btn plat-spotify" href="'+b.spotify+'" target="_blank">🎵 Spotify</a>',b.youtube&&'<a class="plat-btn plat-youtube" href="'+b.youtube+'" target="_blank">▶ YouTube</a>',b.soundcloud&&'<a class="plat-btn plat-soundcloud" href="'+b.soundcloud+'" target="_blank">☁ SoundCloud</a>'].filter(Boolean).join('');document.getElementById('m-plat').innerHTML=platHtml;document.getElementById('m-plat').style.display=platHtml?'flex':'none';document.getElementById('m-lics').innerHTML=(b.licenses||[]).map(function(l,i){return'<div class="lic-row'+(i===0?' sel':'')+'" onclick="selLic(this)"><div class="lic-name">'+l.name+'</div><div class="lic-desc">'+l.description+'</div><div class="lic-p"><div class="lic-mxn">$'+(l.priceMXN||0).toLocaleString()+' MXN</div><div class="lic-usd">≈ $'+(l.priceUSD||0)+' USD</div></div></div>'}).join('');var msg=encodeURIComponent('Hola DACE, me interesa licenciar el beat "'+b.name+'". ¿Podemos hablar?');var wa=siteSettings.whatsapp?'https://wa.me/'+siteSettings.whatsapp+'?text='+msg:'#';var ig=siteSettings.instagram?'https://instagram.com/'+siteSettings.instagram:'#';document.getElementById('m-acts').innerHTML='<a class="btn-wa" href="'+wa+'" target="_blank">Contactar por WhatsApp</a><a class="btn-ig" href="'+ig+'" target="_blank">Instagram</a>';var bi=allBeats.findIndex(function(b2){return b2.id===b.id});var isCurrent=AP.currentBeatIdx===bi&&AP.playing;var mb=document.getElementById('m-play-btn');if(mb)mb.innerHTML=isCurrent?'<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h2v12H4zM10 2h2v12h-2z"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l10 5-10 5V3z"/></svg>';document.getElementById('modal-ov').classList.add('open');document.body.style.overflow='hidden'}
function playModalBeat(){if(!modalBeatId)return;var b=allBeats.find(function(x){return x.id===modalBeatId});if(!b)return;var bi=allBeats.findIndex(function(x){return x.id===modalBeatId});if(AP.currentBeatIdx===bi&&AP.playing){AP.toggle()}else{AP.openForModal(b)}}
function closeModal(){document.getElementById('modal-ov').classList.remove('open');document.body.style.overflow='';AP.exitModal();_restoreOG()}
function selLic(el){document.querySelectorAll('.lic-row').forEach(function(r){r.classList.remove('sel')});el.classList.add('sel')}
function showToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2800)}

window.addEventListener('message',function(e){var d=e.data;if(!d||!d.type)return;switch(d.type){case'theme-update':if(d.theme){T=d.theme;applyTheme(T)}break;case'settings-update':if(d.settings){siteSettings=d.settings;applySettings()}break;case'emojis-update':if(d.emojis){customEmojis=d.emojis;applySettings()}break;case'floating-update':if(d.elements){floatingEls=d.elements;renderFloating(floatingEls)}break;case'highlight-element':if(d.selector)highlightElement(d.selector);break;case'clear-highlight':clearHighlight();break;case'inspector-mode':_inspectorMode=!!d.enabled;document.body.style.cursor=_inspectorMode?'crosshair':'';break}});

function setupInspector(){document.addEventListener('click',function(e){if(!_inspectorMode)return;e.preventDefault();e.stopPropagation();var el=e.target;var info={tag:el.tagName,id:el.id,classes:el.className,text:(el.textContent||'').substring(0,50)};var selector='';if(el.id)selector='#'+el.id;else if(el.className&&typeof el.className==='string')selector=el.tagName.toLowerCase()+'.'+el.className.split(' ')[0];else selector=el.tagName.toLowerCase();info.selector=selector;highlightElement(selector);if(window.parent!==window){window.parent.postMessage({type:'element-clicked',info:info,selector:selector},'*')}},true)}
function highlightElement(selector){var el=document.querySelector(selector);var hl=document.getElementById('inspector-hl');if(!el||!hl)return;var r=el.getBoundingClientRect();hl.style.display='block';hl.style.left=r.left+'px';hl.style.top=r.top+'px';hl.style.width=r.width+'px';hl.style.height=r.height+'px';document.getElementById('inspector-label').textContent=selector}
function clearHighlight(){var hl=document.getElementById('inspector-hl');if(hl)hl.style.display='none'}
function notifyParentReady(){if(window.parent!==window){window.parent.postMessage({type:'index-ready',ver:DACE_VER},'*')}}

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    var si=document.getElementById('search-input');
    if(si&&document.activeElement===si){si.blur();si.value='';applyFilters();return}
    closeModal();
  }
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();var si=document.getElementById('search-input');if(si)si.focus()}
  if(e.key===' '&&!e.target.matches('input,textarea,button')){e.preventDefault();AP.toggle()}
});
window.addEventListener('storage',function(e){if(e.key==='dace-theme'&&e.newValue){T=JSON.parse(e.newValue);applyTheme(T)}if(e.key==='dace-theme-broadcast'&&e.newValue){try{var d=JSON.parse(e.newValue);if(d.theme){T=d.theme;applyTheme(T)}}catch(er){}}if(e.key==='dace-custom-emojis'&&e.newValue){customEmojis=JSON.parse(e.newValue);applySettings()}if(e.key==='dace-floating'&&e.newValue){floatingEls=JSON.parse(e.newValue);renderFloating(floatingEls)}});

window.addEventListener('load',function(){
  setupInspector();notifyParentReady();
  var loaderTimeout=setTimeout(function(){_ldTheme=_ldSettings=_ldBeats=true;_checkReady()},5000);
  try{
    firebase.initializeApp(FC);db=firebase.database();
    var lt=localStorage.getItem('dace-theme');if(lt){T=JSON.parse(lt);applyTheme(T);_ldTheme=true;_checkReady()}
    db.ref('theme').on('value',function(snap){var t=snap.val()||{};T=t;applyTheme(T);localStorage.setItem('dace-theme',JSON.stringify(t));_ldTheme=true;_checkReady()});
    var ce=localStorage.getItem('dace-custom-emojis');if(ce)customEmojis=JSON.parse(ce);
    var fl=localStorage.getItem('dace-floating');if(fl)floatingEls=JSON.parse(fl);
    renderFloating(floatingEls);
    db.ref('settings').on('value',function(snap){siteSettings=snap.val()||{};applySettings();_ldSettings=true;_checkReady()});
    db.ref('beats').on('value',function(snap){var raw=snap.val()||{};allBeats=Object.keys(raw).map(function(k){raw[k].id=raw[k].id||k;return raw[k]}).filter(function(b){return b.active!==false&&b.id&&b.id!=='undefined'}).sort(function(a,b){return(a.order||0)-(b.order||0)});renderAll();_ldBeats=true;_checkReady();clearTimeout(loaderTimeout)});
    db.ref('floatingElements').on('value',function(snap){renderFloating(snap.val()||{})});
    db.ref('customLinks').on('value',function(snap){renderCustomLinks(snap.val()||{})});
  }catch(e){console.error('Firebase init error:',e);clearTimeout(loaderTimeout);_ldTheme=_ldSettings=_ldBeats=true;_checkReady();var lt2=localStorage.getItem('dace-theme');if(lt2){T=JSON.parse(lt2);applyTheme(T)}var ls=localStorage.getItem('dace-settings');if(ls){siteSettings=JSON.parse(ls);applySettings()}showToast('Error al conectar con Firebase')}
  observeStagger();
  _updateWishBadge();
});

(function(){
  'use strict';
  if(typeof firebase==='undefined'||typeof db==='undefined')return;
  function getDate(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
  window.trackEvent=function(category,action,label,value){
    var date=getDate(),eventId=genId();
    var event={ts:firebase.database.ServerValue.TIMESTAMP,cat:category,act:action,lbl:label||'',val:value||0};
    db.ref('analytics/events/'+date+'/'+eventId).set(event);
    if(label&&(action==='beat_click'||action==='beat_modal_open'||action==='whatsapp_click')){
      var field=action==='beat_click'?'clicks':action==='beat_modal_open'?'views':'waClicks';
      db.ref('analytics/counts/'+label).child(field).transaction(function(c){return(c||0)+1});
    }
    db.ref('analytics/daily/'+date+'/total').transaction(function(c){return(c||0)+1});
    db.ref('analytics/daily/'+date+'/actions/'+action).transaction(function(c){return(c||0)+1});
  };
  window.trackEvent('engagement','page_view',document.title);
  var si=document.getElementById('search-input');
  if(si){var st;si.addEventListener('input',function(){clearTimeout(st);var q=this.value.trim();if(q.length>=2){st=setTimeout(function(){window.trackEvent('engagement','search_query',q)},800)}})}
  // Auto-track modal opens
  if(typeof window.openModal==='function'){
    var _omOrig=window.openModal;
    window.openModal=function(id){window.trackEvent('beats','beat_modal_open',id);return _omOrig.apply(this,arguments)};
  }
  // Auto-track WhatsApp clicks
  document.addEventListener('click',function(e){var wa=e.target.closest('a[href*="wa.me"]');if(wa){window.trackEvent('beats','whatsapp_click','modal')}});
})();

(function(){
  'use strict';
  if(typeof AP==='undefined'||!AP)return;
  var RETRY_DELAY=2000,TIMEOUT=10000,retryMap={};
  function flashErr(src){var c=document.querySelector('.beat-card.is-playing,.beat-card:hover');if(!c)return;c.style.transition='box-shadow .15s';c.style.boxShadow='0 0 0 3px rgba(255,50,50,.8)';setTimeout(function(){c.style.boxShadow=''},1500)}
  function skipNext(){try{if(AP.queue&&AP.idx!=null){AP.play((AP.idx+1)%AP.queue.length)}}catch(e){}}
  function scheduleRetry(audio){var src=audio.src,count=retryMap[src]||0;if(count>=1){delete retryMap[src];if(typeof showToast==='function')showToast('No se pudo reproducir este beat');flashErr(src);skipNext();return}retryMap[src]=count+1;setTimeout(function(){try{audio.load();audio.play().catch(function(){})}catch(e){if(typeof showToast==='function')showToast('No se pudo reproducir este beat');flashErr(src);skipNext()}},RETRY_DELAY)}
  var _origPlay=AP.play.bind(AP);
  AP.play=function(idx){retryMap={};try{_origPlay(idx)}catch(e){if(typeof showToast==='function')showToast('Error al reproducir');return}requestAnimationFrame(function(){var audio=AP.audio||document.querySelector('audio');if(!audio||audio._ep)return;audio._ep=true;audio.addEventListener('error',function(){scheduleRetry(audio)});audio.addEventListener('canplay',function(){retryMap[audio.src]=0});var to=setTimeout(function(){if(audio.readyState<2)scheduleRetry(audio)},TIMEOUT);audio.addEventListener('canplay',function(){clearTimeout(to)},{once:true})})};
  if(AP.toggle){var _ot=AP.toggle.bind(AP);AP.toggle=function(){try{_ot()}catch(e){if(typeof showToast==='function')showToast('Error')}}}
})();

(function(){
  var _origOpen=window.openModal,_origClose=window.closeModal,_origTitle=document.title,_guard=false;
  function _getId(){var m=location.hash.match(/^#\/beat\/(.+)$/);return m?decodeURIComponent(m[1]):null}
  function _push(id){if(id)history.pushState({beatId:id},'','#/beat/'+encodeURIComponent(id));else history.pushState(null,'',location.pathname+location.search)}
  function _updTitle(id){if(typeof allBeats!=='undefined'){var b=null;for(var i=0;i<allBeats.length;i++){if(allBeats[i].id===id){b=allBeats[i];break}}if(b)document.title=b.name+' — DACEWAV.STORE'}}
  window.openModal=function(id){if(_origOpen)_origOpen(id);if(!_guard)_push(id);_updTitle(id);setTimeout(function(){
    var mb=document.querySelector('#modal-ov .modal-body');
    if(mb&&!document.getElementById('btn-copiar-link')){
      var btn=document.createElement('button');btn.id='btn-copiar-link';btn.type='button';btn.innerHTML='🔗 Copiar link';
      btn.style.cssText='display:block;margin:12px auto 0;padding:8px 18px;background:transparent;color:var(--muted);border:1px solid var(--border2);border-radius:8px;font-size:12px;font-family:var(--font-m);cursor:pointer;transition:all .2s';
      btn.onmouseenter=function(){btn.style.color='var(--text)';btn.style.borderColor='var(--accent)'};
      btn.onmouseleave=function(){btn.style.color='var(--muted)';btn.style.borderColor='var(--border2)'};
      btn.onclick=function(e){e.preventDefault();e.stopPropagation();var bid=_getId();if(bid){var url='https://dacewav.store/#/beat/'+bid;if(navigator.clipboard)navigator.clipboard.writeText(url).catch(function(){});showToast('¡Link copiado!')}};
      mb.appendChild(btn);
    }
  },100)};
  window.closeModal=function(){if(_origClose)_origClose();if(!_guard)_push(null);document.title=_origTitle};
  function _safeOpen(id){_guard=true;try{window.openModal(id)}finally{_guard=false}}
  function _safeClose(){_guard=true;try{if(_origClose)_origClose();document.title=_origTitle}finally{_guard=false}}
  window.addEventListener('popstate',function(){var id=_getId();if(id)_safeOpen(id);else _safeClose()});
  function _tryHash(){var id=_getId();if(!id)return;if(typeof allBeats!=='undefined'&&allBeats&&allBeats.length>0)_safeOpen(id);else setTimeout(_tryHash,300)}
  setTimeout(_tryHash,500);
})();
