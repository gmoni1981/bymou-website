const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let lenis;
if(!reduced.matches&&window.Lenis&&window.gsap){lenis=new Lenis({autoRaf:false,duration:1.1});gsap.ticker.add(t=>lenis.raf(t*1000));}
const select=document.querySelector('#case-language');
const copy={en:{project:'Project',close:'Close ↗',work:'Selected work',sequence:'In sequence',next:'Next project',back:'All selected work',contact:'Start a conversation ↗'},fr:{project:'Projet',close:'Fermer ↗',work:'Projets choisis',sequence:'En séquence',next:'Projet suivant',back:'Tous les projets',contact:'Parlons-en ↗'},it:{project:'Progetto',close:'Chiudi ↗',work:'Lavori scelti',sequence:'In sequenza',next:'Prossimo progetto',back:'Tutti i progetti',contact:'Parliamone ↗'}};
const language=['en','fr','it','ar'].includes(location.pathname.split('/')[1])?location.pathname.split('/')[1]:'en';
if(select){select.value=language;select.addEventListener('change',()=>{const path=location.pathname.replace(/^\/(en|fr|it|ar)(?=\/|$)/,'');location.href='/'+select.value+path+location.search+location.hash})}
window.addEventListener('keydown',e=>{if(e.key==='Escape')location.href='/'+language+'/#work'});
if(window.gsap&&!reduced.matches){gsap.from('.case-heading',{y:26,opacity:0,duration:1,ease:'power2.out',clearProps:'all'});}
reduced.addEventListener('change',()=>{if(reduced.matches)lenis?.destroy()});
