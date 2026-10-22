/* BYMOU: one GSAP clock, native touch scrolling and an escapable first-pass film. */
(()=>{
 'use strict';
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const video=$('#signature-film'),film=$('#film'),status=$('[data-film-status]'),playButton=$('[data-film-play]'),tapSound=$('[data-tap-sound]');
 let strings={},lenis=null,ticker=null,context=null,media=null,processTween=null,hasRun=false,locked=false,active=false,firstIntro=true,guard=0,maximum=0,touchStart=0,preference=null,motionReady=false;
 const motionOff=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
 try{preference=sessionStorage.getItem('bymou-sound')}catch(_){}
 const text=(key,fallback)=>strings[key]||fallback;
 function setLabel(el,key,fallback){if(!el)return;el.dataset.i18n=key;el.textContent=text(key,fallback)}
 function announce(key,fallback){setLabel(status,key,fallback)}
 function soundLabels(){const on=video?!video.muted&&preference==='on':false;$$('[data-sound-toggle]').forEach(b=>{b.setAttribute('aria-pressed',String(on));setLabel($('[data-sound-label]',b),on?'a.soundOn':'a.soundOff',on?'Sound on':'Sound off')})}
 function storeSound(value){preference=value;try{sessionStorage.setItem('bymou-sound',value)}catch(_){}if(video)video.muted=value!=='on';soundLabels()}
 function scrollToElement(target,immediate=false){
  if(!target)return;const y=target.getBoundingClientRect().top+scrollY;
  if(lenis)lenis.scrollTo(y,{immediate:immediate||motionOff(),duration:.95,force:true});else window.scrollTo({top:y,behavior:motionOff()||immediate?'instant':'smooth'});
 }
 function clearGuard(){clearTimeout(guard);clearTimeout(maximum);guard=maximum=0}
 function lock(){if(motionOff())return;locked=true;document.documentElement.classList.add('film-locked');lenis?.stop()}
 function unlock(){locked=false;document.documentElement.classList.remove('film-locked');lenis?.start()}
 function finish(reason,advance=false){
  const wasActive=active;active=false;clearGuard();unlock();
  if(video&&reason!=='ended')video.pause();
  if(film)film.dataset.filmState=reason;
  if(playButton){playButton.hidden=false;setLabel(playButton.querySelector('span'),hasRun?'a.replay':'a.play',hasRun?'Replay film':'Play film')}
  if(tapSound)tapSound.hidden=true;
  if(reason==='ended')announce('a.filmDone','Film complete. Continue exploring.');
  if(reason==='error'||reason==='timeout')announce('a.filmError','The film could not play. You can continue scrolling or try Play film.');
  if(advance&&(wasActive||reason==='skipped'))requestAnimationFrame(()=>scrollToElement($('#about')));
 }
 function armGuard(){clearTimeout(guard);if(active)guard=setTimeout(()=>{if(active)finish('error')},2000)}
 async function attemptPlay(){
  try{await video.play();if(active){clearTimeout(guard);announce('a.playing','Playing · You can skip at any time.')}}
  catch(error){
   if(!active)return;
   if(!video.muted&&!video.error){
    video.muted=true;soundLabels();tapSound.hidden=false;
    try{await video.play();if(active){clearTimeout(guard);announce('a.playing','Playing · You can skip at any time.')}}catch(_){armGuard()}
   }else armGuard();
  }
 }
 function startFilm(auto=false){
  if(!video||active||auto&&(hasRun||motionOff()))return;
  hasRun=true;active=true;film.dataset.filmState='starting';playButton.hidden=true;
  video.muted=preference==='off';soundLabels();
  try{video.currentTime=0}catch(_){}
  if(auto)lock();
  armGuard();maximum=setTimeout(()=>{if(active)finish('timeout')},Math.min(30000,(Number.isFinite(video.duration)?video.duration:8)*1000+2500));
  attemptPlay();
 }
 if(video){
  video.muted=preference!=='on';soundLabels();film.dataset.filmState='idle';
  $$('[data-sound-toggle]').forEach(b=>b.addEventListener('click',()=>{storeSound(video.muted?'on':'off');tapSound.hidden=true;if(active&&video.paused)attemptPlay()}));
  $('[data-enter-sound]')?.addEventListener('click',()=>{storeSound('on');scrollToElement(film)});
  tapSound.addEventListener('click',()=>{storeSound('on');tapSound.hidden=true;if(video.paused){active=true;attemptPlay()}});
  playButton.addEventListener('click',()=>startFilm(false));
  $('[data-film-skip]').addEventListener('click',e=>{e.preventDefault();hasRun=true;finish('skipped',true);const next=$('#about');next?.setAttribute('tabindex','-1');next?.focus({preventScroll:true})});
  video.addEventListener('playing',()=>{if(!active)return;clearTimeout(guard);film.dataset.filmState='playing';soundLabels()});
  video.addEventListener('timeupdate',()=>{if(video.currentTime>0&&active&&!video.error&&!video.paused&&video.readyState>=3)clearTimeout(guard);const bar=$('.film-timeline>span');if(bar&&Number.isFinite(video.duration))bar.style.transform=`scaleX(${video.currentTime/video.duration})`});
  video.addEventListener('ended',()=>finish('ended',locked));
  ['error','stalled','waiting'].forEach(name=>video.addEventListener(name,()=>{if(active)armGuard()}));
  video.addEventListener('pause',()=>{if(active&&!video.ended)finish('paused')});
  // A reverse gesture always cancels the lock, even during the first screening.
  window.addEventListener('wheel',e=>{if(!locked||e.ctrlKey)return;if(e.deltaY<0){finish('back');window.scrollBy(0,-90)}else e.preventDefault()},{passive:false});
  window.addEventListener('touchstart',e=>{if(e.touches[0])touchStart=e.touches[0].clientY},{passive:true});
  window.addEventListener('touchmove',e=>{if(!locked)return;if(e.touches[0]&&e.touches[0].clientY-touchStart>12){finish('back');window.scrollBy(0,-90)}else e.preventDefault()},{passive:false});
  window.addEventListener('keydown',e=>{if(!locked)return;if(['Escape','ArrowUp','PageUp','Home'].includes(e.key)){finish('back');if(e.key!=='Escape')window.scrollBy(0,-90)}else if(['ArrowDown','PageDown','End',' '].includes(e.key)&&!e.target.closest('button,a,input,select'))e.preventDefault()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)finish('hidden')});
  window.addEventListener('pagehide',()=>finish('hidden'));
 }else $$('[data-sound-toggle]').forEach(b=>b.hidden=true);
 // Keep native anchors as the fallback; smooth scrolling never replaces the destination.
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||a.hasAttribute('data-film-skip'))return;const id=a.getAttribute('href');if(id==='#')return;const target=$(id);if(!target)return;if(locked)finish('navigation');hasRun=hasRun||!!target.closest('#about,#services,#work,#process,#contact');if(lenis&&!motionOff()){e.preventDefault();history.pushState(null,'',id);scrollToElement(target)}});
 const preview=$('.capability-preview'),previewImage=preview&&$('img',preview);let shown=null;
 function expand(row,open){
  const button=$('.capability-toggle',row),detail=$('.capability-detail',row);if(button.getAttribute('aria-expanded')===String(open))return;
  button.setAttribute('aria-expanded',String(open));
  if(!window.gsap||motionOff()){detail.hidden=!open;detail.style.height='';return}
  gsap.killTweensOf(detail);
  if(open){detail.hidden=false;gsap.fromTo(detail,{height:0,opacity:0},{height:'auto',opacity:1,duration:.4,ease:'power2.out',onComplete:()=>ScrollTrigger.refresh()})}
  else gsap.to(detail,{height:0,opacity:0,duration:.28,ease:'power2.inOut',onComplete:()=>{detail.hidden=true;ScrollTrigger.refresh()}});
 }
 $$('.capability').forEach(row=>{
  const button=$('.capability-toggle',row);
  button.addEventListener('click',()=>expand(row,button.getAttribute('aria-expanded')!=='true'));
  row.addEventListener('pointerenter',()=>{if(!fine.matches||motionOff())return;expand(row,true);if(preview&&window.gsap){previewImage.src=row.dataset.preview;shown=row;gsap.to(preview,{opacity:1,duration:.2})}});
  row.addEventListener('pointerleave',()=>{if(!fine.matches)return;expand(row,false);shown=null;if(preview&&window.gsap)gsap.to(preview,{opacity:0,duration:.2})});
  row.addEventListener('pointermove',e=>{if(!shown||!preview||motionOff())return;gsap.to(preview,{x:Math.min(innerWidth-240,e.clientX+28),y:Math.max(12,Math.min(innerHeight-290,e.clientY-135)),duration:.35,ease:'power3.out',overwrite:'auto'})});
  button.addEventListener('focus',()=>expand(row,true));
  row.addEventListener('focusout',e=>{if(!row.contains(e.relatedTarget))expand(row,false)});
 });
 function setupMotion(){
  if(!window.gsap||!window.ScrollTrigger)return;
  if(active)finish('preference');
  media?.revert();context?.revert();if(ticker)gsap.ticker.remove(ticker);lenis?.destroy();lenis=null;ticker=null;processTween=null;
  const off=motionOff();if(video)video.controls=off;
  if(off){document.documentElement.classList.remove('has-custom-cursor');motionReady=true;return}
  gsap.registerPlugin(ScrollTrigger);
  if(window.Lenis){lenis=new Lenis({autoRaf:false,smoothWheel:true,syncTouch:false,lerp:.1,anchors:false,prevent:node=>!!node.closest('dialog,[data-lenis-prevent]')});lenis.on('scroll',ScrollTrigger.update);ticker=time=>lenis?.raf(time*1000);gsap.ticker.add(ticker);gsap.ticker.lagSmoothing(0)}
  context=gsap.context(()=>{
   if($('#signature')){
    const name=$('.cover-name'),path=$('#signature-outline'),trace=$('.signature-trace');const length=path.getTotalLength();gsap.set(trace,{strokeDasharray:length,strokeDashoffset:length});
    const journey=gsap.timeline({scrollTrigger:{id:'bymou-hero',trigger:'#signature',pin:'.signature-stage',start:'top top',end:()=>'+='+innerHeight*3,scrub:true,anticipatePin:1,invalidateOnRefresh:true,onToggle:s=>name.style.willChange=s.isActive?'transform':''}});
    journey.to(name,{scale:1.13,xPercent:-1.5,yPercent:-12,duration:1,ease:'none'},0).to(trace,{strokeDashoffset:0,duration:.56,ease:'none'},.16).to('.hero-progress>span',{scaleX:1,duration:1,ease:'none'},0);
    if(firstIntro&&scrollY<100){gsap.from('.name-letter',{yPercent:115,duration:1.2,stagger:.065,ease:'power3.out',onStart:()=>gsap.set('.name-letter',{willChange:'transform'}),onComplete:()=>gsap.set('.name-letter',{clearProps:'willChange'})});gsap.from('.cover-top,.cover-statement,.cover-screen',{opacity:0,y:12,duration:1,stagger:.1,delay:.35,ease:'power2.out'})}
    firstIntro=false;
   }
   if(film)ScrollTrigger.create({id:'bymou-film',trigger:film,pin:'.film-stage',start:'top top',end:()=>'+='+innerHeight*.65,anticipatePin:1,invalidateOnRefresh:true,onEnter:self=>{if(self.direction===1&&!hasRun)startFilm(true)}});
   if($('.manifesto-statement'))gsap.from('.reveal-line>*',{yPercent:112,stagger:.12,ease:'none',scrollTrigger:{trigger:'.manifesto-statement',start:'top 85%',end:'bottom 55%',scrub:true,invalidateOnRefresh:true}});
   $$('.case-media').forEach(figure=>{gsap.fromTo(figure,{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',ease:'none',scrollTrigger:{trigger:figure.closest('.case-card'),start:'top 85%',end:'top 12%',scrub:true}});gsap.fromTo($('img',figure),{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:figure.closest('.case-card'),start:'top bottom',end:'bottom top',scrub:true}})});
   media=gsap.matchMedia();media.add('(min-width:801px)',()=>{const track=$('.process-track');if(!track)return;processTween=gsap.to(track,{x:()=>-(track.scrollWidth-innerWidth),ease:'none',scrollTrigger:{id:'bymou-process',trigger:'.process-section',pin:'.process-viewport',start:'top top',end:()=>'+='+(track.scrollWidth-innerWidth),scrub:1,invalidateOnRefresh:true,anticipatePin:1}})});
   const field=$('.fields-track');if(field){const marquee=gsap.to(field,{x:()=>-(field.scrollWidth+55)/2,ease:'none',duration:38,repeat:-1,paused:true});ScrollTrigger.create({trigger:'.fields-section',start:'top bottom',end:'bottom top',onEnter:()=>marquee.play(),onEnterBack:()=>marquee.play(),onLeave:()=>marquee.pause(),onLeaveBack:()=>marquee.pause()})}
   if(firstIntro)firstIntro=false;
   gsap.fromTo('.page-load-line',{width:0,opacity:1},{width:'100%',duration:.8,ease:'power2.out',onComplete:()=>gsap.to('.page-load-line',{opacity:0,duration:.5})});
  });
  motionReady=true;ScrollTrigger.refresh();
 }
 // The preference button is shared with the existing translations/navigation module.
 document.addEventListener('bymou:motionchange',()=>{if(motionReady)setupMotion()});
 document.addEventListener('bymou:languagechange',e=>{strings=e.detail?.strings||strings;soundLabels();requestAnimationFrame(()=>{processTween?.invalidate();window.ScrollTrigger?.refresh();lenis?.resize()})});
 const cursor=$('.custom-cursor');
 if(cursor&&window.gsap){const x=gsap.quickTo(cursor,'x',{duration:.16,ease:'power3.out'}),y=gsap.quickTo(cursor,'y',{duration:.16,ease:'power3.out'});document.addEventListener('pointermove',e=>{if(!fine.matches||motionOff()||e.pointerType==='touch')return;document.documentElement.classList.add('has-custom-cursor');x(e.clientX-4);y(e.clientY-4);gsap.set(cursor,{opacity:.95})});document.addEventListener('pointerover',e=>{if(!fine.matches||motionOff())return;gsap.to(cursor,{scale:e.target.closest('a,button,select')?4:1,opacity:e.target.closest('a,button,select') ? .28 : .95,duration:.25})});document.addEventListener('mouseleave',()=>gsap.set(cursor,{opacity:0}));document.addEventListener('keydown',e=>{if(e.key==='Tab'){document.documentElement.classList.remove('has-custom-cursor');gsap.set(cursor,{opacity:0})}})}
 $$('.magnetic').forEach(button=>{button.addEventListener('pointermove',e=>{if(!window.gsap||!fine.matches||motionOff())return;const r=button.getBoundingClientRect();gsap.to(button,{x:(e.clientX-r.left-r.width/2)*.12,y:(e.clientY-r.top-r.height/2)*.12,duration:.45,ease:'power3.out',overwrite:'auto'})});button.addEventListener('pointerleave',()=>{if(window.gsap)gsap.to(button,{x:0,y:0,duration:.5,ease:'power3.out'})})});
 // Refresh once local fonts settle. No hero geometry depends on a remote font request.
 (document.fonts?.ready||Promise.resolve()).then(setupMotion);
})();
