(() => {
  'use strict';
  const colors={bone:'#F4F4F1',charcoal:'#292929',stone:'#C5C3BC',magenta:'#FF2E88'};
  const labels={bone:'Bone',charcoal:'Charcoal',stone:'Stone',magenta:'Magenta'};
  const value=id=>document.getElementById(id).value;
  const preview=document.querySelector('#outfit-preview');
  const status=document.querySelector('#status');
  function outfit(){return {shirt:value('shirt'),shirtColor:value('shirt-color'),trousers:value('trousers'),trousersColor:value('trousers-color'),shoes:value('shoes'),shoesColor:value('shoes-color')};}
  function shirtShape(kind,color){
    const shape=kind==='shirt'?'M208 304 L252 272 L280 294 L300 277 L346 304 L374 362 L345 377 L334 348 L331 470 L222 470 L218 348 L207 377 L178 362 Z':kind==='overshirt'?'M204 296 L250 270 L280 294 L310 270 L356 296 L386 365 L350 382 L337 346 L337 486 L223 486 L223 346 L210 382 L174 365 Z':'M215 308 L251 282 L280 301 L309 282 L345 308 L373 368 L343 382 L331 348 L331 464 L229 464 L229 348 L217 382 L187 368 Z';
    let details=`<path d="M252 272 L280 301 L309 272" fill="none" stroke="#0B0B0B" stroke-opacity=".3" stroke-width="3"/>`;
    if(kind==='shirt'||kind==='overshirt')details+=`<path d="M280 301 L280 463" fill="none" stroke="#0B0B0B" stroke-opacity=".35" stroke-width="3"/><path d="M253 273 L267 296 L280 301 L293 296 L308 273" fill="${color}" stroke="#0B0B0B" stroke-opacity=".35" stroke-width="2"/>`;
    if(kind==='overshirt')details+=`<path d="M236 345 L264 345 L264 392 L236 392 Z M296 345 L324 345 L324 392 L296 392 Z" fill="none" stroke="#0B0B0B" stroke-opacity=".35" stroke-width="2"/>`;
    return `<path d="${shape}" fill="${color}" stroke="#0B0B0B" stroke-width="3" stroke-linejoin="round"/>${details}`;
  }
  function trousersShape(kind,color){
    const shapes={straight:'M225 464 L335 464 L343 714 L300 714 L280 548 L260 714 L217 714 Z',wide:'M220 464 L340 464 L356 714 L298 714 L280 548 L262 714 L204 714 Z',tapered:'M225 464 L335 464 L322 714 L291 714 L280 548 L269 714 L238 714 Z'};
    return `<path d="${shapes[kind]}" fill="${color}" stroke="#0B0B0B" stroke-width="3" stroke-linejoin="round"/><path d="M225 478 L335 478 M280 481 L280 535" stroke="#0B0B0B" stroke-opacity=".35" stroke-width="3"/>`;
  }
  function shoeShape(kind,color){
    const left=kind==='boot'?'<path d="M224 697 L258 697 L258 741 L279 756 Q284 768 270 770 L201 770 Q195 760 202 751 L221 740 Z"/>':kind==='loafer'?'<path d="M222 710 L255 710 L259 740 L280 755 Q284 767 270 770 L201 770 Q195 760 202 751 L222 740 Z"/>':'<path d="M222 710 L255 710 L259 741 L280 755 Q284 767 270 770 L201 770 Q195 760 202 751 L222 741 Z"/>';
    const right=left.replaceAll('201','321').replaceAll('195','315').replaceAll('202','322').replaceAll('222','342').replaceAll('255','375').replaceAll('259','379').replaceAll('280','400').replaceAll('270','390').replaceAll('284','404');
    const seam=kind==='loafer'?'<path d="M215 754 Q240 739 266 754 M355 754 Q380 739 406 754" fill="none" stroke="#F4F4F1" stroke-opacity=".6" stroke-width="3"/>':'';
    return `<g fill="${color}" stroke="#0B0B0B" stroke-width="3" stroke-linejoin="round">${left}${right}</g>${seam}`;
  }
  function svgMarkup(){
    const o=outfit(),shirt=colors[o.shirtColor],pants=colors[o.trousersColor],shoes=colors[o.shoesColor];
    return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1474" viewBox="0 0 560 860"><rect width="560" height="700" fill="#F4F4F1"/><path d="M22 22H538 M22 850H538" stroke="#0B0B0B" stroke-width="2"/><text x="28" y="57" fill="#FF2E88" font-family="monospace" font-size="12" letter-spacing="2">BYMOU / FIT CHECK</text><text x="28" y="102" fill="#0B0B0B" font-family="serif" font-size="32">Look 01</text><path d="M280 132 V205 M250 196 Q280 185 310 196 L340 228 L325 264 L306 249 L306 278 L254 278 L254 249 L235 264 L220 228 Z" fill="#e2e0da" stroke="#0B0B0B" stroke-width="3" stroke-linejoin="round"/><circle cx="280" cy="166" r="28" fill="#e2e0da" stroke="#0B0B0B" stroke-width="3"/>${shirtShape(o.shirt,shirt)}${trousersShape(o.trousers,pants)}${shoeShape(o.shoes,shoes)}<text x="28" y="797" fill="#0B0B0B" font-family="monospace" font-size="12">${o.shirt.toUpperCase()} / ${labels[o.shirtColor].toUpperCase()}</text><text x="28" y="820" fill="#0B0B0B" font-family="monospace" font-size="12">${o.trousers.toUpperCase()} / ${labels[o.trousersColor].toUpperCase()}</text><text x="28" y="843" fill="#0B0B0B" font-family="monospace" font-size="12">${o.shoes.toUpperCase()} / ${labels[o.shoesColor].toUpperCase()}</text></svg>`;
  }
  function render(){preview.innerHTML=svgMarkup();status.textContent='Outfit updated. Choose Save PNG or Save JSON to keep it.';}
  document.querySelectorAll('select').forEach(el=>el.addEventListener('change',render));
  document.querySelector('#save-json').addEventListener('click',()=>{const payload={tool:'BYMOU Fit Check',status:'Self-initiated concept',mode:'illustrative vector outfit planner',outfit:outfit(),createdAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bymou-fit-check.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);status.textContent='Outfit plan saved as JSON.';});
  document.querySelector('#save-png').addEventListener('click',()=>{const source=new Blob([svgMarkup()],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(source);const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=960;canvas.height=1474;canvas.getContext('2d').drawImage(image,0,0);canvas.toBlob(blob=>{URL.revokeObjectURL(url);if(!blob){status.textContent='PNG export failed.';return;}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bymou-fit-check.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);status.textContent='Outfit illustration saved as PNG.';},'image/png');};image.onerror=()=>{URL.revokeObjectURL(url);status.textContent='Could not export the outfit illustration.';};image.src=url;});
  render();
})();
