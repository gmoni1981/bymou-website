(() => {
  'use strict';
  const fields=['project-title','discipline','audience','objective','formats','timing','budget'];
  const labels={'project-title':'Project','discipline':'Discipline',audience:'Audience',objective:'Objective',formats:'Formats and deliverables',timing:'Timing',budget:'Budget'};
  const summary=document.querySelector('#summary');const status=document.querySelector('#status');
  function getData(){const result={};fields.forEach(id=>result[id]=document.getElementById(id).value.trim());return result;}
  function text(){const d=getData();return [`${d['project-title']||'Untitled project'}`,`Discipline: ${d.discipline}`,`Audience: ${d.audience||'To be defined'}`,`Objective: ${d.objective||'To be defined'}`,`Formats and deliverables: ${d.formats||'To be defined'}`,`Timing: ${d.timing||'To be defined'}`,`Budget: ${d.budget||'To be defined'}`].join('\n\n');}
  function update(){summary.textContent=text();}
  fields.forEach(id=>document.getElementById(id).addEventListener('input',update));
  document.querySelector('#copy-summary').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text());status.textContent='Brief summary copied.';}catch{const range=document.createRange();range.selectNodeContents(summary);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='Summary selected. Use your browser copy command.';}});
  document.querySelector('#download-json').addEventListener('click',()=>{const payload={tool:'BYMOU Brief Builder',toolMode:'local brief drafting; no server submission',fields:getData(),createdAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='creative-project-brief.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);status.textContent='Structured brief downloaded as JSON.';});
  update();
})();
