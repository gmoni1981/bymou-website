/* Whole cover layers move. The authentic portrait and face are never warped. */
(()=>{
 const cover=document.querySelector('#hero-composition');if(!cover)return;
 const name=cover.querySelector('.cover-name'),portrait=cover.querySelector('.cover-figure');
 const signature=cover.querySelector('.cover-signature'),letters=[...cover.querySelectorAll('.signature-letter')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),compact=matchMedia('(max-width:700px)');
 const state={name:0,portrait:0,px:0,py:0,p:0};let intro,raf=0;
 const isPaused=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
 const phase=(a,b,p)=>{const t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t)};
 function paint(){
  raf=0;if(isPaused())return;
  const nameExit=phase(.025,.25,state.p),signatureExit=phase(.035,.19,state.p);
  name.style.opacity=String(state.name*(1-nameExit));
  const clip=(1-state.name)*100+nameExit*45;
  name.style.clipPath=clip>.05?`inset(0 0 ${Math.min(100,clip)}% 0)`:'none';
  name.style.transform=`translate3d(${state.px*10}px,${(1-state.name)*42-nameExit*(compact.matches?75:135)+state.py*6}px,0) scale(${1+nameExit*.025})`;
  portrait.style.opacity=String(state.portrait);
  portrait.style.transform=`translate3d(${-state.px*4}px,${(1-state.portrait)*14-state.p*16-state.py*3}px,0) scale(${1+(1-state.portrait)*.009})`;
  if(signature){signature.style.opacity=String(1-signatureExit);signature.style.setProperty('--signature-y',`${-signatureExit*14}px`)}
 }
 function queue(){if(!raf)raf=requestAnimationFrame(paint)}
 function staticCover(){
  intro?.kill();cancelAnimationFrame(raf);raf=0;
  [name,portrait].forEach(el=>['opacity','clip-path','transform'].forEach(p=>el.style.removeProperty(p)));
  signature?.style.removeProperty('opacity');signature?.style.removeProperty('--signature-y');
  letters.forEach(el=>['stroke-dasharray','stroke-dashoffset','fill-opacity'].forEach(p=>el.style.removeProperty(p)));
 }
 function start(){
  if(isPaused()||!window.gsap){staticCover();return}
  state.name=state.portrait=0;state.px=state.py=0;paint();
  intro=gsap.timeline({onUpdate:queue});
  intro.to(state,{name:1,duration:1.2,ease:'power3.out'},.1).to(state,{portrait:1,duration:1.15,ease:'power2.out'},.22);
  letters.forEach(el=>{const n=el.getTotalLength();el.style.strokeDasharray=n;el.style.strokeDashoffset=n;el.style.fillOpacity=0});
  intro.to(letters,{strokeDashoffset:0,duration:.7,stagger:.055,ease:'power1.inOut'},.75).to(letters,{fillOpacity:1,duration:.45,stagger:.045},1.1);
 }
 cover.addEventListener('pointermove',e=>{
  if(isPaused()||!window.gsap||!fine.matches||state.p>.34)return;
  const r=cover.getBoundingClientRect();gsap.to(state,{px:(e.clientX-r.left)/r.width*2-1,py:(e.clientY-r.top)/r.height*2-1,duration:.75,ease:'power2.out',overwrite:'auto',onUpdate:queue});
 });
 cover.addEventListener('pointerleave',()=>{if(!window.gsap)return;gsap.to(state,{px:0,py:0,duration:.8,overwrite:'auto',onUpdate:queue})});
 document.addEventListener('bymou:entryprogress',e=>{state.p=e.detail;queue()});
 document.addEventListener('bymou:motionchange',()=>{if(isPaused())staticCover();else{state.name=state.portrait=1;paint()}});
 reduced.addEventListener('change',()=>{if(isPaused())staticCover();else start()});
 start();
})();
