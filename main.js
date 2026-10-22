import {initWalkthroughShowcase} from './components/walkthrough-showcase.js';
import {initWebsiteShowcase} from './components/website-showcase.js?v=210';
import {initInterlude} from './components/editorial-interlude.js';
import {heroSignaturePaths} from './components/hero-signature.js';
import {initSelectedWork} from './components/selected-work.js?v=80';
const reduced=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
const gsap=window.gsap,ST=window.ScrollTrigger;
const showcase=initSelectedWork({reduced});
initInterlude();
initWebsiteShowcase({reduced});
initWalkthroughShowcase({reduced});
let lenis=null;const createLenis=()=>{lenis?.destroy();lenis=null;if(!reduced.matches&&window.Lenis){lenis=new Lenis({autoRaf:false,anchors:true,smoothWheel:true,duration:1.05,prevent:el=>el.closest?.('dialog,.camera-roll,.fit-preview')});lenis.on('scroll',()=>ST?.update())}};createLenis();
if(location.hash){const hashEl=document.querySelector(location.hash);if(hashEl){const jump=()=>{if(lenis)lenis.scrollTo(hashEl,{immediate:true});else hashEl.scrollIntoView()};setTimeout(jump,150);setTimeout(jump,600)}}
document.addEventListener('bymou:vieweropen',()=>{lenis?.stop();document.documentElement.classList.add('viewer-open')});document.addEventListener('bymou:viewerclose',()=>{document.documentElement.classList.remove('viewer-open');lenis?.start()});
const video=document.querySelector('#hero-film'),screen=document.querySelector('.film-screen'),track=document.querySelector('.first-frame'),stamp=document.querySelector('#film-time');
let desired=0,seeking=false,ready=false,blob=null,lastSeek=-1,lastFlash=-999,lastProgress=0;const fired=new Set();
const filmState={target:0,ready:false,duration:7.041995};window.__bymouFilm=filmState;
function filmError(){if(document.querySelector('.film-error'))return;const p=document.createElement('p');p.className='film-error';p.textContent='The film could not load. The rest of the portfolio is ready below.';document.querySelector('.hero-stage').append(p)}
async function loadFilm(){if(reduced.matches||blob)return;try{const response=await fetch(matchMedia('(max-width:700px)').matches?'/assets/film/bymou-film-mobile.mp4':'/assets/film/bymou-film.mp4');if(!response.ok)throw new Error('Film unavailable');blob=URL.createObjectURL(await response.blob());video.src=blob;video.load()}catch{filmError()}}
video.addEventListener('loadedmetadata',()=>{ready=true;filmState.ready=true;filmState.duration=video.duration;video.pause();desired=Math.min(desired,video.duration-1/24)});
video.addEventListener('loadeddata',()=>{screen.classList.add('is-ready')});video.addEventListener('seeked',()=>{seeking=false;screen.classList.add('is-ready')});video.addEventListener('error',filmError);
function seekFilm(){if(!ready||seeking||reduced.matches||video.readyState<2)return;const t=Math.min(video.duration-1/24,Math.round(desired*24)/24);if(Math.abs(video.currentTime-t)<1/48)return;seeking=true;lastSeek=performance.now();video.currentTime=t;}
function updateFilm(progress){const p=Math.max(0,Math.min(1,(progress-.44)/.56));desired=p*7.0;filmState.target=desired;stamp.textContent=desired.toFixed(2).padStart(5,'0');if(progress>lastProgress){const thresholds=[.46,.66,.85],next=thresholds.find(t=>progress>=t&&!fired.has(t));if(next&&performance.now()-lastFlash>1000){fired.add(next);lastFlash=performance.now();gsap.fromTo('.beat-flash',{opacity:.8},{opacity:0,duration:.06,overwrite:true})}}lastProgress=progress;}
let motionContext;
function setupMotion(){
 motionContext?.revert();
 const tag=document.querySelector('.hero-tag .tag-path');
 tag?.removeAttribute('mask');tag?.ownerSVGElement.querySelector('[data-hero-pen-mask]')?.remove();
 if(!gsap||!ST||reduced.matches){video.pause();return}
 gsap.registerPlugin(ST);
 motionContext=gsap.context(()=>{
  const words=[...document.querySelectorAll('.name-lockup > span')];
  gsap.set(words,{opacity:1,yPercent:0,clipPath:'inset(-60% 100% -60% -2%)'});
  // Write each letter in place, preserving the original font, kerning and layout.
  const entrance=gsap.timeline({delay:.85});
  let letterTime=0;
  words.forEach(word=>{
   const text=word.firstChild,rect=word.getBoundingClientRect();
   for(let i=1;i<=text.textContent.length;i++){
    const range=document.createRange();range.setStart(text,0);range.setEnd(text,i);
    const edge=Math.min(100,Math.max(0,(range.getBoundingClientRect().right-rect.left)/rect.width*100));
    entrance.to(word,{clipPath:`inset(-60% ${i===text.textContent.length?0:100-edge}% -60% -2%)`,duration:.13,ease:'none'},letterTime);
    letterTime+=.17;
    if(i===text.textContent.length)entrance.set(word,{clipPath:'none'},letterTime);
   }
  });
  if(tag){
   gsap.set(tag,{opacity:1,fillOpacity:1,strokeDasharray:'none',strokeDashoffset:0});
   const paths=heroSignaturePaths(tag),lengths=paths.map(p=>p.getTotalLength()),total=lengths.reduce((a,b)=>a+b,0);
   let penTime=.5;
   paths.forEach((path,i)=>{
    gsap.set(path,{strokeDasharray:lengths[i],strokeDashoffset:lengths[i],opacity:0});
    const duration=Math.max(.018,lengths[i]/total*1.9);
    entrance.set(path,{opacity:1},penTime).to(path,{strokeDashoffset:0,duration,ease:duration>.12?'sine.inOut':'none'},penTime);
    penTime+=duration+.007;
   });
  }
  gsap.set('.film-screen',{opacity:0,clipPath:'none',x:-innerWidth*.035,y:-innerHeight*(innerWidth<701?.17:.05),scale:innerWidth<701?.27:.25,rotation:-4,transformOrigin:'100% 100%'});
  const tl=gsap.timeline({scrollTrigger:{id:'hero-film-scroll',trigger:track,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true,onUpdate:s=>updateFilm(s.progress)}});
  // The first fifth of the scroll belongs entirely to the portrait and handwriting.
  tl.to('.name-lockup',{scale:1.1,yPercent:-7,duration:.34},.08).to('.hero-tag',{y:-35,duration:.22},.18);
  tl.to('.film-screen',{opacity:1,duration:.06},.2).to('.film-screen',{x:0,y:0,scale:1,rotation:0,duration:.19,ease:'power1.inOut'},.25);
  tl.to('.portrait-scene',{opacity:0,duration:.12},.35).to('.film-label',{opacity:0,duration:.06},.38).to('.film-footer',{opacity:1,duration:.04},.45).to('.film-copy',{'--film-shade':1,duration:.04},.45);
  [['.beat-one',.46,.6],['.beat-two',.65,.8],['.beat-three',.85,1]].forEach(([s,a,b])=>{tl.fromTo(s,{opacity:0,y:30},{opacity:1,y:0,duration:.04},a);if(b<1)tl.to(s,{opacity:0,y:-15,duration:.035},b)});
  tl.to('.film-progress',{scaleX:1,duration:.56,ease:'none'},.44);
 });loadFilm();
}
setupMotion();reduced.addEventListener('change',()=>{createLenis();setupMotion();ST?.refresh()});
let mx=0,my=0;document.querySelector('.portrait-scene').addEventListener('pointermove',e=>{if(reduced.matches||!fine.matches)return;mx=(e.clientX/innerWidth-.5)*5;my=(e.clientY/innerHeight-.5)*-4});document.querySelector('.portrait-scene').addEventListener('pointerleave',()=>{mx=my=0});let rx=0,ry=0;
const tick=time=>{lenis?.raf(time*1000);showcase.tick(time);seekFilm();if(seeking&&performance.now()-lastSeek>2000)seeking=false;if(!reduced.matches&&fine.matches&&window.scrollY<innerHeight){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;document.querySelector('.mirror-ring').style.transform=`translateX(-50%) perspective(900px) rotateY(${rx}deg) rotateX(${ry}deg)`}};
if(gsap){gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0)}else{const nativeTick=t=>{tick(t/1000);requestAnimationFrame(nativeTick)};requestAnimationFrame(nativeTick)}
document.fonts.ready.then(()=>ST?.refresh());window.addEventListener('pagehide',()=>{if(blob)URL.revokeObjectURL(blob)});
