/* BYMOU: progressive interactions. Native scroll, keyboard and static media remain available. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
let lenis=null,raf=null,context=null;
const paused=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
function motion(){
 context?.revert();context=null;
 if(lenis){lenis.destroy();lenis=null;window.gsap?.ticker.remove(raf)}
 if(paused()||!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 if(window.Lenis&&fine.matches){lenis=new Lenis({duration:1.05,smoothWheel:true,syncTouch:false,anchors:{offset:-90},prevent:n=>!!n.closest('dialog,.uf-track,textarea')});lenis.on('scroll',ScrollTrigger.update);raf=t=>lenis.raf(t*1000);gsap.ticker.add(raf);gsap.ticker.lagSmoothing(0)}
 context=gsap.context(()=>{
  document.querySelectorAll('.work-intro h2,.case-story h2,.about-manifesto').forEach(el=>gsap.from(el,{y:35,opacity:.25,duration:1,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',end:'top 62%',scrub:.45}}));
  document.querySelectorAll('.feature-visual').forEach(el=>gsap.from(el,{clipPath:'inset(8% 0 0 0)',ease:'none',scrollTrigger:{trigger:el,start:'top 95%',end:'top 35%',scrub:.4}}));
 });
}
motion();document.addEventListener('bymou:motionchange',motion);reduced.addEventListener('change',motion);document.addEventListener('bymou:languagechange',()=>requestAnimationFrame(()=>window.ScrollTrigger?.refresh()));document.fonts.ready.then(()=>window.ScrollTrigger?.refresh());
// Each slide has an exact snap point, accessible buttons and native touch swiping.
document.querySelectorAll('[data-carousel]').forEach(carousel=>{
 const track=carousel.querySelector('[data-track]'),slides=[...track.children],prev=carousel.querySelector('[data-prev]'),next=carousel.querySelector('[data-next]'),counter=carousel.querySelector('[data-counter]'),meter=carousel.querySelector('.uf-meter i');let frame=0;
 const index=()=>slides.reduce((best,s,i)=>Math.abs(s.offsetLeft-slides[0].offsetLeft-track.scrollLeft)<Math.abs(slides[best].offsetLeft-slides[0].offsetLeft-track.scrollLeft)?i:best,0);
 function update(){frame=0;const i=index();prev.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-3;counter.value=String(i+1).padStart(2,'0')+' / 05';meter.style.transform=`translateX(${Math.min(4,i)*100}%)`}
 function move(d){const i=Math.max(0,Math.min(slides.length-1,index()+d));track.scrollTo({left:slides[i].offsetLeft-slides[0].offsetLeft,behavior:paused()?'instant':'smooth'})}
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update)},{passive:true});track.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});window.addEventListener('resize',update);update();
});
// A real editable vector identity: gestures update paths, and exports contain those same paths.
const tool=document.querySelector('[data-open-tool]');if(tool){
 const svg=tool.querySelector('svg'),cut=tool.querySelector('[data-edit-path]'),guide=tool.querySelector('[data-edit-guide]');
 const presets=['M-50 640 C220 160 700 820 1050 210','M-50 800 L1050 150','M-30 300 Q170 100 350 450 T710 460 T1050 560'];let points=[],drawing=false;
 const status=document.createElement('span');status.className='sr-only';status.setAttribute('role','status');tool.append(status);
 function path(d){cut.setAttribute('d',d);guide.setAttribute('d',d)}
 document.querySelectorAll('[data-open-preset]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.openPreset==='0'));b.addEventListener('click',()=>{path(presets[+b.dataset.openPreset]);document.querySelectorAll('[data-open-preset]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))})});
 function point(e){const r=svg.getBoundingClientRect();return [Math.round((e.clientX-r.left)/r.width*1000),Math.round((e.clientY-r.top)/r.height*900)]}
 tool.addEventListener('pointerdown',e=>{if(e.button!==0)return;drawing=true;points=[point(e)];tool.dataset.drawing='true';tool.setPointerCapture(e.pointerId);document.querySelectorAll('[data-open-preset]').forEach(x=>x.setAttribute('aria-pressed','false'))});
 tool.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e),last=points[points.length-1];if(Math.hypot(p[0]-last[0],p[1]-last[1])<5)return;points.push(p);if(points.length>600)points=points.filter((_,i)=>i%2===0);path('M'+points.map(p=>p.join(' ')).join(' L'))});
 function finish(){drawing=false;delete tool.dataset.drawing}tool.addEventListener('pointerup',finish);tool.addEventListener('pointercancel',finish);
 document.querySelector('[data-open-download]')?.addEventListener('click',()=>{const copy=svg.cloneNode(true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width','1000');copy.setAttribute('height','900');const blob=new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='OPEN-END-your-edition.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent=document.documentElement.lang==='fr'?'Votre édition a été téléchargée.':document.documentElement.lang==='it'?'La tua edizione è stata scaricata.':'Your edition has been downloaded.'});
}
})();
