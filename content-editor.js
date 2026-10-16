(() => {
  'use strict';
  let data=null;
  const entries=document.querySelector('#entries');
  const status=document.querySelector('#editor-status');
  const english=value=>data?.locales?.en?.[value]??value??'';
  function validData(value){return value&&typeof value==='object'&&Array.isArray(value.resources)&&value.locales?.en&&Array.isArray(value.projects);}
  function field(labelText,value,name,type='text'){
    const label=document.createElement('label');const span=document.createElement('span');span.textContent=labelText;label.append(span);
    const input=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type;input.name=name;input.value=value||'';input.required=true;input.maxLength=name==='description'?600:300;label.append(input);return label;
  }
  function render(){
    entries.replaceChildren();
    data.resources.forEach((resource,index)=>{
      const box=document.createElement('fieldset');box.className='editor-entry';box.dataset.index=index;
      const legend=document.createElement('legend');legend.textContent=`Resource ${index+1}`;box.append(legend);
      box.append(field('Title',resource.titleKey?english(resource.titleKey):resource.title,'title'));
      box.append(field('Category',resource.kind?english(resource.kind):resource.category,'category'));
      box.append(field('Description',english(resource.descriptionKey||resource.description),'description','textarea'));
      box.append(field('Link (https://… or a local /#section)',resource.url,'url'));
      const label=document.createElement('label');label.className='affiliate-label';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.name='affiliate';checkbox.checked=Boolean(resource.affiliate);label.append(checkbox,document.createTextNode('This is an affiliate link; show a disclosure.'));box.append(label);
      const remove=document.createElement('button');remove.type='button';remove.textContent='Remove this resource';remove.addEventListener('click',()=>{read();data.resources.splice(index,1);render();status.textContent='Resource removed from this draft. Nothing has been published.';});box.append(remove);entries.append(box);
    });
    document.querySelector('#download').disabled=false;
  }
  function read(){
    const old=data.resources;
    data.resources=[...entries.children].map((box,index)=>{
      const get=name=>box.querySelector(`[name=${name}]`).value.trim();
      const resource={title:get('title'),category:get('category'),description:get('description'),url:get('url'),affiliate:box.querySelector('[name=affiliate]').checked};
      // Keep existing translation keys if the corresponding field was untouched.
      const before=old[index]||{};
      if(before.titleKey&&resource.title===english(before.titleKey)){resource.titleKey=before.titleKey;delete resource.title;}
      if(before.kind&&resource.category===english(before.kind)){resource.kind=before.kind;delete resource.category;}
      const key=before.descriptionKey||before.description;
      if(key?.startsWith('resources.')&&resource.description===english(key))resource.description=key;
      return resource;
    });
  }
  document.querySelector('#add-resource').addEventListener('click',()=>{if(!data)return;read();data.resources.push({title:'',category:'',description:'',url:'',affiliate:false});render();entries.lastChild.querySelector('input').focus();status.textContent='New entry added to this draft.';});
  document.querySelector('#editor-form').addEventListener('submit',event=>{
    event.preventDefault();if(!data)return;read();
    const invalid=data.resources.some(resource=>{try{const url=new URL(resource.url,location.origin);return (!resource.url.startsWith('/')&&url.protocol!=='https:')||url.username||url.password||resource.url.startsWith('//');}catch(_){return true;}});
    if(invalid){status.textContent='Use an https:// link or a local link beginning with /. No file has been exported.';return;}
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='site.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Updated site.json downloaded. Replace data/site.json in the existing repository, then review locally. Nothing has been published.';
  });
  document.querySelector('#import').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{if(file.size>2000000)throw new Error('The file is too large.');const value=JSON.parse(await file.text());if(!validData(value))throw new Error('Expected a BYMOU site.json with resources, locales and projects.');data=value;render();status.textContent='File imported into this browser draft. Nothing has been published.';}
    catch(error){status.textContent=`Import failed: ${error.message}`;}
  });
  fetch('/data/site.json').then(response=>{if(!response.ok)throw new Error('Content could not be loaded.');return response.json();}).then(value=>{if(!validData(value))throw new Error('Content format is invalid.');data=value;render();status.textContent='Existing resources loaded. Changes remain in your browser until you export them.';}).catch(error=>status.textContent=error.message);
})();
