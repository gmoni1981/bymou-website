/* DEEP CUT: native touch scrolling, progressive enhancement, no autoplay. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 document.querySelectorAll('[data-deepcut-carousel]').forEach(root=>{
  const track=root.querySelector('[data-campaign-track]'),slides=[...track.querySelectorAll('.campaign-slide')];
  const prev=root.querySelector('[data-campaign-prev]'),next=root.querySelector('[data-campaign-next]'),status=root.querySelector('[data-campaign-status]'),progress=root.querySelector('[data-campaign-progress]');
  let index=0,raf=0;
  const staticMotion=()=>reduced.matches||document.documentElement.classList.contains('motion-paused');
  function measure(){
   raf=0;const mid=track.getBoundingClientRect().left+track.clientWidth/2;
   index=slides.reduce((best,slide,i)=>Math.abs(slide.getBoundingClientRect().left+slide.clientWidth/2-mid)<Math.abs(slides[best].getBoundingClientRect().left+slides[best].clientWidth/2-mid)?i:best,0);
   slides.forEach((s,i)=>{s.dataset.active=String(i===index)});
   if(prev)prev.disabled=index===0;if(next)next.disabled=index===slides.length-1;
   if(status)status.textContent=String(index+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
   if(progress)progress.style.transform='scaleX('+((index+1)/slides.length)+')';
   root.dataset.activeSlide=String(index+1);
  }
  function queue(){if(!raf)raf=requestAnimationFrame(measure)}
  function move(direction){
   const target=slides[Math.max(0,Math.min(slides.length-1,index+direction))],tr=track.getBoundingClientRect(),r=target.getBoundingClientRect();
   track.scrollTo({left:track.scrollLeft+r.left-tr.left-(track.clientWidth-target.clientWidth)/2,behavior:staticMotion()?'instant':'smooth'});
  }
  prev?.addEventListener('click',()=>move(-1));next?.addEventListener('click',()=>move(1));
  track.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||e.target.closest('button,input,textarea'))return;e.preventDefault();if(e.key==='Home')track.scrollTo({left:0,behavior:staticMotion()?'instant':'smooth'});else if(e.key==='End')track.scrollTo({left:track.scrollWidth,behavior:staticMotion()?'instant':'smooth'});else move(e.key==='ArrowRight'?1:-1)});
  track.addEventListener('scroll',queue,{passive:true});new ResizeObserver(queue).observe(track);
  root.querySelectorAll('.campaign-slide img').forEach(img=>img.addEventListener('load',queue,{once:true}));measure();
 });
})();
