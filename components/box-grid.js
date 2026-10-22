export function initBoxGrid({viewer,reduced}){
 const area=document.querySelector('.box-grid'),card=document.querySelector('.trail-card'),img=card.querySelector('img');
 const fine=matchMedia('(hover:hover) and (pointer:fine)');let active=null,rect=null,px=0,py=0,tx=0,ty=0,vx=0,visible=false,blocked=false;
 function clear(){if(active){active.style.transform='';active.querySelector('.box-open').style.transform=''}active=null;visible=false;card.classList.remove('is-visible')}
 area.addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches||blocked)return;const box=e.target.closest('.service-box');if(!box)return;if(box!==active){clear();active=box;rect=box.getBoundingClientRect();const source=box.querySelector('img');if(source?.getAttribute('src'))img.src=source.src;px=e.clientX;py=e.clientY}vx=e.clientX-tx;tx=e.clientX;ty=e.clientY;visible=true;card.classList.add('is-visible')});
 area.addEventListener('pointerleave',clear);window.addEventListener('scroll',()=>{if(active)rect=active.getBoundingClientRect()},{passive:true});
 document.addEventListener('bymou:vieweropen',()=>{blocked=true;clear()});document.addEventListener('bymou:viewerclose',()=>{blocked=false});
 function openBox(button){const id=button.dataset.concept;if(!id)return;clear();if(fine.matches&&!reduced.matches){button.classList.add('is-flashing');setTimeout(()=>{button.classList.remove('is-flashing');viewer.open(id,button)},60)}else viewer.open(id,button)}
 area.addEventListener('click',e=>{const box=e.target.closest('.service-box');if(box)openBox(box)});
 fine.addEventListener('change',clear);reduced.addEventListener('change',clear);
 return {tick(){if(!visible||!active||blocked)return;px+=(tx-px)*.14;py+=(ty-py)*.14;vx*=.85;const rot=Math.max(-8,Math.min(8,vx*1.6));card.style.transform=`translate3d(${px}px,${py}px,0) rotate(${rot}deg)`;const x=Math.min(1,Math.max(0,(tx-rect.left)/rect.width)),y=Math.min(1,Math.max(0,(ty-rect.top)/rect.height));active.style.transform=`rotateY(${(x-.5)*6}deg) rotateX(${-(y-.5)*5}deg)`;const control=active.querySelector('.box-open'),r=control.getBoundingClientRect(),dx=tx-r.left-r.width/2,dy=ty-r.top-r.height/2,d=Math.hypot(dx,dy);control.style.transform=d<60?`translate(${Math.max(-4,Math.min(4,dx*.07))}px,${Math.max(-4,Math.min(4,dy*.07))}px)`:'none'},clear};
}
