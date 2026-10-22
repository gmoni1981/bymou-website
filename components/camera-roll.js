export function initCameraRoll(viewer,reduced){
 const roll=document.querySelector('.camera-roll');let start=null,moved=false;
 roll.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0)return;start={x:e.clientX,left:roll.scrollLeft,id:e.pointerId};moved=false;roll.setPointerCapture(e.pointerId)});
 roll.addEventListener('pointermove',e=>{if(!start)return;if(Math.abs(e.clientX-start.x)>6){moved=true;roll.scrollLeft=start.left+start.x-e.clientX}});
 roll.addEventListener('pointerup',e=>{if(!start)return;roll.releasePointerCapture(e.pointerId);start=null;if(!moved){const b=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-concept]');if(b&&roll.contains(b))viewer.open(b.dataset.concept,b)}});
 roll.addEventListener('pointercancel',()=>{start=null});
 roll.addEventListener('click',e=>{if(e.detail!==0&&e.pointerType!=='touch')return;const b=e.target.closest('[data-concept]');if(b)viewer.open(b.dataset.concept,b)});
 const shift=d=>roll.scrollBy({left:d*(roll.querySelector('.roll-frame').offsetWidth+12),behavior:reduced.matches?'auto':'smooth'});
 document.querySelector('[data-roll-prev]').addEventListener('click',()=>shift(-1));document.querySelector('[data-roll-next]').addEventListener('click',()=>shift(1));
 roll.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();shift(e.key==='ArrowRight'?1:-1)}});
}
