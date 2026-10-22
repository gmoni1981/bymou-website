// Pure, shared metre-scale navigation used by the real-time viewer and route tests.
export function surfaceAt(data,x,z,currentHeight,maxStep=.28){
 const candidates=data.walkable.filter(r=>x>=r.minX-1e-5&&x<=r.maxX+1e-5&&z>=r.minZ-1e-5&&z<=r.maxZ+1e-5).map(r=>r.height??(r.heightStart+(r.heightEnd-r.heightStart)*Math.max(0,Math.min(1,((r.axis==='x'?x:z)-r.start)/(r.end-r.start)))));
 candidates.sort((a,b)=>Math.abs(a-currentHeight)-Math.abs(b-currentHeight));return candidates.find(h=>Math.abs(h-currentHeight)<=maxStep);
}
export function canStand(data,x,z,h,r=.20){
 if(!Number.isFinite(h))return false;
 if(data.colliders.some(c=>h+.1<c.maxY&&h+1.72>c.minY&&x>c.minX-r&&x<c.maxX+r&&z>c.minZ-r&&z<c.maxZ+r))return false;
 // Four footprint samples prevent slipping off a slab, roof or stair edge.
 return [[r,0],[-r,0],[0,r],[0,-r]].every(([dx,dz])=>surfaceAt(data,x+dx,z+dz,h,.5)!==undefined);
}
export function advance(data,p,dx,dz){
 let {x,z,h}=p;const parts=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.045));dx/=parts;dz/=parts;
 for(let i=0;i<parts;i++){
  let nh=surfaceAt(data,x+dx,z+dz,h);
  if(canStand(data,x+dx,z+dz,nh)){x+=dx;z+=dz;h=nh;continue;}
  nh=surfaceAt(data,x+dx,z,h);if(canStand(data,x+dx,z,nh)){x+=dx;h=nh;}
  nh=surfaceAt(data,x,z+dz,h);if(canStand(data,x,z+dz,nh)){z+=dz;h=nh;}
 }
 return {x,z,h};
}
