"""Non-destructive visual refinement of saved approved P02; no layout reconstruction.
Produces three Cycles review images, never changes website/GLB or renders films.
"""
import bpy, math, random, json, hashlib, sys
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parent
OUT=R/'quality-review';OUT.mkdir(exist_ok=True)
random.seed(192)
bpy.ops.wm.open_mainfile(filepath=str(R/'Casa-Mirador-P02.blend'))
s=bpy.context.scene
col=bpy.data.collections.new('P02 visual craftsmanship');s.collection.children.link(col)
def add(o,name,mat=None):
 o.name=name
 for c in list(o.users_collection):c.objects.unlink(o)
 col.objects.link(o)
 if mat:o.data.materials.append(mat)
 return o
def box(name,p,d,m,b=.02):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=add(bpy.context.object,name,m);o.scale=d;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if b:
  q=o.modifiers.new('Rounded crafted edges','BEVEL');q.width=b;q.segments=4
  o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 return o
def mesh(name,v,f,m):
 me=bpy.data.meshes.new(name);me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new(name,me);col.objects.link(o);me.materials.append(m)
 for p in me.polygons:p.use_smooth=True
 return o
def curve(name,pts,r,m):
 cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=12;cu.bevel_depth=r;cu.bevel_resolution=3
 sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for b,p in zip(sp.bezier_points,pts):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 ob=bpy.data.objects.new(name,cu);col.objects.link(ob);cu.materials.append(m);return ob
def lathe(name,center,profile,mat,n=64):
 v=[];f=[]
 for rad,z in profile:
  for i in range(n):
   a=i*math.tau/n;v.append((center[0]+rad*math.cos(a),center[1]+rad*math.sin(a),center[2]+z))
 for j in range(len(profile)-1):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;f.append((a,b,b+n,a+n))
 return mesh(name,v,f,mat)
def mat(name,a,b,rough=.6,scale=8,bump=.001,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=n.get('Principled BSDF');bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 tc=n.new('ShaderNodeTexCoord');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=scale;noise.inputs['Detail'].default_value=4;l.new(tc.outputs['Object'],noise.inputs['Vector'])
 ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].color=(*a,1);ramp.color_ramp.elements[1].color=(*b,1);l.new(noise.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs[0],bs.inputs['Base Color'])
 fine=n.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=180;fine.inputs['Roughness'].default_value=.75;l.new(tc.outputs['Object'],fine.inputs['Vector']);bn=n.new('ShaderNodeBump');bn.inputs['Strength'].default_value=.24;bn.inputs['Distance'].default_value=bump;l.new(fine.outputs['Fac'],bn.inputs['Height']);l.new(bn.outputs[0],bs.inputs['Normal']);m.diffuse_color=(*b,1);return m
plaster=mat('Q / burnished ivory tadelakt',(.52,.455,.35),(.64,.58,.47),.65,3,.0012)
stone=mat('Q / vein-cut pale travertine',(.45,.39,.29),(.64,.57,.44),.45,4,.0018)
linen=mat('Q / flax upholstery',(.65,.60,.49),(.81,.76,.64),.91,45,.0007)
linen.node_tree.nodes.get('Principled BSDF').inputs['Sheen Weight'].default_value=.3
olive=mat('Q / olive cushion',(.13,.145,.07),(.26,.27,.14),.94,70,.0008)
wood=mat('Q / oiled oak',(.13,.064,.026),(.34,.22,.105),.4,3,.001)
# Directional grain, with physical object coordinates.
n=wood.node_tree.nodes;l=wood.node_tree.links;noise=next(x for x in n if x.type=='TEX_NOISE');tc=next(x for x in n if x.type=='TEX_COORD');mapping=n.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY';mapping.inputs[1].default_value=(5,5,.16);l.new(tc.outputs['Object'],mapping.inputs[0]);l.new(mapping.outputs[0],noise.inputs['Vector'])
bronze=mat('Q / patinated bronze',(.16,.085,.025),(.38,.25,.11),.29,25,.0004,.78)
ceramic=mat('Q / speckled ceramic',(.38,.29,.17),(.65,.53,.35),.38,18,.001)
soil=mat('Q / planted earth',(.035,.022,.011),(.08,.059,.029),1,30,.006)
jute=mat('Q / natural handwoven rug',(.24,.17,.09),(.43,.34,.21),.97,60,.0014)
leaf=mat('Q / olive leaf tops',(.025,.044,.012),(.14,.18,.055),.52,12,.0001)
leaf.node_tree.nodes.get('Principled BSDF').inputs['Subsurface Weight'].default_value=.07
silver=mat('Q / olive silver reverse',(.15,.18,.105),(.25,.28,.17),.68,10,.0001)
# Reassign only surface finishes, retaining all approved structural objects.
for o in list(s.objects):
 if o.type!='MESH':continue
 for i,m in enumerate(o.data.materials):
  if not m:continue
  name=m.name
  target=plaster if name.startswith('Warm tadelakt') else stone if name.startswith('Honed travertine') else linen if name.startswith('Ivory linen') else olive if name.startswith('Olive linen') else wood if name.startswith('Natural walnut') else bronze if name.startswith('Aged bronze') else jute if name.startswith('Woven jute') else ceramic if name.startswith(('Ceramic ivory','Hand fired terracotta')) else None
  if target:o.data.materials[i]=target
# Glazing: remove blue tint, use actual thin sealed panes in path-traced lighting.
for m in bpy.data.materials:
 if m.name.startswith('Clear architectural glazing'):
  bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.985,.995,1,1);bs.inputs['Roughness'].default_value=.025;bs.inputs['Transmission Weight'].default_value=1;bs.inputs['IOR'].default_value=1.46
for o in list(s.objects):
 if o.type=='MESH' and o.name.startswith('Arch shaped fixed glass'):
  q=o.modifiers.new('6mm laminated pane','SOLIDIFY');q.thickness=.006
 if o.type=='MESH' and o.name.startswith('Window glazing'):
  # Existing schematic panes are 20mm thick: 6mm is realistic without moving openings.
  k=min(range(3),key=lambda i:o.dimensions[i]);o.dimensions[k]=.006
  p=o.location;d=o.dimensions
  if k==0:
   for yy in [p.y-d.y/2,p.y+d.y/2]:box('Window bronze side frame',(p.x,yy,p.z),(.035,.035,d.z+.04),bronze,.005)
   for zz in [p.z-d.z/2,p.z+d.z/2]:box('Window bronze horizontal frame',(p.x,p.y,zz),(.035,d.y+.04,.035),bronze,.005)
  else:
   for xx in [p.x-d.x/2,p.x+d.x/2]:box('Window bronze side frame',(xx,p.y,p.z),(.035,.035,d.z+.04),bronze,.005)
   for zz in [p.z-d.z/2,p.z+d.z/2]:box('Window bronze horizontal frame',(p.x,p.y,zz),(d.x+.04,.035,.035),bronze,.005)
# Tailored padded surfaces: curved tessellated skins, subtle seam puckering and piping.
def cushion(o):
 dims=tuple(o.dimensions);p=o.location.copy();rot=o.rotation_euler.copy();m=o.data.materials[0];name=o.name
 bpy.data.objects.remove(o,do_unlink=True)
 v=[];f=[];nu=64;nv=32
 def sp(x,e):return math.copysign(abs(x)**e,x)
 for j in range(nv+1):
  t=-math.pi/2+math.pi*j/nv
  for i in range(nu):
   a=math.tau*i/nu;ring=sp(math.cos(t),.35)
   x=ring*sp(math.cos(a),.33)*dims[0]/2;y=ring*sp(math.sin(a),.33)*dims[1]/2;z=sp(math.sin(t),.35)*dims[2]/2
   z+=.0025*math.sin(a*19+t*5)*(abs(math.sin(t))**.5)*math.sin(t*2)
   v.append((x,y,z))
 for j in range(nv):
  for i in range(nu):k=j*nu+i;kk=j*nu+(i+1)%nu;f.append((k,kk,kk+nu,k+nu))
 ob=mesh('Tailored '+name,v,f,m);ob.location=p;ob.rotation_euler=rot
 pts=[]
 for i in range(65):
  a=math.tau*i/64;pt=Vector((sp(math.cos(a),.33)*dims[0]/2,sp(math.sin(a),.33)*dims[1]/2,0));pts.append(p+rot.to_matrix()@pt)
 curve('Upholstery welt seam',pts,.002,m)
for o in list(s.objects):
 if o.type=='MESH' and o.name.startswith(('Seat cushion','Chaise seat','Olive linen pillow','Linen pillow','Linen upholstered mattress','Linen duvet','Sofa back')):cushion(o)
# Padded armrests and hidden plinth stay inside the approved sofa footprint.
for y in [1.11,4.19]:
 o=box('Linen upholstered sofa arm',(.95,y,.62),(.89,.2,.57),linen,.07);cushion(o)
box('Recessed sofa plinth',(.95,2.65,.07),(.73,3.1,.12),wood,.025)
# Natural folded throw on the chaise, true geometry with uneven hem.
v=[];f=[]
for j in range(56):
 for i in range(32):
  x=1.65+i/31*.72;y=1.12+j/55*1.2;z=.635 if y<1.84 else .635-(y-1.84)*1.05
  z+=.014*math.sin(i*.8+j*.1)+.008*math.sin(j*.5);v.append((x,y,z))
for j in range(55):
 for i in range(31):k=j*32+i;f.append((k,k+1,k+33,k+32))
o=mesh('Draped linen throw',v,f,jute);q=o.modifiers.new('Fabric thickness','SOLIDIFY');q.thickness=.003
# Replace chair placeholders with turned oak structure and actual woven rush strands.
for o in list(s.objects):
 if o.name.startswith(('Woven chair seat','Oak chair leg','Cane chair back')):bpy.data.objects.remove(o,do_unlink=True)
layout=json.loads((R/'approval/layout-geometry.json').read_text())
def chair(cx,cy,z,angle):
 def p(x,y,h):return (cx+x*math.cos(angle)-y*math.sin(angle),cy+x*math.sin(angle)+y*math.cos(angle),z+h)
 for x in [-.18,.18]:
  for y in [-.18,.18]:curve('Tapered chair leg',[p(x*1.1,y*1.12,.02),p(x,y,.44),p(x,y,.47)],.019,wood)
  curve('Sculpted oak back upright',[p(x,.18,.42),p(x,.205,.68),p(x,.255,.9)],.021,wood)
 for h in [.62,.87]:curve('Curved oak back rail',[p(-.18,.25,h),p(0,.27,h+.015),p(.18,.25,h)],.023,wood)
 for y in [-.19,.19]:curve('Oak seat rail',[p(-.2,y,.44),p(.2,y,.44)],.025,wood)
 for x in [-.19,.19]:curve('Oak side rail',[p(x,-.2,.44),p(x,.2,.44)],.025,wood)
 for k in range(35):
  t=-.17+.34*k/34
  curve('Woven rush seat',[p(t,-.18,.46),p(t,0,.449+.002*(k%2)),p(t,.18,.46)],.0042,jute)
  curve('Woven rush cross',[p(-.18,t,.462),p(0,t,.455),p(.18,t,.462)],.0035,jute)
 for k in range(21):
  t=-.16+.32*k/20;curve('Woven cane back',[p(t,.252,.64),p(t,.26,.75),p(t,.254,.85)],.0035,jute)
for f in layout['furniture']['GF']:
 if f['name']=='Dining chair':
  a,b,c,d=f['rect'];cx=(a+c)/2;cy=(b+d)/2;angle=math.pi/2 if cx<2 else -math.pi/2 if cx>3 else math.pi if cy<7 else 0;chair(cx,cy,0,angle)
for x in [6.4,7.3,8.2]:
 for y in [11.7,13.3]:chair(x,y,6.48,math.pi if y<12 else 0)
# Lathed open ceramic objects, books and branches give scale and human detail.
for o in list(s.objects):
 if o.name.startswith(('Ceramic bowl','Handmade pottery')):
  p=o.location.copy();bpy.data.objects.remove(o,do_unlink=True);lathe('Hand thrown vessel',p-Vector((0,0,.07)),[(.045,0),(.075,.02),(.10,.10),(.07,.17),(.062,.18),(.055,.17),(.084,.10),(.045,.04)],ceramic)
for z in [.475,.50]:box('Art book on coffee table',(2.77,3.12,z),(.32,.23,.025),linen,.003)
lathe('Travertine fruit bowl',(2.44,3.03,.46),[(.03,0),(.09,.02),(.2,.09),(.19,.10),(.08,.04),(.025,.03)],stone)
lathe('Dining ceramic vase',(2.5,8,.8),[(.08,0),(.12,.08),(.11,.24),(.05,.33),(.045,.34),(.039,.33),(.09,.23),(.1,.08),(.06,.02)],ceramic)
# Dense branching foliage with curved lanceolate leaves; no opaque canopy meshes.
for o in list(s.objects):
 if o.name.startswith(('Olive foliage','Olive trunk','Olive branch')):bpy.data.objects.remove(o,do_unlink=True)
leafv=[];leaff=[]
def leaves(center,spread,count,length=.07):
 for k in range(count):
  d=Vector((random.gauss(0,1),random.gauss(0,1),random.gauss(0,.65)));d.normalize();d*=random.random()**.33
  c=Vector(center)+Vector((d.x*spread[0],d.y*spread[1],d.z*spread[2]));a=random.random()*math.tau;u=Vector((math.cos(a),math.sin(a),random.uniform(-.5,.5)))*length;v=Vector((-math.sin(a),math.cos(a),.2))*length*.21
  q=len(leafv);leafv.extend([tuple(c-u),tuple(c+v),tuple(c+u),tuple(c-v),tuple(c+Vector((0,0,.009)))]);leaff.extend([(q,q+1,q+4),(q+1,q+2,q+4),(q+2,q+3,q+4),(q+3,q,q+4)])
def tree(x,y,z,scale):
 curve('Weathered olive trunk',[(x,y,z+.4*scale),(x+.07*scale,y,z+1.1*scale),(x-.02*scale,y+.04*scale,z+1.9*scale)],.055*scale,wood)
 for b in range(9):
  a=b*2.399;tip=Vector((x+math.cos(a)*.60*scale,y+math.sin(a)*.6*scale,z+(1.75+random.random()*.8)*scale));base=Vector((x,y,z+1.25*scale));mid=base.lerp(tip,.5)+Vector((0,0,.12*scale));curve('Olive forked limb',[base,mid,tip],.016*scale,wood)
  for j in range(4):
   end=tip+Vector((random.uniform(-.3,.3)*scale,random.uniform(-.3,.3)*scale,random.uniform(-.15,.25)*scale));curve('Olive fine twig',[mid,tip,end],.004*scale,wood);leaves(end,(.26*scale,.26*scale,.24*scale),95,.065*scale)
for z,pts,scale in [(0,[(5.5,3.7),(10.5,3.7),(5.5,10.3),(10.5,10.3)],.85),(3.24,[(.8,5.2),(.8,9.7)],.85),(6.48,[(1,1),(3.5,12.5),(11.7,5.8),(13.7,13.3)],.7),(0,[(1.4,15.3),(4,16.4),(10,16.6),(13.5,15.6)],1.4)]:
 for x,y in pts:tree(x,y,z,scale)
# Herbs replace green slabs within the identical planted border envelopes.
for o in list(s.objects):
 if 'Low aromatic planted border' in o.name:
  p=o.location.copy();d=o.dimensions.copy();o.data.materials.clear();o.data.materials.append(stone);o.dimensions.z=.12;o.location.z=.06
  box('Recessed planting soil',(p.x,p.y,.125),(d.x-.04,d.y-.04,.025),soil,.01)
  for i in range(max(3,int(d.y/.16))):
   cy=p.y-d.y/2+.08+i*.16;leaves((p.x,cy,.30),(.17,.13,.25),100,.045)
# Creeping foliage on courtyard parapet, kept above walking clearances.
for x in [5.45,10.65]:
 for y in [4.1,6.7,9.6]:
  for k in range(5):
   z=3.53-k*.16;leaves((x,y+.05*math.sin(k),z),(.2,.18,.18),55,.055)
# A small real branch arrangement on the dining table.
for i in range(5):
 end=(2.5+random.uniform(-.23,.23),8+random.uniform(-.2,.2),1.4+random.random()*.18);curve('Table olive sprig',[(2.5,8,1.05),end],.003,wood);leaves(end,(.15,.12,.15),40,.045)
o=mesh('Detailed olive and aromatic foliage',leafv,leaff,leaf);o.data.materials.append(silver)
for p in o.data.polygons:p.material_index=1 if random.random()<.23 else 0
# Jointed stone pavers on the same courtyard surface; preserve pool and all routes.
for x0,y0,x1,y1 in [(5,3,7,11),(9,3,11,11),(7,3,9,4.5),(7,9.5,9,11)]:
 nx=math.ceil((x1-x0)/.6);ny=math.ceil((y1-y0)/.9)
 for i in range(nx):
  for j in range(ny):box('Cut limestone courtyard paver',(x0+(i+.5)*(x1-x0)/nx,y0+(j+.5)*(y1-y0)/ny,.003),((x1-x0)/nx-.006,(y1-y0)/ny-.006,.018),stone,.004)
# Water is a transmissive physical interface; no painted opaque teal.
for m in bpy.data.materials:
 if m.name.startswith('Pool water'):
  bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.93,.985,.98,1);bs.inputs['Transmission Weight'].default_value=1;bs.inputs['Roughness'].default_value=.035;bs.inputs['IOR'].default_value=1.333
  for n in m.node_tree.nodes:
   if n.type=='BUMP':n.inputs['Distance'].default_value=.008;n.inputs['Strength'].default_value=.3
# Pool coping detail stays on existing edge, no dimensional changes.
for x in [6.97,9.03]:box('Travertine pool coping',(x,7,.018),(.16,5.16,.08),stone,.012)
for y in [4.47,9.53]:box('Travertine pool coping',(8,y,.018),(2,.16,.08),stone,.012)
# Light source now sits below every shade. Cycles computes actual multi-bounce interiors.
for o in s.objects:
 if o.type=='LIGHT' and 'night_power' in o:o.data.shadow_soft_size=.12
sun=bpy.data.objects.get('Marrakech sun');sun.rotation_euler=(.58,-.4,-.6);sun.data.angle=.08
world=s.world;world.use_nodes=True;wn=world.node_tree.nodes;wl=world.node_tree.links;bg=wn.get('Background');sky=wn.new('ShaderNodeTexSky');sky.sky_type='NISHITA';sky.sun_elevation=.6;sky.sun_rotation=2.7;sky.sun_disc=False;sky.altitude=.45;wl.new(sky.outputs['Color'],bg.inputs[0])
# Low-level warm wall washes, concealed at existing courtyard corners, plus garden uplights.
for x,y,z,power in [(5.35,3.45,.3,32),(10.65,3.45,.3,32),(5.35,10.55,.3,32),(10.65,10.55,.3,32),(1.4,15.3,.25,40),(13.5,15.6,.25,40)]:
 bpy.ops.object.light_add(type='AREA',location=(x,y,z));o=add(bpy.context.object,'Landscape warm uplight');o.rotation_euler=(math.pi,0,0);o.data.shape='DISK';o.data.size=.18;o.data.color=(1,.64,.34);o['night_power']=power
# Keep lighting editable as two reproducible states in a Blender text block.
lighting_code='''import bpy, math
s=bpy.context.scene
night=MODE == 'night'
w=s.world;n=w.node_tree.nodes;l=w.node_tree.links;bg=n.get('Background');sky=next(x for x in n if x.type=='TEX_SKY')
for link in list(bg.inputs[0].links):l.remove(link)
if night:bg.inputs[0].default_value=(.10,.16,.28,1)
else:l.new(sky.outputs['Color'],bg.inputs[0])
bg.inputs[1].default_value=.22 if night else .28
sun=bpy.data.objects['Marrakech sun'];sun.data.energy=.055 if night else 2.2;sun.data.color=(.48,.62,1) if night else (1,.91,.76)
for o in s.objects:
 if o.type=='LIGHT':
  if 'night_power' in o:o.data.energy=o['night_power']*(2.2 if night else .3)
  if 'day_power' in o:o.data.energy=0
s['Lighting mode']=MODE
'''
text=bpy.data.texts.new('Casa Day Night lighting.py');text.write("MODE='day'\n"+lighting_code)
def lighting(mode):exec(lighting_code,{'MODE':mode})
# Cycles Metal, denoising, bounded review settings. No animation requested.
s.render.engine='CYCLES';s.cycles.samples=64;s.cycles.use_denoising=True;s.cycles.adaptive_threshold=.035;s.cycles.max_bounces=10;s.cycles.transmission_bounces=8;s.cycles.transparent_max_bounces=8
prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='METAL';prefs.get_devices()
for device in prefs.devices:device.use=device.type=='METAL'
s.cycles.device='GPU'
s.render.resolution_x=1200;s.render.resolution_y=900;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGB';s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast';s.view_settings.exposure=0
# Model remains intact in every shot: walls and ceilings are never hidden.
shots=[('living-room-day',(4.25,5.45,1.65),(1.8,2.45,1.1),23,'day'),('courtyard-day',(6.25,10.1,1.65),(8.05,3.2,1.8),23,'day'),('courtyard-night',(6.25,10.1,1.65),(8.05,3.2,1.8),23,'night')]
for name,pos,target,lens,mode in shots:
 bpy.ops.object.camera_add(location=pos);o=add(bpy.context.object,'Review / '+name);o.data.lens=lens;o.data.clip_start=.07;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
lighting('day');s.camera=bpy.data.objects['Review / courtyard-day'];s['Visual review status']='Material, upholstery, glazing and botanical refinement. Not approved as photoreal final.'
bpy.ops.wm.save_as_mainfile(filepath=str(R/'Casa-Mirador-P02-Visual-Refinement.blend'))
report={'source':'Casa-Mirador-P02.blend','output':'Casa-Mirador-P02-Visual-Refinement.blend','architecture':'P02 unchanged; refinements to furnishings, surfaces and planting only','engine':'Cycles Metal','samples':64,'renders':[],'limits':'Procedural furniture and foliage, no scanned or manufacturer furniture assets. Review only, no claim of final photorealism.'}
for name,pos,target,lens,mode in shots:
 lighting(mode);s.camera=bpy.data.objects['Review / '+name];s.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True);report['renders'].append({'name':name,'mode':mode,'camera':pos,'lens_mm':lens});(OUT/'review.json').write_text(json.dumps(report,indent=2))
lighting('day');s.camera=bpy.data.objects['Review / courtyard-day'];bpy.ops.wm.save_as_mainfile(filepath=str(R/'Casa-Mirador-P02-Visual-Refinement.blend'))
print('REVIEW COMPLETE',flush=True)
