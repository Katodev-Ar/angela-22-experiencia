(()=>{'use strict';
const stage=document.getElementById('scene');
const closeCard=document.getElementById('closeCard');
const cakeHotspot=document.getElementById('cakeHotspot');
const musicButton=document.getElementById('musicButton');
const birthdayMusic=document.getElementById('birthdayMusic');
const musicVolume=document.getElementById('musicVolume');
const rotateOverlay=document.getElementById('rotateOverlay');
const page=document.getElementById('page');
function isPhoneDevice(){
 const ua=navigator.userAgent||'';
 return navigator.userAgentData?.mobile===true||/Mobi|iPhone|iPod|Windows Phone/i.test(ua)||(/Android/i.test(ua)&&/Mobile/i.test(ua))||(window.matchMedia('(pointer:coarse)').matches&&Math.min(window.innerWidth,window.innerHeight)<600);
}
function needsLandscape(){return isPhoneDevice()&&window.innerHeight>window.innerWidth;}
document.body.classList.toggle('phone-device',isPhoneDevice());
function isCompactDisplay(){return window.matchMedia('(max-width:700px), (pointer:coarse)').matches||navigator.connection?.saveData===true;}
birthdayMusic.loop=true;
birthdayMusic.preload='none';
function setMusicVolume(){const value=Number(musicVolume.value);birthdayMusic.volume=value;musicVolume.setAttribute('aria-valuetext',`${Math.round(value*100)}%`);}
musicVolume.addEventListener('input',setMusicVolume);
setMusicVolume();
function positionCloseCard(){const r=stage.getBoundingClientRect();closeCard.style.left=(r.left+r.width*.78)+'px';closeCard.style.top=(r.top+r.height*.115)+'px';}
window.addEventListener('resize',positionCloseCard,{passive:true});
if(window.visualViewport)window.visualViewport.addEventListener('resize',positionCloseCard,{passive:true});
positionCloseCard();
const ambientCanvas=document.getElementById('ambientParticles');
const ambientCtx=ambientCanvas.getContext('2d');
let ambientParticles=[],shootingStars=[],ambientW=0,ambientH=0,ambientDpr=1,ambientLast=performance.now(),shootTimer=0;
const ambientColors=['#ffb6e8','#ffe2a0','#bca7ff','#9ceaff','#f7e9ff','#f58fce'];
function randomAmbientParticle(initial=false){
 const roll=Math.random();
 return {x:Math.random()*Math.max(1,ambientW),y:initial?Math.random()*Math.max(1,ambientH):ambientH+12,
  r:roll<.68?.55+Math.random()*1.25:roll<.91?1.1+Math.random()*1.5:1.8+Math.random()*1.2,
  vx:(Math.random()-.5)*5,vy:-3-Math.random()*10,alpha:.18+Math.random()*.48,
  phase:Math.random()*Math.PI*2,twinkle:.6+Math.random()*2.2,color:ambientColors[Math.floor(Math.random()*ambientColors.length)],
  kind:roll<.62?'dust':roll<.82?'spark':roll<.94?'pixel':'flare',depth:.3+Math.random()*.9};
}
function resizeAmbient(){
 const compact=isCompactDisplay();
 ambientW=window.innerWidth;ambientH=window.innerHeight;ambientDpr=Math.min(window.devicePixelRatio||1,compact?1.5:2);
 ambientCanvas.width=Math.max(1,Math.round(ambientW*ambientDpr));ambientCanvas.height=Math.max(1,Math.round(ambientH*ambientDpr));
 ambientCanvas.style.width=ambientW+'px';ambientCanvas.style.height=ambientH+'px';
 ambientCtx.setTransform(ambientDpr,0,0,ambientDpr,0,0);
 const count=Math.max(compact?34:65,Math.min(compact?105:230,Math.round(ambientW*ambientH/(compact?14000:8500))));
 ambientParticles=Array.from({length:count},()=>randomAmbientParticle(true));
}
function drawAmbientParticle(p,t){
 const tw=.48+.52*(.5+.5*Math.sin(t*.001*p.twinkle+p.phase));
 const a=p.alpha*tw;
 ambientCtx.save();ambientCtx.globalAlpha=a;ambientCtx.fillStyle=p.color;ambientCtx.shadowColor=p.color;
 if(p.kind==='dust'){
  ambientCtx.shadowBlur=5+p.r*3;ambientCtx.beginPath();ambientCtx.arc(p.x,p.y,p.r,0,Math.PI*2);ambientCtx.fill();
 }else if(p.kind==='pixel'){
  ambientCtx.translate(p.x,p.y);ambientCtx.rotate(Math.sin(t*.0004+p.phase)*.5);ambientCtx.shadowBlur=8;
  ambientCtx.fillRect(-p.r,-p.r,p.r*2,p.r*2);
 }else if(p.kind==='spark'){
  ambientCtx.translate(p.x,p.y);ambientCtx.rotate(p.phase+t*.00015);ambientCtx.shadowBlur=12;
  ambientCtx.beginPath();ambientCtx.moveTo(0,-p.r*2.8);ambientCtx.lineTo(p.r*.38,-p.r*.38);ambientCtx.lineTo(p.r*2.8,0);ambientCtx.lineTo(p.r*.38,p.r*.38);ambientCtx.lineTo(0,p.r*2.8);ambientCtx.lineTo(-p.r*.38,p.r*.38);ambientCtx.lineTo(-p.r*2.8,0);ambientCtx.lineTo(-p.r*.38,-p.r*.38);ambientCtx.closePath();ambientCtx.fill();
 }else{
  const radius=p.r*7;const g=ambientCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);
  g.addColorStop(0,p.color+'bb');g.addColorStop(.23,p.color+'60');g.addColorStop(1,p.color+'00');ambientCtx.fillStyle=g;ambientCtx.shadowBlur=0;ambientCtx.beginPath();ambientCtx.arc(p.x,p.y,radius,0,Math.PI*2);ambientCtx.fill();
 }
 ambientCtx.restore();
}
function ambientFrame(t){
 const dt=Math.min(.05,Math.max(0,(t-ambientLast)/1000));ambientLast=t;
 ambientCtx.clearRect(0,0,ambientW,ambientH);
 for(let i=0;i<ambientParticles.length;i++){
  const p=ambientParticles[i];p.x+=p.vx*dt*p.depth;p.y+=p.vy*dt*p.depth;
  p.x+=Math.sin(t*.00025+p.phase)*dt*2;
  if(p.y<-16||p.x<-20||p.x>ambientW+20)ambientParticles[i]=randomAmbientParticle(false);
  else drawAmbientParticle(p,t);
 }
 shootTimer-=dt;
 if(shootTimer<=0&&ambientW>360&&ambientH>240&&Math.random()<.7){
  const side=Math.random()<.5;const x=side?Math.random()*ambientW:Math.random()*ambientW*.18;
  shootingStars.push({x,y:Math.random()*ambientH*.86,vx:85+Math.random()*100,vy:30+Math.random()*45,life:0,max:.42+Math.random()*.42,color:ambientColors[Math.floor(Math.random()*ambientColors.length)]});
  shootTimer=2.5+Math.random()*4.5;
 }
 shootingStars=shootingStars.filter(s=>s.life<s.max);
 for(const s of shootingStars){
  s.life+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;const a=Math.sin(Math.PI*s.life/s.max);
  ambientCtx.save();ambientCtx.globalAlpha*a*.72;ambientCtx.strokeStyle=s.color;ambientCtx.lineWidth=1.2;ambientCtx.shadowColor=s.color;ambientCtx.shadowBlur=9;
  ambientCtx.beginPath();ambientCtx.moveTo(s.x-s.vx*.12,s.y-s.vy*.12);ambientCtx.lineTo(s.x,s.y);ambientCtx.stroke();ambientCtx.restore();
 }
 requestAnimationFrame(ambientFrame);
}
resizeAmbient();requestAnimationFrame(ambientFrame);
window.addEventListener('resize',resizeAmbient,{passive:true});
window.addEventListener('orientationchange',()=>requestAnimationFrame(resizeAmbient),{passive:true});

// Una estela delicada sigue tanto el puntero de PC como los movimientos táctiles del celular.
const cursorCanvas=document.getElementById('cursorParticles');
const cursorCtx=cursorCanvas.getContext('2d');
let cursorW=0,cursorH=0,cursorDpr=1,cursorTrail=[],cursorLastFrame=performance.now(),cursorLastSpawn=0,cursorLastX=null,cursorLastY=null;
const trailColors=['#ff9ddd','#ffe4a0','#cfb8ff','#a2ecff','#fff1fa'];
function resizeCursorCanvas(){
 cursorW=window.innerWidth;cursorH=window.innerHeight;cursorDpr=Math.min(window.devicePixelRatio||1,isCompactDisplay()?1.5:2);
 cursorCanvas.width=Math.max(1,Math.round(cursorW*cursorDpr));cursorCanvas.height=Math.max(1,Math.round(cursorH*cursorDpr));
 cursorCanvas.style.width=cursorW+'px';cursorCanvas.style.height=cursorH+'px';cursorCtx.setTransform(cursorDpr,0,0,cursorDpr,0,0);
}
function emitCursorTrail(x,y,count=2,burst=false){
 for(let i=0;i<count;i++){
  const color=trailColors[Math.floor(Math.random()*trailColors.length)];
  const kind=Math.random()<(burst?.24:.16)?'spark':Math.random()<(burst?.30:.15)?'heart':'dust';
  const life=burst?.65+Math.random()*.6:.35+Math.random()*.45;
  const angle=Math.random()*Math.PI*2,speed=burst?18+Math.random()*62:5+Math.random()*24;
  cursorTrail.push({x:x+(Math.random()-.5)*5,y:y+(Math.random()-.5)*5,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-(burst?8:4),life,max:life,size:burst?2.2+Math.random()*3.4:1.1+Math.random()*2.2,color,kind,spin:(Math.random()-.5)*4,phase:Math.random()*Math.PI*2});
 }
 if(cursorTrail.length>190)cursorTrail.splice(0,cursorTrail.length-190);
}
function drawCursorShape(p,t){
 const a=Math.max(0,Math.min(1,p.life/p.max));cursorCtx.save();cursorCtx.globalAlpha=a*(p.kind==='dust'?.72:.88);cursorCtx.translate(p.x,p.y);cursorCtx.rotate(p.phase+t*.00025*p.spin);cursorCtx.fillStyle=p.color;cursorCtx.strokeStyle=p.color;cursorCtx.shadowColor=p.color;cursorCtx.shadowBlur=p.kind==='dust'?7:11;
 if(p.kind==='spark'){
  cursorCtx.lineWidth=Math.max(0.7,p.size*.34);cursorCtx.beginPath();cursorCtx.moveTo(-p.size*1.7,0);cursorCtx.lineTo(p.size*1.7,0);cursorCtx.moveTo(0,-p.size*1.7);cursorCtx.lineTo(0,p.size*1.7);cursorCtx.stroke();
 }else if(p.kind==='heart'){
  const z=p.size*.48;cursorCtx.beginPath();cursorCtx.moveTo(0,z*1.65);cursorCtx.bezierCurveTo(-z*2.1,z*.25,-z*1.8,-z*1.15,-z*.8,-z*1.15);cursorCtx.bezierCurveTo(-z*.25,-z*1.15,0,-z*.65,0,-z*.35);cursorCtx.bezierCurveTo(z,-z*1.55,z*2.1,-z*1.0,z*1.8,0);cursorCtx.bezierCurveTo(z*1.5,z*.72,z*.55,z*1.3,0,z*1.65);cursorCtx.fill();
 }else{cursorCtx.beginPath();cursorCtx.arc(0,0,p.size,0,Math.PI*2);cursorCtx.fill();}
 cursorCtx.restore();
}
let cursorAnimationRunning=false;
function animateCursorTrail(t){
 cursorAnimationRunning=false;
 const dt=Math.min(.04,Math.max(0,(t-cursorLastFrame)/1000));cursorLastFrame=t;cursorCtx.clearRect(0,0,cursorW,cursorH);
 cursorTrail=cursorTrail.filter(p=>p.life>0);
 for(const p of cursorTrail){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.965,dt*60);p.vy*=Math.pow(.975,dt*60);drawCursorShape(p,t);}
 if(cursorTrail.length){cursorAnimationRunning=true;requestAnimationFrame(animateCursorTrail);}
}
function wakeCursorTrail(){if(!cursorAnimationRunning){cursorAnimationRunning=true;requestAnimationFrame(animateCursorTrail);}}
resizeCursorCanvas();
window.addEventListener('resize',resizeCursorCanvas,{passive:true});
window.addEventListener('orientationchange',()=>requestAnimationFrame(resizeCursorCanvas),{passive:true});
window.addEventListener('pointermove',e=>{
 const now=performance.now(),x=e.clientX,y=e.clientY;
 const dx=cursorLastX===null?0:x-cursorLastX,dy=cursorLastY===null?0:y-cursorLastY,distance=Math.hypot(dx,dy);
 cursorLastX=x;cursorLastY=y;
 if(now-cursorLastSpawn<14&&distance<8)return;
 cursorLastSpawn=now;
 const count=e.pointerType==='mouse'?Math.max(1,Math.min(4,Math.ceil(distance/13))):2;
 emitCursorTrail(x,y,count,false);
 wakeCursorTrail();
 },{passive:true});
window.addEventListener('pointerdown',e=>{emitCursorTrail(e.clientX,e.clientY,10,true);wakeCursorTrail();},{passive:true});

const base=document.getElementById('landscape');
base.loop=true;
const action=document.getElementById('kittyScene');
action.loop=false;
const rewindScene=document.getElementById('rewindScene');
let rotationBlocked=false;
function syncPhoneOrientation(){
 const blocked=needsLandscape();
 rotateOverlay.classList.toggle('show',blocked);
 rotateOverlay.setAttribute('aria-hidden',String(!blocked));
 rotateOverlay.inert=!blocked;
 page.inert=blocked;
 closeCard.inert=blocked;
 if(blocked===rotationBlocked)return;
 rotationBlocked=blocked;
 if(blocked){base.pause();action.pause();rewindScene.pause();return;}
 if(actionActive){action.play().catch(()=>{});}
 else if(rewindScene.classList.contains('active')){rewindScene.play().catch(()=>{});}
 else if(!actionStarted){base.play().catch(()=>{});}
}
syncPhoneOrientation();
window.addEventListener('resize',syncPhoneOrientation,{passive:true});
window.addEventListener('orientationchange',()=>requestAnimationFrame(syncPhoneOrientation),{passive:true});
const fireCanvas=document.getElementById('fireCanvas');
const fireCtx=fireCanvas.getContext('2d');
const particleCanvas=document.getElementById('particles');
const pctx=particleCanvas.getContext('2d');
const ending=document.getElementById('ending');
const cardSignature=document.getElementById('cardSignature');

const candleData=[{x:346,baseY:466},{x:390,baseY:454},{x:425,baseY:443},{x:461,baseY:453},{x:497,baseY:440}];
const candles=candleData.map((c,i)=>({x:c.x,baseY:c.baseY,active:true,phase:i*1.29,smokeAt:0}));
let particles=[],birthdayMusicStarted=false,musicPausedByChoice=false,actionStarted=false,actionActive=false,actionFinished=false,catExtinguished=false,interactionCount=0,cardConfettiActive=false,confettiSpawnAccumulator=0;
function fitCanvases(){for(const c of [fireCanvas,particleCanvas]){const dpr=Math.min(window.devicePixelRatio||1,isCompactDisplay()?1.5:2);c.width=Math.max(1,Math.round(stage.clientWidth*dpr));c.height=Math.max(1,Math.round(stage.clientHeight*dpr));c.style.width='100%';c.style.height='100%';}}
fitCanvases();window.addEventListener('resize',fitCanvases,{passive:true});
function syncMusicButton(playing){
 musicButton.classList.toggle('music-playing',playing);
 musicButton.setAttribute('aria-pressed',String(playing));
 musicButton.setAttribute('aria-label',playing?'Pausar música':'Activar música');
 musicButton.title=playing?'Pausar música':'Activar música';
}
function beginMusic(force=false){
 if(musicPausedByChoice&&!force)return;
 birthdayMusic.loop=true;
 if(birthdayMusicStarted&&!birthdayMusic.paused)return;
 if(birthdayMusicStarted&&birthdayMusic.paused)birthdayMusicStarted=false;
 try{
  // Calling play() synchronously from pointerdown preserves the user's activation on mobile Chrome.
  const promise=birthdayMusic.play();
  if(promise&&typeof promise.then==='function'){
   promise.then(()=>{birthdayMusicStarted=true;syncMusicButton(true);})
    .catch(()=>{birthdayMusicStarted=false;syncMusicButton(false);});
  }else{birthdayMusicStarted=true;syncMusicButton(true);}
 }catch(e){birthdayMusicStarted=false;syncMusicButton(false);}
}
musicButton.addEventListener('click',e=>{
 e.preventDefault();e.stopPropagation();
 if(!birthdayMusic.paused){birthdayMusic.pause();birthdayMusicStarted=false;musicPausedByChoice=true;syncMusicButton(false);return;}
 musicPausedByChoice=false;
 if(birthdayMusic.ended){birthdayMusicStarted=false;try{birthdayMusic.currentTime=0;}catch(e){}}
 beginMusic(true);
});
 birthdayMusic.addEventListener('error',()=>{birthdayMusicStarted=false;syncMusicButton(false);});
 birthdayMusic.addEventListener('play',()=>syncMusicButton(true));
 birthdayMusic.addEventListener('pause',()=>{if(!birthdayMusic.ended)syncMusicButton(false);});
 birthdayMusic.addEventListener('ended',()=>{if(birthdayMusic.loop){birthdayMusic.currentTime=0;birthdayMusic.play().catch(()=>{birthdayMusicStarted=false;syncMusicButton(false);});}});
function drawPixelFlame(c,t){
 const ctx=fireCtx,cell=4.2,baseY=c.baseY;
 const flick=Math.sin(t*.014+c.phase),wiggle=Math.round(Math.sin(t*.008+c.phase)*2);
 const rows=[[-2,-1,0,1,2],[-2,-1,0,1],[ -1,0,1],[-1,0],[0,1],[0],[0]];
 const topColors=['#ff7d36','#ffc344','#fff0a1','#ffd34c','#ff8a35'];
 ctx.save();ctx.shadowColor='#ffb84d';ctx.shadowBlur=12+Math.sin(t*.02+c.phase)*3;
 for(let r=0;r<rows.length;r++){
  const yy=baseY-(r+1)*cell+(flick>0?1:0);const offsets=rows[r];
  offsets.forEach((o,j)=>{
   const xx=c.x+o*cell+wiggle*(r<3?1:.5);
   let color=(j===Math.floor(offsets.length/2)&&r>0)?'#fff4b0':topColors[(j+r+Math.floor(t*.008+c.phase))%topColors.length];
   if(r===0)color=(j===2?'#ffd65b':'#ff8235');
   ctx.fillStyle=color;ctx.fillRect(Math.round(xx),Math.round(yy),cell+0.6,cell+0.6);
  });
 }
 // Small golden pixel sparks dance at the wick.
 ctx.shadowBlur=0;ctx.fillStyle='#ffec96';ctx.fillRect(Math.round(c.x-1+wiggle),baseY-5,3,3);
 ctx.restore();
}
function drawSmoke(c,t){
 const ctx=fireCtx,cell=4.5, x=c.x, y=c.baseY-43;
 // Opaque blocky smoke stays over the original video flame, so an extinguished candle truly looks out.
 const shape=[ [2], [1,2,3], [0,1,2,3,4], [0,1,2,3,4,5], [0,1,2,3,4,5], [1,2,3,4,5], [1,2,3,4], [2,3,4], [2,3] ];
 const shades=['#34253f','#4b344e','#684b68','#8d6b87','#b38da8'];
 for(let r=0;r<shape.length;r++){
  shape[r].forEach((col,j)=>{const jitter=Math.sin(t*.004+r*1.3+col)*.45;ctx.globalAlpha=.97;ctx.fillStyle=shades[(r+col+j)%shades.length];ctx.fillRect(Math.round(x+(col-2.5)*cell),Math.round(y+r*cell+jitter),cell+.4,cell+.4);});
 }
 ctx.globalAlpha=1;
 // lingering soot pixels
 if(c.smokeAt&&t-c.smokeAt<1050){for(let i=0;i<4;i++){const f=(t-c.smokeAt)/1050;ctx.globalAlpha=1-f;ctx.fillStyle=shades[i%shades.length];ctx.fillRect(Math.round(x+(i-1.5)*7),Math.round(y-5-f*11-i*2),4,4);}}
 ctx.globalAlpha=1;
}
function spawnBurst(x,y,count=22,kind='gold'){for(let i=0;i<count;i++){const ang=Math.random()*Math.PI*2,spd=20+Math.random()*90;const life=.7+Math.random()*.75;particles.push({x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-15,life,max:life,size:3+Math.floor(Math.random()*5),kind,gravity:kind==='smoke'?-7:55});}}
function spawnBirthdayFinale(){
 const bursts=[{x:390,y:430},{x:515,y:365},{x:655,y:420},{x:785,y:340}];
 for(const b of bursts){
  for(let i=0;i<27;i++){
   const ang=Math.random()*Math.PI*2,spd=48+Math.random()*145,heart=Math.random()<.48,life=1.25+Math.random()*1.25;
   particles.push({x:b.x,y:b.y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-48,life,max:life,size:heart?26+Math.random()*20:7+Math.random()*8,kind:heart?'heart':(Math.random()<.55?'sparkle':'gold'),gravity:heart?22:34});
  }
 }
}
function spawnCardConfetti(dt){
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 confettiSpawnAccumulator+=dt*(reducedMotion?5:18);
 while(confettiSpawnAccumulator>=1){
  confettiSpawnAccumulator-=1;
  const side=Math.random()<.78,left=Math.random()<.5;
  const x=side?(left?Math.random()*250:1030+Math.random()*250):250+Math.random()*780;
  const size=side?6+Math.floor(Math.random()*5):4+Math.floor(Math.random()*4),life=8+Math.random()*3;
  particles.push({x,y:-8-Math.random()*32,vx:(Math.random()-.5)*22,vy:48+Math.random()*74,life,max:life,size,kind:'confetti',gravity:4+Math.random()*6,rotation:Math.random()*Math.PI,rotationSpeed:(Math.random()-.5)*2.4,color:Math.floor(Math.random()*4)});
 }
}
function drawPixelHeart(ctx,x,y,size){
 const unit=Math.max(1,Math.round(size/4));
 const rows=[[1,0,1],[1,1,1],[1,1,1],[0,1,0]];
 for(let ry=0;ry<rows.length;ry++)for(let rx=0;rx<rows[ry].length;rx++)if(rows[ry][rx])ctx.fillRect(Math.round(x+(rx-1.5)*unit),Math.round(y+(ry-1.5)*unit),unit,unit);
}
function extinguish(index,by='angela'){const c=candles[index];if(!c||!c.active)return false;c.active=false;c.smokeAt=performance.now();spawnBurst(c.x,c.baseY-25,by==='kitty'?34:25,by==='kitty'?'pink':'gold');
 if(candles.every(n=>!n.active)){spawnBirthdayFinale();setTimeout(spawnBirthdayFinale,420);setTimeout(()=>ending.classList.add('show'),650);}
 return true;}
function renderFlames(t){fireCtx.setTransform(fireCanvas.width/1280,0,0,fireCanvas.height/720,0,0);fireCtx.clearRect(0,0,1280,720);fireCtx.imageSmoothingEnabled=false;
 if(!actionActive){candles.forEach(c=>c.active?drawPixelFlame(c,t):drawSmoke(c,t));}}
function renderParticles(t,dt){pctx.setTransform(particleCanvas.width/1280,0,0,particleCanvas.height/720,0,0);pctx.clearRect(0,0,1280,720);pctx.imageSmoothingEnabled=false;
  const step=Math.min(dt,.04);particles=particles.filter(p=>p.life>0);
  for(const p of particles){
   p.life-=step;p.x+=p.vx*step;p.y+=p.vy*step;p.vy+=p.gravity*step;p.vx*=Math.pow(.985,step*60);
   pctx.globalAlpha=Math.max(0,Math.min(1,p.life/p.max));
   pctx.fillStyle=p.kind==='pink'?['#ff8bd8','#ffd5f0','#ffc55c','#cf9cff'][Math.floor(p.life*13+p.size)%4]:p.kind==='smoke'?['#8c718f','#a88da8','#d4b7cc'][Math.floor(p.life*7+p.size)%3]:p.kind==='confetti'?['#ffd16d','#ff91d7','#b99cff','#99eaff'][p.color]:['#ffd16d','#fff2b2','#ff91d7','#b99cff'][Math.floor(p.life*12+p.size)%4];
   if(p.kind==='confetti')p.rotation+=p.rotationSpeed*step;
   if(p.kind==='heart')drawPixelHeart(pctx,p.x,p.y,p.size);
   else if(p.kind==='sparkle'){pctx.save();pctx.translate(p.x,p.y);pctx.rotate((1-p.life/p.max)*Math.PI);pctx.shadowColor=pctx.fillStyle;pctx.shadowBlur=9;pctx.fillRect(-.7,p.size*-1.3,1.4,p.size*2.6);pctx.fillRect(-p.size*1.3,-.7,p.size*2.6,1.4);pctx.restore();}
   else if(p.kind==='confetti'){pctx.save();pctx.translate(Math.round(p.x),Math.round(p.y));pctx.rotate(p.rotation);pctx.fillRect(-Math.ceil(p.size/2),-Math.ceil(p.size/2),p.size,Math.max(4,p.size*1.7));pctx.restore();}
   else pctx.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size);
  }
  pctx.globalAlpha=1;
 }
let last=performance.now();function animate(t){const dt=(t-last)/1000;last=t;renderFlames(t);if(cardConfettiActive)spawnCardConfetti(dt);renderParticles(t,dt);requestAnimationFrame(animate)}requestAnimationFrame(animate);
let returningToOpening=false;
function ensureVideoReady(video,timeoutMs=15000){
 if(video.readyState>=1)return Promise.resolve();
 if(!video.getAttribute('src')){
  const source=video.dataset.src;
  if(!source)return Promise.reject(new Error('No se encontró el archivo de video.'));
  video.src=source;
 }
 video.preload='auto';
 return new Promise((resolve,reject)=>{
  let settled=false;
  const finish=(error)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   video.removeEventListener('loadedmetadata',onReady);video.removeEventListener('error',onError);
   error?reject(error):resolve();
  };
  const onReady=()=>finish();
  const onError=()=>finish(new Error('No se pudo cargar el video.'));
  const timer=setTimeout(()=>finish(new Error('El video tardó demasiado en cargar.')),timeoutMs);
  video.addEventListener('loadedmetadata',onReady,{once:true});
  video.addEventListener('error',onError,{once:true});
  video.load();
  if(video.readyState>=1)finish();
 });
}
function launchCakeSequence(fromCake=false){
 if(needsLandscape()||actionStarted||actionActive||returningToOpening)return;
 if(fromCake)requestCakeFullscreen();
 beginMusic();
 startCatAction();
}
function resetToOpening(){
 returningToOpening=false;
 cardConfettiActive=false;confettiSpawnAccumulator=0;particles=[];cardSignature.classList.remove('show');
 rewindScene.classList.remove('active');
 action.classList.remove('active');
 stage.classList.remove('showing-card','action-playing');
 fireCanvas.style.opacity='1';
 closeCard.classList.remove('show');
 try{action.pause();action.currentTime=0;}catch(e){}
 try{rewindScene.pause();rewindScene.currentTime=0;}catch(e){}
 actionStarted=false;actionActive=false;actionFinished=false;catExtinguished=false;
 candles.forEach(c=>{c.active=true;c.smokeAt=0;});
 ending.classList.remove('show');
 base.loop=true;base.currentTime=0;
 if(!needsLandscape())base.play().catch(()=>{});
}
async function reverseBackToOpening(){
 if(returningToOpening||!actionStarted)return;
 returningToOpening=true;
 cardConfettiActive=false;cardSignature.classList.remove('show');particles=particles.filter(p=>p.kind!=='confetti');
 closeCard.classList.remove('show');
 actionActive=false;action.pause();
 try{action.currentTime=Math.min(action.duration||29.8,29.8);}catch(e){}
 try{
  await ensureVideoReady(rewindScene);
  rewindScene.currentTime=0;
  rewindScene.classList.add('active');
  // El clip recorre el video 2 en reversa del segundo 30 al 10, a velocidad x3.5.
  rewindScene.playbackRate=3.5;
  await rewindScene.play();
 }catch(e){
  // Si el navegador no puede cargar o reproducir el segmento, volvemos al bucle inicial.
  resetToOpening();
 }
}
rewindScene.addEventListener('ended',resetToOpening);
closeCard.addEventListener('click',reverseBackToOpening);
let fullscreenRequestPending=false;
function requestCakeFullscreen(){
 if(document.fullscreenElement||fullscreenRequestPending||!document.documentElement.requestFullscreen)return;
 fullscreenRequestPending=true;
 try{
  const request=document.documentElement.requestFullscreen({navigationUI:'hide'});
  if(request&&typeof request.catch==='function')request.catch(()=>{fullscreenRequestPending=false;});
  else fullscreenRequestPending=false;
 }catch(e){fullscreenRequestPending=false;}
}
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)fullscreenRequestPending=false;});
cakeHotspot.addEventListener('click',()=>launchCakeSequence(true));
async function startCatAction(){
 if(actionStarted||actionFinished)return;
 actionStarted=true;actionActive=true;fireCanvas.style.opacity='0';
 cardConfettiActive=false;cardSignature.classList.remove('show');
 try{
  await ensureVideoReady(action);
  if(needsLandscape()){actionActive=false;actionStarted=false;fireCanvas.style.opacity='1';return;}
  action.pause();
  try{action.currentTime=0;}catch(e){}
  action.playbackRate=1.15;
  base.pause();
  rewindScene.classList.remove('active');
  stage.classList.add('action-playing');
  closeCard.classList.remove('show');
  // Keep the smaller Angela visible during the opening of the scene; she will
  // fade out when the letter itself starts appearing in the second video.
  stage.classList.remove('showing-card');
  action.classList.add('active');
  await action.play();
 }catch(e){actionActive=false;action.classList.remove('active');fireCanvas.style.opacity='1';return;}
}
action.addEventListener('timeupdate',()=>{
 if(!actionActive)return;
 const t=action.currentTime;
 action.playbackRate=(t>=15&&t<19)?2:1.15;
 if(t>=20){positionCloseCard();closeCard.classList.add('show');}
 // The white letter starts appearing at about 12 seconds in the supplied clip.
 // Hide the overlay one second later, when the letter is further into its appearance, so nothing covers the message.
 if(t>=12.5&&!stage.classList.contains('showing-card'))stage.classList.add('showing-card');
 if(!catExtinguished&&t>=6.85){catExtinguished=true;extinguish(4,'kitty');/* El gatito ayuda con la última velita: estallido de corazones pixelados. */spawnBirthdayFinale();setTimeout(spawnBirthdayFinale,420);}
});
function endCatAction(){
 // Keep the final frame visible and paused; do not reset time or hide the clip.
 actionActive=false;actionFinished=true;action.pause();action.playbackRate=1.15;positionCloseCard();closeCard.classList.add('show');cardConfettiActive=true;cardSignature.classList.add('show');
 if(!catExtinguished){catExtinguished=true;extinguish(4,'kitty');}
}
action.addEventListener('ended',endCatAction);
// El video 2 no se inicia solo: únicamente empieza al tocar la torta.
document.querySelectorAll('.candle-hotspot').forEach(hit=>{hit.addEventListener('click',launchCakeSequence);hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();launchCakeSequence();}});});
// Start the opening loop only after confirming portrait mode on phones.
if(!needsLandscape())base.play().catch(()=>{});
})();
