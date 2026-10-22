(() => {
  'use strict';
  const canvas = document.querySelector('#artboard');
  const ctx = canvas.getContext('2d');
  const photoInput = document.querySelector('#photo');
  const brandInput = document.querySelector('#brand');
  const headlineInput = document.querySelector('#headline');
  const status = document.querySelector('#status');
  const sizes = {'4:5':[1080,1350],'1:1':[1080,1080],'9:16':[1080,1920]};
  let image = new Image();
  let sourceName = 'study-04.webp';
  let renderDurationMs = 0;
  let imageReady = false;
  const pngButton = document.querySelector('#download-png');
  const manifestButton = document.querySelector('#download-json');
  const batchButton = document.querySelector('#download-batch');
  const headlineError = document.querySelector('#headline-error');

  function currentFormat(){return document.querySelector('input[name="format"]:checked').value;}
  function wrapLines(text,maxWidth,font){
    ctx.font=font;
    const words=text.trim().split(/\s+/).filter(Boolean); const lines=[]; let line='';
    for(const word of words){
      const candidate=line?`${line} ${word}`:word;
      if(ctx.measureText(candidate).width<=maxWidth){line=candidate;continue;}
      if(line){lines.push(line);line='';}
      if(ctx.measureText(word).width<=maxWidth){line=word;continue;}
      let chunk='';
      for(const character of Array.from(word)){
        if(chunk&&ctx.measureText(chunk+character).width>maxWidth){lines.push(chunk);chunk=character;}else chunk+=character;
      }
      line=chunk;
    }
    if(line)lines.push(line);return lines;
  }
  function render(formatOverride,variantIndex=null,announce=true){
    if(!imageReady)return false;
    const started=performance.now();const format=formatOverride||currentFormat();const [w,h]=sizes[format];canvas.width=w;canvas.height=h;
    ctx.fillStyle='#F4F4F1';ctx.fillRect(0,0,w,h);
    const pad=w*.075;const imageTop=h*.095;const imageH=h*(format==='9:16'?.57:.53);const imageW=w-pad*2;
    const zoom=variantIndex===null?1:1+(variantIndex%4)*.085;const scale=Math.max(imageW/image.width,imageH/image.height)*zoom;const cropW=imageW/scale,cropH=imageH/scale;
    const focusX=variantIndex===null?.5:((variantIndex*7)%10)/9;const focusY=variantIndex===null?.5:((variantIndex*3)%10)/9;
    const sourceX=(image.width-cropW)*focusX;const sourceY=(image.height-cropH)*focusY;
    ctx.save();ctx.beginPath();ctx.rect(pad,imageTop,imageW,imageH);ctx.clip();ctx.drawImage(image,sourceX,sourceY,cropW,cropH,pad,imageTop,imageW,imageH);ctx.restore();
    ctx.fillStyle='#FF2E88';ctx.fillRect(pad,imageTop+imageH+pad*.65,w*.12,Math.max(5,w*.007));
    const headline= headlineInput.value.trim()||'Your campaign headline';
    const footerY=h-pad*.75;
    const textY=imageTop+imageH+pad*1.15;
    const textBottom=footerY-pad*1.15;
    const availableHeight=textBottom-textY;
    const maxFont=format==='9:16'?w*.087:w*.091;
    let fontSize=maxFont;let font=`400 ${fontSize}px 'Bodoni Moda', Georgia, serif`;
    let lines=wrapLines(headline,imageW,font);let lineHeight=fontSize*1.02;
    while(lines.length*lineHeight>availableHeight&&fontSize>30){fontSize-=1;font=`400 ${fontSize}px 'Bodoni Moda', Georgia, serif`;lines=wrapLines(headline,imageW,font);lineHeight=fontSize*1.02;}
    const fits=lines.length*lineHeight<=availableHeight;
    ctx.fillStyle='#0B0B0B';ctx.font=font;ctx.textBaseline='top';
    if(fits)lines.forEach((line,i)=>ctx.fillText(line,pad,textY+i*lineHeight));
    ctx.strokeStyle='#0B0B0B';ctx.lineWidth=Math.max(1,w*.001);ctx.beginPath();ctx.moveTo(pad,footerY-pad*.6);ctx.lineTo(w-pad,footerY-pad*.6);ctx.stroke();
    ctx.fillStyle='#0B0B0B';ctx.textBaseline='alphabetic';ctx.font=`600 ${Math.max(19,w*.023)}px 'JetBrains Mono', Arial, sans-serif`;ctx.fillText((brandInput.value.trim()||'BYMOU').toUpperCase(),pad,footerY);
    ctx.textAlign='right';ctx.fillStyle='#5c5c58';ctx.font=`${Math.max(15,w*.015)}px 'JetBrains Mono', Arial, sans-serif`;ctx.fillText('CREATIVE DIRECTION',w-pad,footerY);ctx.textAlign='left';
    renderDurationMs=Number((performance.now()-started).toFixed(2));
    if(announce)document.querySelector('#size-label').textContent=`${w} × ${h}`;
    if(headlineError){headlineError.textContent=fits?'': 'This headline is too long for the reserved layout area. Shorten it to export.';headlineInput.setAttribute('aria-invalid',String(!fits));}
    pngButton.disabled=manifestButton.disabled=batchButton.disabled=!fits;
    if(announce){status.textContent=fits?`Preview ready · ${format} · last render ${renderDurationMs} ms`:'Headline does not fit. Shorten it before exporting.';status.dataset.error=String(!fits);}
    return fits;
  }
  function loadUrl(url,name){const next=new Image();next.onload=()=>{image=next;sourceName=name;imageReady=true;render();};next.onerror=()=>{status.textContent='Could not load the example image.';status.dataset.error='true';};next.src=url;}
  photoInput.addEventListener('change',()=>{const file=photoInput.files&&photoInput.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){photoInput.value='';status.textContent='Choose a JPG, PNG or WebP image under 15 MB.';status.dataset.error='true';return;}const url=URL.createObjectURL(file);const next=new Image();next.onload=()=>{image=next;sourceName=file.name;imageReady=true;render();URL.revokeObjectURL(url);};next.onerror=()=>{URL.revokeObjectURL(url);status.textContent='This image could not be opened. Try another file.';status.dataset.error='true';};next.src=url;});
  document.querySelectorAll('input[name="format"]').forEach(el=>el.addEventListener('change',render));brandInput.addEventListener('input',render);headlineInput.addEventListener('input',render);
  document.querySelector('#download-png').addEventListener('click',()=>{if(!imageReady)return;render();canvas.toBlob(blob=>{if(!blob){status.textContent='PNG export failed.';status.dataset.error='true';return;}const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${(brandInput.value.trim()||'campaign').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${currentFormat().replace(':','x')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);status.textContent=`PNG exported · ${canvas.width} × ${canvas.height} · render ${renderDurationMs} ms`;},'image/png');});
  document.querySelector('#download-json').addEventListener('click',()=>{render();const manifest={tool:'BYMOU Campaign Desk',toolMode:'local browser composition; no AI generation or server upload',brand:brandInput.value.trim()||'BYMOU',headline:headlineInput.value.trim(),sourceImage:sourceName,format:currentFormat(),width:canvas.width,height:canvas.height,renderDurationMs,exportedAt:new Date().toISOString(),palette:{paper:'#F4F4F1',ink:'#0B0B0B',pink:'#FF2E88'}};const blob=new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='campaign-production-manifest.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);status.textContent=`Production manifest exported · measured render ${renderDurationMs} ms`;});
  function crc32(bytes){
    if(!crc32.table){crc32.table=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);return c>>>0;});}
    let crc=0xffffffff;for(const byte of bytes)crc=crc32.table[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;
  }
  function u16(view,offset,value){view.setUint16(offset,value,true);}function u32(view,offset,value){view.setUint32(offset,value,true);}
  function zipStore(files){
    const encoder=new TextEncoder();const local=[];const central=[];let offset=0;
    for(const file of files){const name=encoder.encode(file.name),data=file.bytes,crc=crc32(data);const head=new Uint8Array(30+name.length);const hv=new DataView(head.buffer);u32(hv,0,0x04034b50);u16(hv,4,20);u16(hv,6,0x0800);u16(hv,8,0);u32(hv,14,crc);u32(hv,18,data.length);u32(hv,22,data.length);u16(hv,26,name.length);head.set(name,30);local.push(head,data);const cent=new Uint8Array(46+name.length);const cv=new DataView(cent.buffer);u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x0800);u16(cv,10,0);u32(cv,16,crc);u32(cv,20,data.length);u32(cv,24,data.length);u16(cv,28,name.length);u32(cv,42,offset);cent.set(name,46);central.push(cent);offset+=head.length+data.length;}
    const centralBytes=central.reduce((n,b)=>n+b.length,0);const end=new Uint8Array(22);const ev=new DataView(end.buffer);u32(ev,0,0x06054b50);u16(ev,8,files.length);u16(ev,10,files.length);u32(ev,12,centralBytes);u32(ev,16,offset);return new Blob([...local,...central,end],{type:'application/zip'});
  }
  const blobBytes=async blob=>new Uint8Array(await blob.arrayBuffer());
  const blobPng=()=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG encoding failed')),'image/png'));
  batchButton.addEventListener('click',async()=>{
    if(!imageReady||batchButton.disabled)return;
    batchButton.disabled=pngButton.disabled=manifestButton.disabled=true;
    const started=performance.now();const files=[];const formats=['4:5','1:1','9:16'];let completionMessage='';
    try{
      for(let i=0;i<100;i++){
        const format=formats[i%formats.length];if(!render(format,i,false))throw new Error('The headline does not fit the export layout.');
        const blob=await blobPng();const name=`campaign-${String(i+1).padStart(3,'0')}-${format.replace(':','x')}-crop-${String((i%10)+1).padStart(2,'0')}.png`;
        files.push({name,bytes:await blobBytes(blob)});
        if((i+1)%5===0){status.textContent=`Rendering ${i+1} of 100 PNG assets`;await new Promise(requestAnimationFrame);}
      }
      const durationMs=Number((performance.now()-started).toFixed(2));
      const manifest={tool:'BYMOU Campaign Desk',mode:'local browser composition; no AI generation or server upload',brand:brandInput.value.trim()||'BYMOU',headline:headlineInput.value.trim(),sourceImage:sourceName,assetCount:files.length,formats:formats.map(format=>({format,width:sizes[format][0],height:sizes[format][1]})),variation:'Each PNG uses a deterministic crop focal point and one of four zoom levels. Output formats cycle through 4:5, 1:1 and 9:16.',assets:files.map(file=>file.name),generationDurationMs:durationMs,createdAt:new Date().toISOString(),palette:{paper:'#F4F4F1',ink:'#0B0B0B',pink:'#FF2E88'}};
      files.push({name:'production-manifest.json',bytes:await blobBytes(new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'}))});
      const archive=zipStore(files);const link=document.createElement('a');link.href=URL.createObjectURL(archive);link.download='bymou-campaign-100-assets.zip';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),5000);
      completionMessage=`ZIP saved · 100 PNG assets plus manifest · ${durationMs} ms measured`;
    }catch(error){completionMessage=`Batch export stopped: ${error.message}`;status.dataset.error='true';}
    finally{render();if(completionMessage)status.textContent=completionMessage;}
  });
  if(document.fonts&&document.fonts.ready){
    document.fonts.ready.then(()=>{render();}).catch(()=>{render();});
    Promise.allSettled([document.fonts.load("400 48px 'Bodoni Moda'"),document.fonts.load("500 18px 'JetBrains Mono'")]).then(()=>{render();});
  }
  pngButton.disabled=manifestButton.disabled=batchButton.disabled=true;
  loadUrl('/assets/editorial/study-04.webp','study-04.webp');
})();
