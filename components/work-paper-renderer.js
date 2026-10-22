/* Original local paper renderer inspired by the supplied preset, not Movo source.
   Four real projects replace the preset's nine demo items. Creases are procedural
   geometry; the centre sheet resolves flat so the supplied artwork stays legible. */
import * as THREE from '../assets/vendor/three/three.module.min.js';
export async function createPaperRenderer(host,projects,preset){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(preset.bgColor,0);host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,40);camera.position.z=8.2;
 const loader=new THREE.TextureLoader();let textures;
 try{textures=await Promise.all(projects.map(async p=>{const t=await loader.loadAsync((p.thumbnail || p.images[0]).src);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;return t}))}catch(e){renderer.dispose();renderer.domElement.remove();throw e}
 const geometry=new THREE.PlaneGeometry(2.56,3.2,48,60);
 const vertex=`uniform float fold;uniform float seed;uniform float clock;uniform float energy;varying vec2 vUv;varying vec3 vPosition;
 void main(){vUv=uv;vec3 p=position;float z=0.;for(int i=0;i<6;i++){float a=float(i)*1.83+seed*.71;vec2 n=vec2(cos(a),sin(a));float line=dot(p.xy,n)+sin(float(i)*2.7+seed)*.8;z+=(abs(line)-.65)*sin(float(i)*2.1+1.)*.21;}
 float k=fold*.92;float x=p.x;float radius=1./max(k,.001);p.x=mix(x,sin(x*k)*radius,min(1.,k));p.z+=(1.-cos(x*k))*radius*min(1.,k);p.z+=fold*z;
 float ripple=sin(p.y*2.3-clock*1.2+seed)*sin(p.x*2.+clock*.5);p.z+=ripple*(.045+energy*.07);p.y+=fold*sin(x*1.9+seed)*.15;p.x*=1.-fold*.1;
 vec4 view=modelViewMatrix*vec4(p,1.);vPosition=view.xyz;gl_Position=projectionMatrix*view;}`;
 const fragment=`uniform sampler2D art;uniform float ratio;uniform float alpha;uniform float lightAngle;uniform float grain;varying vec2 vUv;varying vec3 vPosition;
 void main(){vec2 uv=vUv;if(ratio>.8)uv.y=(uv.y-.5)*ratio/.8+.5;else uv.x=(uv.x-.5)*.8/ratio+.5;
 vec3 color=vec3(.956,.95,.93);if(uv.x>=0.&&uv.x<=1.&&uv.y>=0.&&uv.y<=1.)color=texture2D(art,uv).rgb;
 vec3 normal=normalize(cross(dFdx(vPosition),dFdy(vPosition)));vec3 light=normalize(vec3(cos(lightAngle)*.5,sin(lightAngle)*.5,1.));float shade=.83+.17*max(0.,dot(normal,light));if(!gl_FrontFacing)color=vec3(1.);float noise=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;color=color*shade+noise*grain*.016;gl_FragColor=vec4(color,alpha);
 #include <colorspace_fragment>
 }`;
 const meshes=[];for(let i=0;i<4;i++){const material=new THREE.ShaderMaterial({uniforms:{art:{value:textures[0]},ratio:{value:.8},alpha:{value:1},fold:{value:0},clock:{value:0},energy:{value:0},seed:{value:preset.foldSeed},lightAngle:{value:preset.lightAngle*Math.PI/180},grain:{value:preset.texture}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide,transparent:true});const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);meshes.push(mesh)}
 let width=0,height=0,disposed=false,lastPosition=NaN,cx=0,cy=0;
 function resize(){const r=host.getBoundingClientRect();width=r.width;height=r.height;if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=width<701?7.4:7.2;camera.updateProjectionMatrix();lastPosition=NaN}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 return {render(position,time=0,pointer={x:0,y:0,velocity:0}){if(disposed||!width||!height)return;lastPosition=position;cx+=(pointer.x*.4-cx)*.06;cy+=(-pointer.y*.25-cy)*.06;camera.position.x=cx;camera.position.y=cy;camera.lookAt(0,0,0);const base=Math.floor(position);meshes.forEach((mesh,i)=>{const n=base+i-1,relative=n-position,abs=Math.abs(relative),idx=((n%projects.length)+projects.length)%projects.length;
 const curve=Math.sin(relative*.92),depth=Math.cos(relative*.92);mesh.position.set(relative*(width<701?2.38:2.88),Math.sin(relative*1.7)*.43+Math.sin(time*.7+idx)*.045,-Math.pow(abs,1.2)*1.05+Math.sin(time*.45)*.06);mesh.rotation.set(Math.sin(relative*1.4)*.18,-relative*.5,curve*-.24+Math.sin(time*.65+idx)*.025);mesh.scale.setScalar(1+Math.max(0,1-abs)*.12);
 const u=mesh.material.uniforms;u.art.value=textures[idx];u.ratio.value=(projects[idx].thumbnail || projects[idx].images[0]).width/(projects[idx].thumbnail || projects[idx].images[0]).height;u.fold.value=Math.min(1.5,abs)*preset.crumpleAmount*1.8;u.clock.value=time;u.energy.value=pointer.velocity;u.seed.value=preset.foldSeed+idx;u.alpha.value=Math.max(0,Math.min(1,(1.85-abs)*2));mesh.visible=u.alpha.value>0;mesh.renderOrder=10-Math.round(abs*4)});renderer.render(scene,camera)},dispose(){disposed=true;observer.disconnect();geometry.dispose();meshes.forEach(m=>m.material.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove()}};
}
