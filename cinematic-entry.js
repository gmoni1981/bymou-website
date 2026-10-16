/* The film is always paused. Scroll is the only clock inside this experience. */
const section=document.querySelector('#signature');
const canvas=document.querySelector('#signature-canvas');
const cover=document.querySelector('#hero-composition');
const anchor=document.querySelector('#portal-anchor');
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const compact=matchMedia('(max-width:700px)');
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n)};
const phase=(a,b,p)=>ease((p-a)/(b-a));
const paused=()=>reduced.matches||root.classList.contains('motion-paused');
let engine,initializing=false,failed=false;
function fallback(reason='still'){
 root.classList.remove('entry-capable');
 if(!section)return;
 section.dataset.entryState=reason;
 cover.style.opacity='';cover.style.transform='';cover.inert=false;
 section.style.setProperty('--entry-exit','0');section.style.setProperty('--entry-dark','0');
 document.dispatchEvent(new CustomEvent('bymou:entryprogress',{detail:0}));
}
async function reconcile(){
 if(!section||!canvas||!anchor)return;
 if(paused()){engine?.stop();fallback();return}
 if(failed)return;
 if(engine){engine.start();return}
 if(initializing)return;
 if(!window.gsap||!window.ScrollTrigger){if(document.readyState==='complete'){failed=true;fallback('fallback')}return}
 initializing=true;
 try{
  const T=await Promise.race([import('./assets/vendor/three/three.module.min.js'),new Promise((_,r)=>setTimeout(()=>r(Error('Entry library timeout')),10000))]);
  engine=await createEntry(T);
  if(paused()){engine.stop();fallback()}else engine.start();
 }catch(error){failed=true;fallback('fallback');console.warn('BYMOU: static cover and original-film link remain available.',error.message)}
 finally{initializing=false}
}
async function createEntry(T){
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:!compact.matches,powerPreference:'default'});
 renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(48,1,.025,60),group=new T.Group();scene.add(group);
 let poster;
 try{poster=await Promise.race([new T.TextureLoader().loadAsync('/assets/works/mounia-opening.webp'),new Promise((_,r)=>setTimeout(()=>r(Error('Opening frame timeout')),10000))])}catch(e){renderer.dispose();throw e}
 poster.colorSpace=T.SRGBColorSpace;
 const geometry=new T.PlaneGeometry(1,1),material=new T.MeshBasicMaterial({map:poster,toneMapped:false,transparent:true});
 const screen=new T.Mesh(geometry,material);group.add(screen);
 const edgeGeometry=new T.BoxGeometry(1,1,.022),edgeMaterial=new T.MeshBasicMaterial({color:'#24241f',transparent:true});
 const edge=new T.Mesh(edgeGeometry,edgeMaterial);edge.position.z=-.014;group.add(edge);
 const video=document.createElement('video');
 video.className='scrub-media';video.dataset.scrubVideo='';video.muted=true;video.playsInline=true;video.preload='auto';video.loop=false;video.setAttribute('aria-hidden','true');video.tabIndex=-1;video.disablePictureInPicture=true;
 section.append(video);
 const movieTexture=new T.VideoTexture(video);movieTexture.colorSpace=T.SRGBColorSpace;
 const state={p:0};let active=false,alive=true,visible=true,renderRaf=0,seekRaf=0,busy=false,ready=false,metadata=false,requested=false,duration=0,target=0,lastSeek=0,x=0,y=0,arrival=1;
 let allowVideo=!navigator.connection?.saveData;
 const loadButton=section.querySelector('[data-load-scrub]');
 const timeLabel=section.querySelector('[data-film-time]');
 const totalLabel=section.querySelector('[data-film-duration]');
 const progress=section.querySelector('#signature-progress');
 const removers=[];
 const listen=(el,name,fn,options)=>{el?.addEventListener(name,fn,options);removers.push(()=>el?.removeEventListener(name,fn,options))};
 const timecode=t=>`${t.toFixed(2).padStart(5,'0')}s`;
 function requestRender(){if(renderRaf||!alive||!active||!visible||document.hidden)return;renderRaf=requestAnimationFrame(()=>{renderRaf=0;if(active&&visible&&!paused())renderer.render(scene,camera)})}
 function scheduleSeek(){if(!seekRaf&&active&&visible&&!document.hidden)seekRaf=requestAnimationFrame(flushSeek)}
 function flushSeek(now){
  seekRaf=0;
  if(!alive||!active||!visible||document.hidden||paused()||!metadata||busy||video.seeking)return;
  const wanted=Math.min(Math.max(0,duration-.001),target);
  if(Math.abs(video.currentTime-wanted)<.008)return;
  if(now-lastSeek<(compact.matches?33:20)){scheduleSeek();return}
  busy=true;lastSeek=now;
  try{video.currentTime=wanted}catch(_){busy=false}
 }
 function loadFilm(){
  if(requested||!allowVideo)return;
  requested=true;video.src='/assets/works/mounia-scroll.mp4';video.load();
 }
 function sync(){
  if(!alive||!active||paused())return;
  const p=state.p,approach=phase(.015,.34,p),alignment=phase(.17,.34,p);
  camera.position.set(x*approach,y*approach,12+(arrival-12)*approach);
  camera.lookAt(camera.position.x,camera.position.y,camera.position.z-20);
  group.position.set(x,y,0);group.rotation.set(.025*(1-alignment),-.09*(1-alignment),-.10*(1-alignment));
  // A linear time map is deliberate: reversing the scroll reverses the film.
  const filmProgress=clamp((p-.40)/.44);
  target=duration*filmProgress;
  const finalFrame=ready&&metadata&&video.currentTime>=duration-.025;
  const exit=phase(.91,.995,p)*(finalFrame||!allowVideo?1:0);
  material.opacity=1-exit;edgeMaterial.opacity=1-exit;
  cover.style.opacity=String(1-phase(.10,.34,p));cover.inert=p>.34;
  section.style.setProperty('--entry-exit',String(exit));
  section.style.setProperty('--entry-dark',String(phase(.21,.38,p)*(1-exit)));
  section.dataset.entryWorld=p<.34?'approach':p<.40?'entry':p<.84?'scrub':p<.91?'hold':'reveal';
  if(progress)progress.style.transform=`scaleX(${p})`;
  canvas.dataset.progress=p.toFixed(5);canvas.dataset.cameraZ=camera.position.z.toFixed(4);
  canvas.dataset.targetTime=target.toFixed(5);canvas.dataset.videoTime=video.currentTime.toFixed(5);canvas.dataset.duration=duration.toFixed(5);
  canvas.dataset.videoPaused=String(video.paused);canvas.dataset.endFrame=String(finalFrame);canvas.dataset.ready=String(ready);
  if(timeLabel)timeLabel.textContent=timecode(video.currentTime);
  if(totalLabel)totalLabel.textContent=timecode(duration);
  if(loadButton)loadButton.hidden=allowVideo||p<.34||p>.91;
  section.querySelector('.film-scrub-hint')?.toggleAttribute('hidden',p<.34||p>.91);
  document.dispatchEvent(new CustomEvent('bymou:entryprogress',{detail:p}));
  scheduleSeek();requestRender();
 }
 listen(video,'loadedmetadata',()=>{duration=video.duration;metadata=Number.isFinite(duration)&&duration>0;sync()});
 listen(video,'loadeddata',()=>{if(!video.seeking)busy=false;ready=true;material.map=movieTexture;material.needsUpdate=true;sync()});
 listen(video,'seeking',()=>{busy=true});
 listen(video,'seeked',()=>{busy=false;ready=true;material.map=movieTexture;material.needsUpdate=true;movieTexture.needsUpdate=true;sync()});
 listen(video,'error',()=>{failed=true;cleanup();engine=null;fallback('film-unavailable');ScrollTrigger.refresh()});
 listen(video,'play',()=>video.pause()); // Defensive only; this module never calls play().
 listen(loadButton,'click',()=>{allowVideo=true;loadFilm();sync()});
 function resize(){
  const r=canvas.getBoundingClientRect(),a=anchor.getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);
  renderer.setPixelRatio(Math.min(devicePixelRatio,compact.matches?1:1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const unit=24*Math.tan(camera.fov*Math.PI/360)/h,sw=a.width*unit,sh=a.height*unit;
  x=(a.left+a.width/2-r.left-w/2)*unit;y=-(a.top+a.height/2-r.top-h/2)*unit;
  screen.scale.set(sw,sh,1);edge.scale.set(sw+.022,sh+.022,1);
  const fit=compact.matches?Math.max:Math.min;
  arrival=fit(sh/(2*Math.tan(camera.fov*Math.PI/360)),sw/(2*Math.tan(camera.fov*Math.PI/360)*camera.aspect))*.985;
  sync();
 }
 gsap.registerPlugin(ScrollTrigger);
 const timeline=gsap.timeline({scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:.28,invalidateOnRefresh:true},onUpdate:sync});
 timeline.to(state,{p:1,duration:1,ease:'none'});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){loadFilm();sync()}else{cancelAnimationFrame(renderRaf);cancelAnimationFrame(seekRaf);renderRaf=seekRaf=0}},{threshold:.01});observer.observe(section.querySelector('.signature-stage'));
 listen(window,'resize',()=>{resize();ScrollTrigger.refresh()});
 listen(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(renderRaf);cancelAnimationFrame(seekRaf);renderRaf=seekRaf=0}else sync()});
 listen(canvas,'webglcontextlost',e=>{e.preventDefault();failed=true;cleanup();engine=null;fallback('fallback');ScrollTrigger.refresh()});
 function cleanup(){
  if(!alive)return;alive=false;active=false;cancelAnimationFrame(renderRaf);cancelAnimationFrame(seekRaf);observer.disconnect();removers.forEach(fn=>fn());timeline.scrollTrigger.kill();timeline.kill();video.removeAttribute('src');video.load();video.remove();geometry.dispose();edgeGeometry.dispose();material.dispose();edgeMaterial.dispose();poster.dispose();movieTexture.dispose();renderer.dispose();
 }
 listen(window,'pagehide',e=>{if(!e.persisted)cleanup()});
 resize();
 return{
  start(){if(active)return;active=true;root.classList.add('entry-capable');section.dataset.entryState='ready';timeline.scrollTrigger.enable();resize();ScrollTrigger.refresh();loadFilm();sync()},
  stop(){active=false;cancelAnimationFrame(renderRaf);cancelAnimationFrame(seekRaf);renderRaf=seekRaf=0;timeline.scrollTrigger.disable(false);fallback();ScrollTrigger.refresh()}
 };
}
if(section){if(!paused())root.classList.add('entry-capable');else fallback();document.addEventListener('bymou:motionchange',reconcile);reduced.addEventListener('change',reconcile);window.addEventListener('load',reconcile,{once:true});reconcile()}
