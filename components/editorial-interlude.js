const copy={en:{label:'Between the idea & the image',line1:'A different',line2:'way of seeing',note:'An instinct becomes an idea.\nAn idea finds its form.\nThe work begins there.',role:'Mou Grasso / Creative direction',link:'Enter selected work'},fr:{label:'Entre l’idée et l’image',line1:'Une autre',line2:'façon de voir',note:'Un instinct devient une idée.\nUne idée prend forme.\nLe travail commence ici.',role:'Mou Grasso / Direction créative',link:'Découvrir les projets'},it:{label:'Tra l’idea e l’immagine',line1:'Un altro',line2:'modo di vedere',note:'Un istinto diventa un’idea.\nUn’idea prende forma.\nIl lavoro comincia qui.',role:'Mou Grasso / Direzione creativa',link:'Esplora i progetti'}};
export function initInterlude(){
 const root=document.querySelector('#perspective');if(!root)return;
 function translate(language){const words=copy[language]||copy.en;root.querySelectorAll('[data-interlude]').forEach(n=>n.textContent=words[n.dataset.interlude]);window.ScrollTrigger?.refresh()}
 translate(localStorage.getItem('bymou-language')||'en');document.addEventListener('bymou:languagechange',e=>translate(e.detail.language));
 if(!window.gsap||!window.ScrollTrigger)return;gsap.registerPlugin(ScrollTrigger);
 const media=gsap.matchMedia();media.add('(prefers-reduced-motion: no-preference)',()=>{
 const lines=root.querySelectorAll('.interlude-line');
 gsap.fromTo(lines[0],{xPercent:-7},{xPercent:2,ease:'none',scrollTrigger:{trigger:root,start:'top bottom',end:'bottom top',scrub:1}});
 gsap.fromTo(lines[1],{xPercent:5},{xPercent:-3,ease:'none',scrollTrigger:{trigger:root,start:'top bottom',end:'bottom top',scrub:1}});
 gsap.fromTo(root.querySelector('.interlude-cross'),{rotation:-35},{rotation:65,ease:'none',scrollTrigger:{trigger:root,start:'top bottom',end:'bottom top',scrub:1}});
 gsap.fromTo(root.querySelector('.interlude-aperture span'),{clipPath:'polygon(46% 0,54% 0,100% 100%,0 100%)'},{clipPath:'polygon(0% 0,100% 0,100% 100%,0 100%)',ease:'none',scrollTrigger:{trigger:root.querySelector('.interlude-aperture'),start:'top bottom',end:'bottom 45%',scrub:.6}});
 });
}
