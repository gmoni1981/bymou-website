/* The Feed Escapes — authored spatial work. No generated assets are required. */
const section = document.querySelector('#reality');
const canvas = document.querySelector('#feed-canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 700px)');
let engine = null;
let importing = false;
let near = false;
let failed = false;
let serial = 0;
const paused = () => reduced.matches || document.documentElement.classList.contains('motion-paused');

const clamp = (x, lo=0, hi=1) => Math.max(lo,Math.min(hi,x));
const smooth = (a,b,x) => {const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const mix = (a,b,t) => a+(b-a)*t;

// Monotone Hermite interpolation keeps forward travel continuous and reversible.
const route = [[0,-1,1,18],[.14,3,0,-3],[.30,0,0,-36],[.54,0,0,-68],[.73,0,0,-116],[.84,0,0,-133],[.91,0,0,-148],[1,0,0,-159]];
function positionAt(p, axis) {
  let i=0;while(i<route.length-2 && p>route[i+1][0])i++;
  const a=route[i],b=route[i+1],h=b[0]-a[0],t=clamp((p-a[0])/h),d=(b[axis]-a[axis])/h;
  function slope(k){
    if(k===0)return (route[1][axis]-route[0][axis])/(route[1][0]-route[0][0]);
    if(k===route.length-1)return (route[k][axis]-route[k-1][axis])/(route[k][0]-route[k-1][0]);
    const left=(route[k][axis]-route[k-1][axis])/(route[k][0]-route[k-1][0]);
    const right=(route[k+1][axis]-route[k][axis])/(route[k+1][0]-route[k][0]);
    return left*right<=0?0:2*left*right/(left+right);
  }
  let m0=slope(i),m1=slope(i+1);
  if(d===0)m0=m1=0;
  return (2*t*t*t-3*t*t+1)*a[axis]+(t*t*t-2*t*t+t)*h*m0+(-2*t*t*t+3*t*t)*b[axis]+(t*t*t-t*t)*h*m1;
}

async function reconcile(){
  if(!section || !canvas)return;
  if(paused()) { engine?.dispose();engine=null;document.body.classList.remove('feed-enabled','feed-pending');section.dataset.mode='still';return; }
  if(engine || importing || !near || failed || !window.gsap || !window.ScrollTrigger)return;
  importing=true;
  const request=++serial;
  try{
    const THREE=await import('./assets/vendor/three/three.module.min.js');
    if(paused() || request!==serial)return;
    engine=await createJourney(THREE);
    if(paused()){engine.dispose();engine=null;return;}
    section.dataset.mode='spatial';
  }catch(error){
    failed=true;
    document.body.classList.remove('feed-enabled','feed-pending');section.dataset.mode='fallback';
    console.warn('BYMOU: spatial rendering unavailable; static work remains accessible.',error.message);
  }finally{importing=false;}
}

async function createJourney(T){
  const mobile=compact.matches;
  const renderer=new T.WebGLRenderer({canvas,antialias:!mobile,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.15:1.5));
  renderer.setSize(section.clientWidth,innerHeight,false);
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const scene=new T.Scene();scene.background=new T.Color('#141516');
  const camera=new T.PerspectiveCamera(mobile?64:48,section.clientWidth/innerHeight,.07,250);
  const materials=new Set(),geometries=new Set(),textures=new Set(),videos=[];
  let alive=true,visible=false,raf=0,lastFrame=0,currentPhase=-1,colour='#e63230';
  const state={p:0};
  const material=(type,props)=>{const m=new T[type](props);materials.add(m);return m;};
  const paper=material('MeshStandardMaterial',{color:'#f2f0e9',roughness:.65,metalness:.02});
  const ink=material('MeshStandardMaterial',{color:'#242422',roughness:.32,metalness:.35});
  const metal=material('MeshStandardMaterial',{color:'#a9a9a6',roughness:.18,metalness:.88});
  const cobalt=material('MeshStandardMaterial',{color:'#2948bf',roughness:.23,metalness:.26});
  const red=material('MeshPhysicalMaterial',{color:colour,roughness:.23,metalness:.25,clearcoat:1});
  const yellow=material('MeshStandardMaterial',{color:'#e8ed38',roughness:.42,metalness:.08});
  const whiteLight=material('MeshBasicMaterial',{color:'#fffef5',toneMapped:false});
  const imageLoader=new T.TextureLoader();
  const loadTexture=url=>{
    const tex=imageLoader.load(url,()=>{if(alive)draw();},undefined,()=>{});
    tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.add(tex);return tex;
  };
  const portrait=loadTexture('/assets/editorial/mounia-640.webp');portrait.userData.aspect=849/1151;
  const typeStill=loadTexture('/assets/editorial/bymou-branding.webp');
  function typeTexture(lines,{bg='#f2f0e9',fg='#24241f',small='BYMOU / INDEPENDENT EXPERIMENT',size=132}={}){
    const c=document.createElement('canvas');c.width=1024;c.height=768;
    const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,1024,768);
    x.fillStyle=fg;x.font='16px Helvetica, Arial';x.fillText(small,65,65);
    x.font=`${size}px Georgia, serif`;lines.forEach((line,i)=>x.fillText(line,60,215+i*size*.95));
    x.fillRect(65,680,894,1);x.font='18px Helvetica, Arial';x.fillText('MAKE REALITY MISBEHAVE.',65,724);
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.add(tex);return tex;
  }
  const outType=typeTexture(['OUT OF','FRAME.'],{size:170});
  const spaceType=typeTexture(['THE INTERNET','CAN’T CONTAIN','THE IMAGINATION.'],{size:80,bg:'#2948bf',fg:'#f2f0e9'});
  const matterType=typeTexture(['CHANGE','THE BRIEF.'],{bg:'#e8ed38',size:130});
  const finalType=typeTexture(['REALITY IS','EDITABLE.'],{size:150});
  const attach=(mesh,parent=scene)=>{parent.add(mesh);return mesh;};
  function box(w,h,d,mat,parent=scene,x=0,y=0,z=0){
    const geo=new T.BoxGeometry(w,h,d);geometries.add(geo);const m=attach(new T.Mesh(geo,mat),parent);m.position.set(x,y,z);return m;
  }
  function plane(w,h,tex,parent=scene,x=0,y=0,z=0){
    const geo=new T.PlaneGeometry(w,h);geometries.add(geo);
    if(tex?.userData.aspect){const imageAspect=tex.userData.aspect,viewAspect=w/h;const u=Math.min(1,viewAspect/imageAspect),v=Math.min(1,imageAspect/viewAspect);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*u+(1-u)/2,uv.getY(i)*v+(1-v)/2);}
    const mat=material('MeshBasicMaterial',{map:tex,toneMapped:false,side:T.DoubleSide});
    const m=attach(new T.Mesh(geo,mat),parent);m.position.set(x,y,z);return m;
  }
  function cylinder(r1,r2,height,mat,parent,x,y,z,radial=48){
    const g=new T.CylinderGeometry(r1,r2,height,radial);geometries.add(g);const m=attach(new T.Mesh(g,mat),parent);m.position.set(x,y,z);return m;
  }
  function torus(radius,tube,mat,parent,x,y,z){
    const g=new T.TorusGeometry(radius,tube,8,mobile?40:72);geometries.add(g);const m=attach(new T.Mesh(g,mat),parent);m.position.set(x,y,z);return m;
  }
  function frame(w,h,tex,parent=scene,{x=0,y=0,z=0,depth=.22,trim=paper,border=.14}={}){
    const group=attach(new T.Group(),parent);group.position.set(x,y,z);
    box(w+border*2,border,depth,trim,group,0,(h+border)/2,0);
    box(w+border*2,border,depth,trim,group,0,-(h+border)/2,0);
    box(border,h,depth,trim,group,-(w+border)/2,0,0);
    box(border,h,depth,trim,group,(w+border)/2,0,0);
    const display=tex?plane(w,h,tex,group,0,0,depth/2+.005):null;
    group.userData.display=display;return group;
  }

  // Procedural studio illumination supplies real material reflections.
  const envScene=new T.Scene();envScene.background=new T.Color('#252a32');
  const envWhite=new T.MeshBasicMaterial({color:'#ffffff'});
  for(const [x,y,z,w,h]of [[-4,3,1,3,7],[4,3,-1,2,8],[0,6,0,8,2],[0,0,-6,5,6]]){
    const m=new T.Mesh(new T.PlaneGeometry(w,h),envWhite);m.position.set(x,y,z);m.lookAt(0,0,0);envScene.add(m);
  }
  const pmrem=new T.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.04);scene.environment=environment.texture;
  envScene.traverse(o=>{o.geometry?.dispose();});envWhite.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight('#ffffff','#262830',2));
  const key=new T.DirectionalLight('#fff9eb',4);key.position.set(4,9,12);scene.add(key);
  const fill=new T.DirectionalLight('#b1c5ff',2);fill.position.set(-5,3,-60);scene.add(fill);

  // The first post is a real aperture in a paper-thick editorial surface.
  const entry=attach(new T.Group());entry.position.set(3,0,0);entry.rotation.set(0,-.08,-.09);
  const w=6.4,h=7.4;
  box(50,45,.1,paper,entry,-28.3,0,-.08);box(50,45,.1,paper,entry,28.3,0,-.08);
  box(w+.2,35,.1,paper,entry,0,21.3,-.08);box(w+.2,35,.1,paper,entry,0,-21.3,-.08);
  const portal=frame(w,h,portrait,entry,{depth:.3,border:.13,trim:ink});
  // Literal physical UI chrome, not an image of an interface.
  box(w+.25,.62,.24,paper,entry,0,4.03,0);
  plane(5.7,.42,typeTexture(['BYMOU / 001'],{size:70,small:'THE FEED ESCAPES'}),entry,0,4.04,.14);

  // Posts unfold into a volumetric composition with actual hinges and thickness.
  const hinges=[];
  const subjects=[portrait,outType,typeStill,spaceType];
  for(let i=0;i<(mobile?5:8);i++){
    const side=i%2===0?-1:1;
    const root=attach(new T.Group());root.position.set(side*(5.3+(i%3)*.6),(i%3-1)*1.6,-12-i*3.8);
    const postHeight=i%subjects.length===0?5.42:3;
    const f=frame(4,postHeight,subjects[i%subjects.length],root,{trim:i%3===0?cobalt:paper,border:.12});
    f.position.x=side*2;root.rotation.y=-side*.22;hinges.push({root,side,base:-side*.22});
    // Hinge pin is a cylinder oriented along the long edge of each post.
    cylinder(.035,.035,postHeight+.4,metal,root,0,0,.04,10);
  }
  const identityLabel=plane(6,3,outType,scene,-3.2,0,-32);identityLabel.rotation.y=.18;

  // A new, genuinely procedural product experiment: an unbranded compact camera.
  const product=attach(new T.Group());product.position.set(1,-.2,-64);
  const productBody=box(7,4.4,1.7,red,product);
  box(6.1,3.5,.25,ink,product,0,-.1,.9);
  const lensBase=cylinder(1.68,1.78,1.0,ink,product,.6,-.1,1.4);lensBase.rotation.x=Math.PI/2;
  const lensRing=torus(1.65,.12,metal,product,.6,-.1,1.92);
  const lensInner=torus(1.17,.06,whiteLight,product,.6,-.1,2.2);
  const lensGlass=material('MeshPhysicalMaterial',{color:'#526ba0',metalness:.08,roughness:.07,transmission:.87,thickness:.25,ior:1.45,clearcoat:1});
  const glass=cylinder(1.13,1.13,.08,lensGlass,product,.6,-.1,2.18);glass.rotation.x=Math.PI/2;
  box(1.1,.55,.13,paper,product,-2.1,1.15,1.1);
  box(.8,.23,.5,metal,product,2,2.35,0);
  const shutter=cylinder(.36,.36,.18,ink,product,2,2.55,0,24);
  plane(5.8,4.35,matterType,scene,-4.3,2,-70).rotation.y=.28;
  // Aperture blades unfold; the camera is never a video standing in for geometry.
  const iris=[];
  for(let i=0;i<9;i++){
    const root=attach(new T.Group(),product);root.position.set(.6,-.1,2.26);root.rotation.z=i*Math.PI*2/9;
    const blade=box(.65,1.5,.035,metal,root,.47,.38,0);iris.push({root,blade,angle:root.rotation.z});
  }

  // A passage of feed boundaries; every panel is connected to its neighbours.
  const passage=[];
  for(let i=0;i<(mobile?13:22);i++){
    const z=-77-i*(mobile?3.3:2.2);
    const group=frame(13.5,10.5,null,scene,{z,trim:i%5===0?cobalt:paper,border:.12,depth:.22});
    group.rotation.z=Math.sin(i*.43)*.25;passage.push({group,i});
    if(i%3===0){const side=i%2?1:-1;const display=frame(4.3,3.2,i%2?typeStill:spaceType,scene,{x:side*6.5,y:.4,z:z-1,trim:ink});display.rotation.y=-side*.85;}
  }
  // Connecting rails emphasize depth and the camera's uninterrupted travel.
  box(.035,.035,62,cobalt,scene,-6.8,-5.2,-93);box(.035,.035,62,cobalt,scene,6.8,-5.2,-93);
  const foldingSheets=[];
  for(let i=0;i<(mobile?12:24);i++){
    const root=attach(new T.Group());root.position.set((i%6-2.5)*1.7,Math.floor(i/6)*2.1-2.5,-106-(i%3)*1.2);
    const leaf=box(1.5,1.9,.07,i%3===0?red:i%3===1?cobalt:paper,root,.75,0,0);
    foldingSheets.push({root,leaf,i});
  }

  // Final screen: irregular closed polygons extruded into thick physical glass.
  const breakZ=-134;
  const breakFrame=frame(17,11,typeStill,scene,{z:breakZ,trim:paper,border:.2,depth:.45});
  const backing=breakFrame.userData.display;
  const shardMaterial=material('MeshPhysicalMaterial',{color:'#cad7ed',roughness:.035,metalness:0,transmission:1,thickness:.28,ior:1.5,clearcoat:1,envMapIntensity:.5,side:T.DoubleSide});
  const shardEdge=material('MeshPhysicalMaterial',{color:'#6883aa',roughness:.07,metalness:.1,transmission:.8,thickness:.20,ior:1.5,side:T.DoubleSide});
  const shards=[],crackPoints=[];
  let seed=571;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};
  const sectors=mobile?13:23;
  const angles=Array.from({length:sectors},(_,i)=>2*Math.PI*(i+(random()-.5)*.4)/sectors);
  for(const x of [-8.5,8.5])for(const y of [-5.5,5.5])angles.push((Math.atan2(y,x)+Math.PI*2)%(Math.PI*2));
  angles.sort((a,b)=>a-b);
  const rings=[0,.10,.26,.48,.72,1];
  const points=rings.map((r,k)=>angles.map(a=>{const length=Math.min(8.5/(Math.abs(Math.cos(a))||.0001),5.5/(Math.abs(Math.sin(a))||.0001));const fraction=(k===0||k===rings.length-1)?r:r+(random()-.5)*.035;return new T.Vector2(Math.cos(a)*length*fraction,Math.sin(a)*length*fraction);}));
  for(let k=0;k<rings.length-1;k++)for(let j=0;j<angles.length;j++){
    const next=(j+1)%angles.length;
    const polygon=k===0?[points[0][j],points[1][j],points[1][next]]:[points[k][j],points[k+1][j],points[k+1][next],points[k][next]];
    const center=polygon.reduce((s,p)=>s.add(p),new T.Vector2()).multiplyScalar(1/polygon.length);
    const shape=new T.Shape(polygon.map(p=>p.clone().sub(center)));
    const geo=new T.ExtrudeGeometry(shape,{depth:.16+random()*.12,bevelEnabled:false,steps:1});geometries.add(geo);
    const mesh=attach(new T.Mesh(geo,[shardMaterial,shardEdge]));mesh.position.set(center.x,center.y,breakZ+.25);
    shards.push({mesh,base:mesh.position.clone(),velocity:new T.Vector3(center.x*.9+(random()-.5)*3,center.y*.75+random()*2,7+random()*17),spin:new T.Vector3((random()-.5)*4,(random()-.5)*5,(random()-.5)*3),delay:random()*.09});
    for(let v=0;v<polygon.length;v++){const a=polygon[v],b=polygon[(v+1)%polygon.length];crackPoints.push(a.x,a.y,breakZ+.55,b.x,b.y,breakZ+.55);}
  }
  const crackGeo=new T.BufferGeometry();crackGeo.setAttribute('position',new T.Float32BufferAttribute(crackPoints,3));geometries.add(crackGeo);
  const crackMat=material('LineBasicMaterial',{color:'#eff6ff',transparent:true,opacity:0});
  const cracks=attach(new T.LineSegments(crackGeo,crackMat));

  // Typography and work become readable as spatial movement settles.
  box(65,45,.2,paper,scene,0,0,-174);
  const last=frame(6,4.5,typeStill,scene,{x:6.7,y:.3,z:-171,trim:ink});last.rotation.y=-.18;
  frame(4.8,6.4,typeStill,scene,{x:-16,y:.3,z:-166,trim:ink}).rotation.y=.3;
  frame(4.8,6.4,portrait,scene,{x:16,y:.3,z:-166,trim:ink}).rotation.y=-.3;
  box(50,.1,35,paper,scene,0,-6,-160);

  // One existing, suitable moving image; never repurpose the rejected still.
  const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';
  video.src='/assets/video/bymou-branding.mp4';videos.push(video);
  const videoTexture=new T.VideoTexture(video);videoTexture.colorSpace=T.SRGBColorSpace;textures.add(videoTexture);
  let videoStarted=false;
  video.addEventListener('loadeddata',()=>{if(!alive)return;for(const mat of materials)if(mat.map===typeStill){mat.map=videoTexture;mat.needsUpdate=true;}});

  function resize(){
    if(!alive)return;const width=section.clientWidth;renderer.setSize(width,innerHeight,false);camera.aspect=width/innerHeight;camera.updateProjectionMatrix();
  }
  function phaseAt(p){return p<.15?0:p<.32?1:p<.54?2:p<.8?3:4;}
  function update(){
    const p=state.p;section.dataset.finale=String(p>.955);
    camera.position.set(positionAt(p,1),positionAt(p,2),positionAt(p,3));
    const q=clamp(p+.018);
    camera.lookAt(positionAt(q,1),positionAt(q,2),positionAt(q,3)-9);
    // Product exits the optical path by opening on a real hinge as we approach.
    product.rotation.y=mix(-.24,-1.25,smooth(.45,.55,p));
    product.position.x=1+smooth(.48,.56,p)*6;
    product.rotation.z=Math.sin(p*Math.PI*2)*.08;
    lensRing.position.z=1.92+smooth(.35,.44,p)*.5;
    lensInner.position.z=2.2+smooth(.35,.44,p)*.8;
    shutter.position.y=2.55-smooth(.4,.42,p)*.12;
    iris.forEach(({root,angle})=>{root.rotation.z=angle+smooth(.35,.5,p)*1.15;});
    hinges.forEach(({root,side,base},i)=>{root.rotation.y=base+side*smooth(.13,.32,p)*(Math.PI*.48+Math.sin(i)*.13);});
    passage.forEach(({group,i})=>{group.rotation.z=Math.sin(i*.43)*.25+smooth(.48,.76,p)*Math.sin(i*.21)*.4;});
    foldingSheets.forEach(({root,i})=>{root.rotation.y=smooth(.54,.73,p)*(i%2?-1:1)*1.4;root.rotation.z=smooth(.55,.75,p)*Math.sin(i)*.2;});
    const impact=smooth(.812,.9,p);
    crackMat.opacity=smooth(.776,.818,p)*(1-smooth(.84,.9,p))*.95;
    backing.visible=p<.825;
    shards.forEach(({mesh,base,velocity,spin,delay})=>{
      mesh.visible=p>.775&&p<.97;
      const t=clamp((impact-delay)/(1-delay));
      const force=1-Math.exp(-3.5*t);
      mesh.position.copy(base).addScaledVector(velocity,force);mesh.position.y-=t*t*7;
      mesh.rotation.set(spin.x*force,spin.y*force,spin.z*force);
    });
    const phase=phaseAt(p);
    if(phase!==currentPhase){
      currentPhase=phase;section.dataset.phase=String(phase);
      document.querySelectorAll('[data-feed-step]').forEach((s,i)=>s.classList.toggle('is-active',i===phase));
      const n=document.querySelector('[data-feed-number]');if(n)n.textContent=String(phase+1).padStart(2,'0');
    }
    const fill=document.querySelector('[data-feed-progress]');if(fill)fill.style.transform=`scaleX(${p})`;
    canvas.dataset.progress=p.toFixed(4);canvas.dataset.cameraZ=camera.position.z.toFixed(4);canvas.dataset.shards=String(shards.length);
    if(visible&&!videoStarted&&!navigator.connection?.saveData){videoStarted=true;video.play().catch(()=>{});}
  }
  function draw(){if(!alive)return;update();renderer.render(scene,camera);}
  function loop(time){
    raf=0;if(!alive||!visible||document.hidden)return;
    if(time-lastFrame>(mobile?35:16)){draw();lastFrame=time;}
    raf=requestAnimationFrame(loop);
  }
  function wake(){if(!raf&&visible&&!document.hidden&&alive)raf=requestAnimationFrame(loop);}
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;videos.forEach(v=>v.pause());}else{if(visible&&videoStarted)video.play().catch(()=>{});wake();}}
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){if(videoStarted)video.play().catch(()=>{});wake();}else{cancelAnimationFrame(raf);raf=0;videos.forEach(v=>v.pause());}
  },{threshold:.01});observer.observe(canvas);
  document.body.classList.add('feed-enabled');document.body.classList.remove('feed-pending');
  const timeline=gsap.timeline({scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}});
  timeline.to(state,{p:1,duration:1,ease:'none'});
  function changeColour(event){
    const button=event.target.closest('[data-feed-colour]');if(!button)return;
    colour=button.dataset.feedColour;red.color.set(colour);
    document.querySelectorAll('[data-feed-colour]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    draw();
  }
  const controls=document.querySelector('.feed-colours');controls?.addEventListener('click',changeColour);
  window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
  function contextLost(event){event.preventDefault();failed=true;engine?.dispose();engine=null;section.dataset.mode='fallback';}
  canvas.addEventListener('webglcontextlost',contextLost);
  resize();draw();ScrollTrigger.refresh();
  return {dispose(){
    if(!alive)return;alive=false;timeline.scrollTrigger?.kill();timeline.kill();observer.disconnect();cancelAnimationFrame(raf);
    window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);controls?.removeEventListener('click',changeColour);canvas.removeEventListener('webglcontextlost',contextLost);
    videos.forEach(v=>{v.pause();v.removeAttribute('src');v.load();});textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment.dispose();renderer.dispose();
    document.body.classList.remove('feed-enabled');section.dataset.phase='0';delete section.dataset.finale;delete canvas.dataset.progress;delete canvas.dataset.cameraZ;
    ScrollTrigger.refresh();
  }};
}

if(section&&canvas){
  if(!paused())document.body.classList.add('feed-pending');
  const observer=new IntersectionObserver(entries=>{near=entries[0].isIntersecting;if(near)reconcile();},{rootMargin:'700px'});observer.observe(section);
  document.addEventListener('bymou:motionchange',reconcile);
  reduced.addEventListener('change',reconcile);
  compact.addEventListener('change',()=>{engine?.dispose();engine=null;reconcile();});
  window.addEventListener('load',reconcile,{once:true});
}
