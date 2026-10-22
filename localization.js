/* URL is the language authority. Preferences never force a redirect. */
(() => {
 'use strict';
 const languages=['en','fr','it','ar'];
 const language=languages.includes(location.pathname.split('/')[1])?location.pathname.split('/')[1]:'en';
 const path=location.pathname.replace(/^\/(en|fr|it|ar)(?=\/|$)/,'').replace(/^\/index\.html$/,'/')||'/';
 let dictionary={};
 const translate=text=>dictionary[text]||text;
 function localize(root=document.body){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('script,style,svg,textarea,[contenteditable]')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  for(let n; n=walker.nextNode();){const key=n.textContent.trim();if(dictionary[key]&&dictionary[key]!==key)n.textContent=n.textContent.replace(key,dictionary[key]);}
  root.querySelectorAll?.('a[href]').forEach(a=>{const href=a.getAttribute('href');if(/^\/(?:work\/|tools\/|insights\/|[^/#]+\.html(?:[?#]|$))/.test(href)&&!/^\/(en|fr|it|ar)\//.test(href))a.setAttribute('href','/'+language+href);else if(/^\/(?:#|$)/.test(href))a.setAttribute('href','/'+language+href)});
  root.querySelectorAll?.('[aria-label],[alt],[placeholder]').forEach(el=>['aria-label','alt','placeholder'].forEach(a=>{const v=el.getAttribute(a);if(dictionary[v]&&v!==dictionary[v])el.setAttribute(a,dictionary[v]);}));
 }
 function navigate(lang){if(languages.includes(lang))location.assign('/'+lang+path+location.search+location.hash);}
 window.ByMouLocale={language,translate,localize,navigate};
 document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
 document.querySelectorAll('#language,#case-language').forEach(select=>{if(!select.querySelector('[value="ar"]'))select.add(new Option('العربية','ar'));select.value=language;select.addEventListener('change',e=>{e.stopImmediatePropagation();navigate(select.value)},true)});
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();navigate(button.dataset.lang)},true));
 if(!document.querySelector('#language,#case-language,[data-lang]')){const nav=document.createElement('nav');nav.className='locale-switch';nav.setAttribute('aria-label',language==='ar'?'اللغة':'Language');languages.forEach(l=>{const a=document.createElement('a');a.href='/'+l+path+location.search+location.hash;a.hreflang=l;a.textContent=l==='ar'?'العربية':l.toUpperCase();if(l===language)a.setAttribute('aria-current','page');nav.append(a)});document.body.append(nav)}
 fetch('/data/locale-runtime-'+language+'.json').then(r=>{if(!r.ok)throw Error('Locale unavailable');return r.json()}).then(data=>{dictionary=data;localize();let pending=false;new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;localize()})}}).observe(document.body,{subtree:true,childList:true,characterData:true});document.dispatchEvent(new CustomEvent('bymou:localeready',{detail:{language}}));}).catch(()=>{});
})();
