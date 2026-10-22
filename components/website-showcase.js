import {websiteVideos} from '../data/websites.js';
const labels={en:['Websites','Selected digital experiences','Three websites. In motion.'],fr:['Sites web','Expériences digitales choisies','Trois sites. En mouvement.'],it:['Siti web','Esperienze digitali selezionate','Tre siti. In movimento.']};
export function initWebsiteShowcase({reduced}){
 const root=document.querySelector('#websites');if(!root)return;
 let language=localStorage.getItem('bymou-language')||'en',modalOpen=false;
 root.innerHTML='<header class="web-compact-heading"><div><p data-web-eyebrow></p><h2 data-web-title></h2></div><span data-web-note></span></header><div class="web-motion-strip" tabindex="0" aria-label="Website video previews"></div>';
 const strip=root.querySelector('.web-motion-strip'),visibility=new Map();
 websiteVideos.forEach((item,i)=>{const figure=document.createElement('figure'),video=document.createElement('video');Object.assign(video,{muted:true,defaultMuted:true,autoplay:true,loop:true,playsInline:true,preload:'none',poster:item.poster,width:item.width,height:item.height});video.dataset.src=item.src;video.setAttribute('muted','');video.setAttribute('autoplay','');video.setAttribute('loop','');video.setAttribute('playsinline','');video.setAttribute('aria-label',item.name+' website recording');const caption=document.createElement('figcaption'),n=document.createElement('span'),name=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');name.textContent=item.name;caption.append(n,name);figure.append(video,caption);strip.append(figure);visibility.set(video,false)});
 const videos=[...strip.querySelectorAll('video')];
 function sync(){videos.forEach(v=>{if(visibility.get(v)&&!document.hidden&&!modalOpen&&!reduced.matches){if(!v.getAttribute('src'))v.src=v.dataset.src;v.play().catch(()=>{})}else v.pause()})}
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>visibility.set(e.target,e.isIntersecting));sync()},{threshold:.35});videos.forEach(v=>observer.observe(v));
 document.addEventListener('visibilitychange',sync);document.addEventListener('bymou:vieweropen',()=>{modalOpen=true;sync()});document.addEventListener('bymou:viewerclose',()=>{modalOpen=false;sync()});reduced.addEventListener('change',sync);
 strip.addEventListener('keydown',e=>{if(e.target!==strip||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();strip.scrollBy({left:strip.clientWidth*.85*(e.key==='ArrowRight'?1:-1),behavior:reduced.matches?'instant':'smooth'})});
 function translate(){const t=labels[language]||labels.en;root.querySelector('[data-web-eyebrow]').textContent=t[0];root.querySelector('[data-web-title]').textContent=t[1];root.querySelector('[data-web-note]').textContent=t[2]}
 document.addEventListener('bymou:languagechange',e=>{language=e.detail.language;translate()});translate();
}
