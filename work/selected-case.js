const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let lenis;
if(!reduced.matches&&window.Lenis&&window.gsap){lenis=new Lenis({autoRaf:false,duration:1.1});gsap.ticker.add(t=>lenis.raf(t*1000));}
const select=document.querySelector('#case-language');
const copy={en:{project:'Project',close:'Close ↗',work:'Selected work',sequence:'In sequence',next:'Next project',back:'All selected work',contact:'Start a conversation ↗'},fr:{project:'Projet',close:'Fermer ↗',work:'Projets choisis',sequence:'En séquence',next:'Projet suivant',back:'Tous les projets',contact:'Parlons-en ↗'},it:{project:'Progetto',close:'Chiudi ↗',work:'Lavori scelti',sequence:'In sequenza',next:'Prossimo progetto',back:'Tutti i progetti',contact:'Parliamone ↗'}};
const language=['en','fr','it','ar'].includes(location.pathname.split('/')[1])?location.pathname.split('/')[1]:'en';
if(select){select.value=language;select.addEventListener('change',()=>{const path=location.pathname.replace(/^\/(en|fr|it|ar)(?=\/|$)/,'');location.href='/'+select.value+path+location.search+location.hash})}
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.case-lightbox[open]'))location.href='/'+language+'/#work'});
if(window.gsap&&!reduced.matches){gsap.from('.case-heading',{y:26,opacity:0,duration:1,ease:'power2.out',clearProps:'all'});}
reduced.addEventListener('change',()=>{if(reduced.matches)lenis?.destroy()});

// Interactive Fullscreen Lightbox for Case Images
const caseImages=[...document.querySelectorAll('.case-gallery figure img, .case-cover-image')];
if(caseImages.length){
  const lb=document.createElement('dialog');
  lb.className='case-lightbox';
  lb.innerHTML='<div class="case-lb-bar"><span class="case-lb-index"></span><span class="case-lb-title"></span><button type="button" class="case-lb-close" aria-label="Close fullscreen">×</button></div><div class="case-lb-stage"><button type="button" class="case-lb-prev" aria-label="Previous image">‹</button><div class="case-lb-wrap"><img class="case-lb-img" src="" alt=""></div><button type="button" class="case-lb-next" aria-label="Next image">›</button></div>';
  document.body.append(lb);
  let cur=0;
  const lbImg=lb.querySelector('.case-lb-img'),lbIdx=lb.querySelector('.case-lb-index'),lbTitle=lb.querySelector('.case-lb-title'),lbClose=lb.querySelector('.case-lb-close'),lbPrev=lb.querySelector('.case-lb-prev'),lbNext=lb.querySelector('.case-lb-next');
  function show(i){cur=(i+caseImages.length)%caseImages.length;const target=caseImages[cur];lbImg.src=target.currentSrc||target.src;lbImg.alt=target.alt||'';lbIdx.textContent=`${String(cur+1).padStart(2,'0')} / ${String(caseImages.length).padStart(2,'0')}`;lbTitle.textContent=target.alt||'';if(!lb.open)lb.showModal();lbClose.focus({preventScroll:true});}
  caseImages.forEach((img,idx)=>{img.style.cursor='zoom-in';img.addEventListener('click',()=>show(idx));});
  lbClose.onclick=()=>lb.close();
  lbPrev.onclick=()=>show(cur-1);
  lbNext.onclick=()=>show(cur+1);
  lb.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(cur+1);}else if(e.key==='ArrowLeft'){e.preventDefault();show(cur-1);}});
}
