"""Casa Mirador — editable reference reconstruction, metres, Blender 4.5.
Run: blender -b --python build_casa.py -- --root /path/to/site
Reference precedence: annotated 11.2 x 11.4 m courtyard plan (sequence/04).
Presentation elevations conflict; this is a concept reconstruction, not survey CAD.
"""
import bpy, math, random, json, os, sys, argparse, hashlib
import numpy as np
from mathutils import Vector
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--root',required=True);p.add_argument('--preview',action='store_true');args=p.parse_args(sys.argv[sys.argv.index('--')+1:])
ROOT=Path(args.root);OUT=ROOT/'public/casa-tour';SRC=ROOT/'blender/casa-mirador';OUT.mkdir(parents=True,exist_ok=True);SRC.mkdir(parents=True,exist_ok=True)
random.seed(42);bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
 if c.name!='Collection': bpy.data.collections.remove(c)
base=bpy.data.collections.get('Collection');base.name='Architecture'
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
collections={};colliders=[];lamps=[]
def group(name):
 if name not in collections:
  c=bpy.data.collections.new(name);scene.collection.children.link(c);collections[name]=c
 return collections[name]
current=base

def assign(o,name,mat):
 o.name=name
 for c in list(o.users_collection): c.objects.unlink(o)
 current.objects.link(o)
 if mat:o.data.materials.append(mat)
 return o

def cube(name,loc,scale,mat,bevel=0,collision=False):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);assign(o,name,mat)
 if bevel:
  m=o.modifiers.new('Soft handmade edges','BEVEL');m.width=bevel;m.segments=2
  m=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
 if collision:colliders.append({'minX':loc[0]-scale[0]/2,'maxX':loc[0]+scale[0]/2,'minZ':-loc[1]-scale[1]/2,'maxZ':-loc[1]+scale[1]/2})
 return o

def uvball(name,loc,scale,mat,segments=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=8,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);assign(o,name,mat)
 for f in o.data.polygons:f.use_smooth=True
 return o

def cylinder(name,loc,radius,depth,mat,vertices=24,r2=None):
 bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=radius,radius2=radius if r2 is None else r2,depth=depth,location=loc);o=bpy.context.object;assign(o,name,mat)
 for f in o.data.polygons:f.use_smooth=True
 return o

def rod(name,a,b,r,mat):
 a,b=Vector(a),Vector(b);o=cylinder(name,(a+b)/2,r,(b-a).length,mat,12);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o

def material(name,col,rough=.7,metal=0,texture=None,bump=.05):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=n.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=rough;bs.inputs['Metallic'].default_value=metal
 if texture:
  size=512;yy,xx=np.mgrid[0:size,0:size]/size;rng=np.random.default_rng(23)
  noise=rng.random((size,size))
  if texture=='wood':v=.86+.12*np.sin(xx*140+4*np.sin(yy*8)+2*np.sin(xx*33))+noise*.07
  elif texture=='linen':v=.90+.045*np.sin(xx*440)+.045*np.sin(yy*440)+noise*.08
  elif texture=='stone':v=.92+.035*np.sin(xx*24+np.sin(yy*35)*2)+noise*.07-(noise>.991)*.2
  else:v=.96+.025*np.sin(xx*23+yy*30)+noise*.06
  pix=np.ones((size,size,4),dtype=np.float32)
  for i in range(3):pix[:,:,i]=np.clip(col[i]*v,0,1)
  img=bpy.data.images.new(name+' · albedo',width=size,height=size);img.pixels.foreach_set(pix.ravel());img.filepath_raw=str(SRC/(name.replace(' ','_')+'.png'));img.file_format='PNG';img.save();img.pack()
  t=n.new('ShaderNodeTexImage');t.image=img;l.new(t.outputs['Color'],bs.inputs['Base Color'])
  # World-scale noise keeps render plaster texture consistent on differently sized walls.
  noise_node=n.new('ShaderNodeTexNoise');noise_node.inputs['Scale'].default_value=130 if texture!='wood' else 25;noise_node.inputs['Detail'].default_value=3
  bn=n.new('ShaderNodeBump');bn.inputs['Strength'].default_value=.2;bn.inputs['Distance'].default_value=bump;l.new(noise_node.outputs['Fac'],bn.inputs['Height']);l.new(bn.outputs['Normal'],bs.inputs['Normal'])
 return m
plaster=material('Warm tadelakt',(.68,.54,.37),.84,texture='plaster',bump=.025)
stone=material('Honed travertine',(.69,.59,.44),.6,texture='stone',bump=.018)
wood=material('Natural walnut',(.24,.115,.048),.55,texture='wood',bump=.008)
linen=material('Ivory linen',(.79,.74,.61),.93,texture='linen',bump=.007)
olive=material('Olive linen',(.22,.25,.12),.95,texture='linen',bump=.006)
terra=material('Hand fired terracotta',(.40,.22,.12),.9,texture='plaster',bump=.015)
brass=material('Aged bronze',(.38,.23,.08),.28,.75)
jute=material('Woven jute',(.34,.25,.135),.95,texture='linen',bump=.016)
leafmat=material('Olive foliage',(.12,.18,.065),.7)
leaflight=material('Sunlit foliage',(.22,.28,.10),.7)
trunkmat=material('Olive bark',(.18,.14,.075),.95,texture='wood',bump=.025)
black=material('Dark iron',(.025,.023,.018),.4,.65)
cream=material('Ceramic ivory',(.69,.64,.52),.3)
teal=material('Green zellige',(.045,.19,.155),.2)
grout=material('Warm grout',(.35,.30,.22),.9)
water=material('Pool water',(.07,.24,.23),.12);bs=water.node_tree.nodes.get('Principled BSDF');bs.inputs['Transmission Weight'].default_value=.55;bs.inputs['IOR'].default_value=1.333
noise=water.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=16;bn=water.node_tree.nodes.new('ShaderNodeBump');bn.inputs['Strength'].default_value=.22;bn.inputs['Distance'].default_value=.025;water.node_tree.links.new(noise.outputs['Fac'],bn.inputs['Height']);water.node_tree.links.new(bn.outputs['Normal'],bs.inputs['Normal'])
glow=material('Lamp glass',(.9,.65,.28),.3);bs=glow.node_tree.nodes.get('Principled BSDF');bs.inputs['Emission Color'].default_value=(1,.5,.16,1);bs.inputs['Emission Strength'].default_value=.7

# Continuous walking floor, with a real recessed pool opening. Plan 11.2 x 11.4 m.
current=base
cube('Foundation',(5.6,5.7,-.48),(11.8,12,.5),stone)
for x,y,w,d in [(1.75,5.7,3.5,11.4),(9.45,5.7,3.5,11.4),(5.6,1.8,4.2,3.6),(5.6,9.6,4.2,3.6),(4.15,5.7,1.3,4.2),(7.05,5.7,1.3,4.2)]:
 cube('Floor substrate',(x,y,-.085),(w,d,.16),grout)
 # Cut stone laid to room boundaries without filling pool.
 nx=max(1,round(w/.48));ny=max(1,round(d/.48))
 for i in range(nx):
  for j in range(ny):cube('Limestone floor tile',(x-w/2+(i+.5)*w/nx,y-d/2+(j+.5)*d/ny,-.007),(w/nx-.008,d/ny-.008,.035),stone,.008)
# Outside arrival is level to preserve eye-height traversal; no hidden flying over stairs.
cube('Arrival paving',(5.6,12.1,-.08),(4.2,1.4,.16),stone,.02)

def wall(name,a,b,height=3.5,thick=.24):
 x1,y1=a;x2,y2=b;return cube(name,((x1+x2)/2,(y1+y2)/2,height/2),(abs(x2-x1)+thick,abs(y2-y1)+thick,height),plaster,.025,True)

def arch(name,axis,fixed,start,end,openings,height=3.5,thick=.26):
 """Segmented wall plus real curved opening soffits, with collision only on solid piers."""
 openings=sorted(openings);cursor=start
 def pt(t):return (t,fixed) if axis=='X' else (fixed,t)
 for center,width,spring in openings:
  left=center-width/2;right=center+width/2
  if left>cursor:wall(name+' pier',pt(cursor+thick/2),pt(left-thick/2),height,thick)
  # Extruded area above semicircular arc; no boolean hidden geometry.
  r=width/2;segments=32;verts=[];faces=[]
  for i in range(segments+1):
   t=left+width*i/segments;z=spring+math.sqrt(max(0,r*r-(t-center)**2))
   for offset,top in [(-thick/2,z),(thick/2,z),(-thick/2,height),(thick/2,height)]:
    verts.append((t,fixed+offset,top) if axis=='X' else (fixed+offset,t,top))
  for i in range(segments):
   a=i*4;b=(i+1)*4;faces.extend([(a,b,b+1,a+1),(a+2,a+3,b+3,b+2),(a,a+2,b+2,b),(a+1,b+1,b+3,a+3)])
  faces.extend([(0,1,3,2),(4*segments,4*segments+2,4*segments+3,4*segments+1)])
  mesh=bpy.data.meshes.new(name+' arch mesh');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name+' curved soffit',mesh);current.objects.link(o);o.data.materials.append(plaster)
  mod=o.modifiers.new('Soft arch edges','BEVEL');mod.width=.012;mod.segments=2
  cursor=right
 if cursor<end:wall(name+' pier',pt(cursor+thick/2),pt(end-thick/2),height,thick)

wall('West exterior',(0,0),(0,11.4));wall('East exterior',(11.2,0),(11.2,11.4))
wall('South kitchen',(0,0),(3.5,0));wall('South bedroom',(7.7,0),(11.2,0));wall('North living',(0,11.4),(3.5,11.4));wall('North bedroom',(7.7,11.4),(11.2,11.4))
arch('Arrival facade','X',11.4,3.5,7.7,[(5.6,1.7,1.8)])
arch('South courtyard loggia','X',0,3.5,7.7,[(4.55,1.65,1.75),(6.65,1.65,1.75)])
wall('Loggia back wall',(3.5,-1.25),(7.7,-1.25));wall('Loggia west',(3.5,-1.25),(3.5,0));wall('Loggia east',(7.7,-1.25),(7.7,0))
cube('Loggia floor',(5.6,-.62,-.06),(4.2,1.25,.12),stone)
cube('Loggia ceiling',(5.6,-.62,3.55),(4.4,1.5,.2),plaster,.02)
arch('Living court arches','Y',3.5,0,11.4,[(2.1,1.65,1.8),(6.35,1.1,1.95),(9.5,2.0,1.75)])
arch('Bedroom court arches','Y',7.7,0,11.4,[(2.0,1.4,1.9),(6.0,1.1,1.95),(9.45,1.4,1.9)])
arch('Living kitchen connection','X',7.65,0,3.5,[(2.65,1.1,1.95)])
wall('Bedroom one partition',(7.7,7.8),(11.2,7.8));wall('Bedroom two partition',(7.7,3.6),(11.2,3.6))
# Middle service core: accessible vestibule, bathroom and stair volume per annotated plan.
arch('Bathroom threshold','X',5.4,7.7,9.45,[(8.6,.85,1.95)]);wall('Stair enclosure',(9.6,3.6),(9.6,7.8))
for i in range(18):cube('Stair tread %02d'%i,(10.38,3.9+i*.205,(i+1)*.188/2),(1.4,.205,(i+1)*.188),stone,.008,True)
# Roofs over wings; stair opening in east roof, roof parapets visible from courtyard.
for x in [1.75,9.45]:
 if x<5:cube('Living kitchen roof',(x,5.7,3.62),(3.5,11.4,.24),plaster,.02)
 else:
  cube('Bedroom roofs south',(x,1.8,3.62),(3.5,3.6,.24),plaster,.02);cube('Bedroom roofs north',(x,9.6,3.62),(3.5,3.6,.24),plaster,.02);cube('Service roof',(8.65,5.7,3.62),(1.9,4.2,.24),plaster,.02)
 for y in np.arange(.45,11.1,.85):cube('Coffered ceiling transverse beam',(x,float(y),3.38),(3.4,.13,.22),plaster,.015)
 for xx in [x-1.05,x,x+1.05]:cube('Coffered ceiling longitudinal beam',(xx,5.7,3.38),(.12,11.2,.22),plaster,.015)
 for xx in [x-1.65,x+1.65]:cube('Roof parapet',(xx,5.7,4.03),(.18,11.4,.68),plaster,.025)
 for yy in [0,11.4]:cube('Roof parapet end',(x,yy,4.03),(3.5,.18,.68),plaster,.025)
# Far facade wooden door and loggia bench.
for k in range(9):cube('Traditional door plank',(6.65+(k-4)*.12,-1.105,1.12),(.115,.08,2.24),wood,.009)
for z in [.25,1.25,2.0]:cube('Door cross brace',(6.65,-1.04,z),(1.15,.06,.06),black,.01)
cylinder('Door pull',(6.65,-.98,1.05),.065,.035,brass).rotation_euler.x=math.pi/2
cube('Loggia bench seat',(4.55,-.65,.43),(1.4,.6,.16),wood,.04);cube('Loggia bench cushion',(4.55,-.65,.56),(1.35,.57,.16),linen,.07);cube('Loggia bench back',(4.55,-.94,.85),(1.4,.13,.64),wood,.04)
for x in [4.05,5.05]:cube('Bench pillow',(x,-.82,.9),(.42,.17,.43),olive,.07)

current=group('Courtyard • water and landscape')
# Physical pool shell and tiled floor.
cube('Pool basin',(5.6,5.7,-.9),(1.6,4.2,.16),teal)
for x in [4.75,6.45]:cube('Pool coping',(x,5.7,.045),(.25,4.5,.12),stone,.025)
for y in [3.5,7.9]:cube('Pool coping',(5.6,y,.045),(1.95,.25,.12),stone,.025)
for x in [4.83,6.37]:cube('Pool inner side',(x,5.7,-.45),(.06,4.2,.9),teal)
for y in [3.63,7.77]:cube('Pool inner end',(5.6,y,-.45),(1.6,.06,.9),teal)
for i in range(8):
 for j in range(21):cube('Zellige pool tile',(4.9+i*.2,3.7+j*.2,-.803),(.193,.193,.015),teal,.006)
# Ripple mesh is real geometry, also survives glTF export.
verts=[];faces=[];nx=30;ny=80
for j in range(ny+1):
 for i in range(nx+1):
  x=4.85+1.5*i/nx;y=3.65+4.1*j/ny;z=-.18+.006*math.sin(x*27+y*15)+.003*math.sin(y*38-x*7);verts.append((x,y,z))
for j in range(ny):
 for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
mesh=bpy.data.meshes.new('Water ripples');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('Pool water · physical surface',mesh);current.objects.link(o);o.data.materials.append(water)
for f in mesh.polygons:f.use_smooth=True
colliders.append({'minX':4.65,'maxX':6.55,'minZ':-8.04,'maxZ':-3.36})

def pot(x,y,r=.25,h=.55):
 cylinder('Terracotta planter',(x,y,h*.48),r*.72,h*.96,terra,24,r2=r);cylinder('Planter rim',(x,y,h-.02),r*1.05,.065,terra,24);cylinder('Soil',(x,y,h+.015),r*.9,.025,trunkmat,24)
 return h

def tree(x,y,size=1):
 h=pot(x,y,.24*size,.48*size);top=h+1.1*size;rod('Olive trunk',(x,y,h),(x+.07*size,y,top),.035*size,trunkmat)
 # Geometry leaves merged into a single mesh per tree for efficient render/export.
 vs=[];fs=[]
 for k in range(13):
  ang=k*2.4;z=top-.5*size+random.random()*.6*size;end=Vector((x+math.cos(ang)*.6*size,y+math.sin(ang)*.6*size,z+.25*size));start=Vector((x,y,z-.25*size));rod('Olive branch',start,end,.009*size,trunkmat)
  for j in range(14):
   t=.2+.8*j/14;pos=start.lerp(end,t);pos+=Vector((random.uniform(-.13,.13)*size,random.uniform(-.13,.13)*size,random.uniform(-.08,.08)*size));a=ang+random.uniform(-1.4,1.4);v=Vector((math.cos(a),math.sin(a),.3))*.10*size;w=Vector((-math.sin(a),math.cos(a),.1))*.025*size;n=len(vs);vs.extend([tuple(pos-v),tuple(pos+w),tuple(pos+v),tuple(pos-w)]);fs.append((n,n+1,n+2,n+3))
 me=bpy.data.meshes.new('Olive leaves');me.from_pydata(vs,[],fs);me.update();ob=bpy.data.objects.new('Olive canopy',me);current.objects.link(ob);ob.data.materials.append(leafmat)
 colliders.append({'minX':x-.25*size,'maxX':x+.25*size,'minZ':-y-.25*size,'maxZ':-y+.25*size})
for x,y,s in [(3.95,8.15,1.0),(7.25,8.2,.85),(3.94,3.05,.8),(7.25,3.05,.8),(3.95,.55,.9),(7.25,.55,1.0),(3.95,10.75,.85),(7.25,10.75,.85),(.55,10.8,1),(10.65,10.8,.8),(10.7,.6,.8),(.55,.6,.7)]:tree(x,y,s)
# Slender palm in courtyard, clear of walking edges.
x,y=7.18,6.2;pot(x,y,.27,.5);rod('Palm trunk',(x,y,.5),(x-.07,y,3.7),.075,trunkmat)
for k in range(9):
 a=k*math.tau/9;pts=[]
 for j in range(8):
  t=j/7;pts.append(Vector((x+math.cos(a)*1.1*t,y+math.sin(a)*1.1*t,3.7+.55*math.sin(t*math.pi)-.28*t)))
 for a1,b1 in zip(pts[:-1],pts[1:]):rod('Palm rachis',a1,b1,.012,leaflight)
 for j in range(1,8):
  for side in [-1,1]:
   q=pts[j];d=Vector((-math.sin(a),math.cos(a),-.45))*side*.3*(1-j/9);rod('Palm leaflet',q,q+d,.018,leafmat)

current=group('Living • bespoke furniture')
# Living at north-west, exactly as labelled in the annotated plan.
cube('Living woven rug',(1.55,9.45,.025),(2.5,2.8,.025),jute,.02)
cube('Sofa walnut plinth',(.67,9.4,.23),(.78,2.55,.24),wood,.05,True)
cube('Sofa back',(.28,9.4,.70),(.22,2.6,.85),linen,.1)
for y in [8.55,9.38,10.21]:
 cube('Sofa seat',(.68,y,.48),(.9,.81,.24),linen,.10);o=cube('Sofa back cushion',(.43,y,.83),(.25,.73,.53),linen,.09);o.rotation_euler.y=-.14
for y in [8.16,10.67]:cube('Sofa arm',(.69,y,.67),(.9,.19,.6),linen,.08)
for y in [8.55,10.2]:o=cube('Olive scatter cushion',(.72,y,.8),(.17,.42,.42),olive,.07);o.rotation_euler.y=-.3
cylinder('Travertine coffee top',(1.7,9.35,.43),.48,.1,stone,48)
for a in [0,2.094,4.188]:cylinder('Coffee table cylinder leg',(1.7+math.cos(a)*.27,9.35+math.sin(a)*.27,.2),.12,.4,stone)
colliders.append({'minX':1.18,'maxX':2.22,'minZ':-9.87,'maxZ':-8.83})

def vase(x,y,z,r=.09,h=.22):
 cylinder('Ceramic vessel',(x,y,z+h/2),r,h,terra,20,r2=r*.7);cylinder('Vessel lip',(x,y,z+h),r*.76,.025,terra,20)
 for k in range(5):rod('Vase olive stem',(x,y,z+h),(x+random.uniform(-.2,.2),y+random.uniform(-.18,.18),z+h+.3),.004,leafmat)
vase(1.7,9.4,.49)
for i in range(3):cube('Art book',(1.75,9.12,.51+i*.023),(.22,.16,.022),linen,.005)
# Wall art, low relief and bronze sconces.
cube('Living artwork frame',(.14,9.4,1.85),(.045,1.0,1.05),wood,.015);cube('Living artwork linen',(.17,9.4,1.85),(.015,.9,.95),linen)
for z in [1.0,1.5,2.0]:cube('Living display shelf',(1.25,11.17,z),(1.8,.23,.055),wood,.01);vase(1.1,11.12,z+.03)

current=group('Kitchen • dining')
# West wall kitchen and south return, with passage along eastern edge.
for y in [1.05,1.75,2.45,3.15,3.85]:
 cube('Kitchen base unit',(.5,y,.45),(.72,.68,.88),wood,.015,True);cube('Cabinet inset face',(.88,y,.48),(.035,.60,.74),wood,.008);rod('Cabinet handle',(.91,y-.14,.72),(.91,y+.14,.72),.009,brass)
cube('Travertine counter',(.5,2.45,.93),(.82,3.55,.09),stone,.02)
for z in [1.45,1.95]:
 cube('Kitchen open shelf',(.32,2.35,z),(.43,3.15,.07),wood,.012)
 for y in [.95,1.35,2.6,3.3]:vase(.38,y,z+.045,.075,.16)
# Sink rim/basin, metal faucet, hob.
cube('Sink dark inset',(.53,1.55,.98),(.48,.52,.018),black,.06)
rod('Tap upright',(.28,1.55,.98),(.28,1.55,1.32),.018,brass);rod('Tap spout',(.28,1.55,1.32),(.52,1.55,1.32),.018,brass)
cube('Hob',(.5,3.1,.986),(.55,.56,.02),black,.02)
for y in [2.95,3.25]:
 for x in [.36,.65]:cylinder('Hob burner',(x,y,1.002),.085,.012,black)
cube('Oven glass',(.914,3.1,.49),(.018,.5,.43),black,.02);rod('Oven handle',(.94,2.88,.72),(.94,3.32,.72),.012,brass)
cube('South tall cupboard',(.6,.3,1.2),(1,.42,2.4),wood,.025,True)
cube('Dining table top',(1.65,5.2,.77),(1.5,1.9,.09),wood,.035,True)
for x in [1.03,2.27]:
 for y in [4.4,6.0]:cube('Dining table leg',(x,y,.37),(.11,.12,.74),wood,.014)

def chair(x,y,angle=0):
 parts=[]
 parts.append(cube('Cane chair seat',(x,y,.46),(.48,.48,.09),jute,.025))
 for xx in [-.18,.18]:
  for yy in [-.18,.18]:parts.append(cube('Chair oak leg',(x+xx,y+yy,.23),(.045,.045,.46),wood,.012))
 parts.append(cube('Chair back frame',(x,y+.22,.79),(.49,.05,.6),wood,.025));parts.append(cube('Woven chair back',(x,y+.215,.79),(.40,.06,.46),jute,.012))
 for ob in parts:
  v=ob.location-Vector((x,y,0));ob.location=Vector((x+v.x*math.cos(angle)-v.y*math.sin(angle),y+v.x*math.sin(angle)+v.y*math.cos(angle),v.z));ob.rotation_euler.z+=angle
for x,y,a in [(1.2,4.0,math.pi),(2.05,4.0,math.pi),(1.2,6.4,0),(2.05,6.4,0)]:chair(x,y,a)
vase(1.65,5.2,.82,.12,.26)
for y in [4.65,5.75]:
 for x in [1.2,2.1]:cylinder('Ceramic dinner plate',(x,y,.825),.14,.015,cream,32)

current=group('Bedrooms • linen and oak')
for cy in [1.8,9.6]:
 cube('Bedroom woven rug',(9.5,cy,.023),(2.8,2.9,.03),jute,.02)
 cube('Bed oak frame',(9.65,cy,.25),(1.8,2.15,.3),wood,.04,True)
 cube('Bed mattress',(9.65,cy,.5),(1.78,2.10,.27),linen,.10)
 cube('Bed linen duvet',(9.65,cy-.13,.66),(1.85,1.85,.18),linen,.09)
 cube('Bed headboard',(9.65,cy+1.1,.8),(1.95,.12,1.25),linen,.07)
 for x in [9.22,10.08]:cube('Sleeping pillow',(x,cy+.68,.83),(.72,.42,.17),linen,.085)
 cube('Olive bed throw',(9.65,cy-.65,.775),(1.88,.55,.045),olive,.035)
 for x in [8.4,10.88]:cylinder('Bedside travertine table',(x,cy+.7,.42),.22,.11,stone,32);cylinder('Bedside pedestal',(x,cy+.7,.2),.13,.4,stone);vase(x,cy+.7,.48,.065,.16)
 cube('Relief art backing',(9.65,cy+1.23,1.95),(1.2,.06,.85),stone,.02)
 for i in range(7):cube('Handmade plaster relief',(9.2+i*.15,cy+1.19,1.95),(.025,.035,.7),plaster,.01)
# Bathroom fittings in service core.
current=group('Bath and circulation')
cube('Bathroom vanity',(8.55,3.93,.46),(1.1,.52,.85),wood,.02,True);cube('Vanity stone',(8.55,3.93,.92),(1.15,.58,.08),stone,.02);uvball('Basin',(8.55,3.93,.98),(.27,.18,.09),cream)
cube('Vanity mirror',(8.55,3.75,1.65),(.8,.025,.8),brass,.03)
cube('Shower stone base',(8.65,7.15,.06),(1.2,1.05,.12),stone,.02);rod('Shower rail',(8.05,7.5,1),(8.05,7.5,2.3),.02,brass);rod('Shower head',(8.05,7.5,2.3),(8.35,7.5,2.3),.02,brass)

# Rooftop lounge, physically above west wing, reached by real stair but excluded
# from flat-floor browser route until multi-height navigation is implemented.
current=group('Roof terrace')
for y in [2.5,5.5]:
 for x in [.3,3.2]:cube('Pergola post',(x,y,4.75),(.12,.12,2.0),wood,.015)
for y in np.arange(2.3,5.8,.22):cube('Pergola timber shade',(1.75,float(y),5.79),(3.2,.09,.10),wood,.015)
cube('Roof lounge plinth',(1.65,3.2,4.0),(2.3,.8,.38),wood,.05);cube('Roof lounge seat',(1.65,3.2,4.25),(2.25,.78,.15),linen,.07);cube('Roof lounge back',(1.65,2.88,4.5),(2.3,.15,.65),linen,.07)
for x in [.6,2.9]:pot(x,6.4,.25,.55)

# Lights: separate editable day and night rigs share the identical geometry/camera.
current=group('Lighting fixtures')
def point(name,pos,power,color=(1,.58,.28),radius=.20):
 data=bpy.data.lights.new(name,'POINT');data.energy=power;data.color=color;data.shadow_soft_size=radius;o=bpy.data.objects.new(name,data);group('Night lighting').objects.link(o);o.location=pos
 lamps.append({'position':[pos[0],pos[2],-pos[1]],'color':'#ffbd78' if color[0]>.5 else '#78d4d2','intensity':power/6,'distance':7})
 return o

def pendant(x,y,z=2.65,power=65):
 rod('Pendant flex',(x,y,3.38),(x,y,z+.1),.009,black)
 # Lathed bell shade: proper hollow underside, metallic exterior.
 vs=[];fs=[];profile=[(.035,z+.18),(.09,z+.14),(.16,z+.07),(.23,z-.04),(.24,z-.09)]
 for r,h in profile:
  for i in range(32):a=i*math.tau/32;vs.append((x+r*math.cos(a),y+r*math.sin(a),h))
 for j in range(len(profile)-1):
  for i in range(32):a=j*32+i;b=j*32+(i+1)%32;fs.append((a,b,b+32,a+32))
 me=bpy.data.meshes.new('Bronze pendant');me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new('Handmade bronze pendant shade',me);current.objects.link(o);o.data.materials.append(brass)
 uvball('Warm pendant bulb',(x,y,z-.06),(.055,.055,.06),glow);point('Pendant light',(x,y,z-.13),power)
for x,y in [(1.65,4.7),(1.65,5.7),(4.55,-.65),(6.65,-.65),(5.6,10.75),(8.4,2.5),(10.8,2.5),(8.4,10.3),(10.8,10.3)]:pendant(x,y,2.7,90)
for x,y in [(3.72,4.4),(7.48,4.4),(3.72,7.1),(7.48,7.1),(.22,9.5),(10.98,9.5)]:
 cube('Wall sconce bronze',(x,y,2.05),(.10,.18,.3),brass,.025);point('Wall wash',(x,y,2.15),70)
for y in [4.2,7.1]:point('Pool light',(5.6,y,-.05),30,(.25,.7,.7),.08)
for x,y in [(1.5,9.5),(1.5,2.5),(9.5,9.5),(9.5,1.5),(8.7,6.3)]:point('Soft interior bounce',(x,y,2.95),95,(1,.7,.45),.65)
# Day rig sun and soft window fill; actual lamps only strong in night mode.
current=group('Day lighting')
data=bpy.data.lights.new('Marrakech afternoon sun','SUN');data.energy=2.8;data.angle=math.radians(12);o=bpy.data.objects.new('Marrakech afternoon sun',data);current.objects.link(o);o.rotation_euler=(math.radians(25),math.radians(-30),math.radians(-35))
for pos,target,power,size in [((5.6,5.7,8),(5.6,5.7,0),1100,7),((3.3,9.4,2.7),(0,9.4,1.3),220,2),((3.3,2.0,2.7),(0,2,1.3),220,2),((7.9,9.4,2.7),(11,9.4,1.3),180,1.4),((7.9,2,2.7),(11,2,1.3),180,1.4)]:
 d=bpy.data.lights.new('Day portal fill','AREA');d.energy=power;d.shape='DISK';d.size=size;ob=bpy.data.objects.new('Day portal fill',d);current.objects.link(ob);ob.location=pos;ob.rotation_euler=(Vector(target)-Vector(pos)).to_track_quat('-Z','Y').to_euler()
world=bpy.data.worlds.new('Marrakech daylight');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.54,.68,.85,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5;scene.world=world
# Smooth continuous route, rounded corners sampled by arc length, no camera cuts.
current=group('Camera and route')
nodes=[(5.6,12.25),(5.6,9.5),(4.25,9.5),(2.65,9.5),(2.65,8.15),(2.65,6.9),(2.85,5.2),(2.75,2.1),(4.25,2.1),(6.9,2.0),(8.5,2.0)]
# Round each corner with a quadratic segment; retains doorway alignment.
path=[Vector(nodes[0])]
for i in range(1,len(nodes)-1):
 a,b,c=map(Vector,(nodes[i-1],nodes[i],nodes[i+1]));r=min(.38,(b-a).length*.25,(c-b).length*.25);s=b+(a-b).normalized()*r;e=b+(c-b).normalized()*r
 last=path[-1];n=max(2,int((s-last).length*30))
 path.extend(last.lerp(s,t/n) for t in range(1,n+1))
 for j in range(1,25):t=j/24;path.append((1-t)**2*s+2*(1-t)*t*b+t*t*e)
last=path[-1];end=Vector(nodes[-1]);path.extend(last.lerp(end,j/40) for j in range(1,41))
dists=[0]
for a,b in zip(path[:-1],path[1:]):dists.append(dists[-1]+(b-a).length)
def sample(distance):
 import bisect
 i=min(len(path)-2,max(0,bisect.bisect_right(dists,distance)-1));t=max(0,min(1,(distance-dists[i])/(dists[i+1]-dists[i])));return path[i].lerp(path[i+1],t)
# Corridor collision audit, eye-height geometry and fixed obstacles.
violations=[]
for i,pt in enumerate(path):
 x,y=pt
 for c in colliders:
  r=.17
  if c['minX']-r<x<c['maxX']+r and c['minZ']-r<-y<c['maxZ']+r:violations.append({'sample':i,'position':list(pt),'obstacle':c});break
if violations: print('ROUTE_COLLISIONS',json.dumps(violations[:10]));raise RuntimeError('Walking route intersects solid objects; correct before rendering.')
bpy.ops.object.camera_add(location=(5.6,12.25,1.65));camera=bpy.context.object;assign(camera,'Walking camera · 1.65 m',None);camera.data.lens=23;camera.data.clip_start=.06;scene.camera=camera
fps=24;duration=round(dists[-1]/.80+2);frames=duration*fps;scene.render.fps=fps;scene.frame_start=1;scene.frame_end=frames
for f in range(1,frames+1):
 t=(f-1)/(frames-1);distance=dists[-1]*t;p2=sample(distance);look=sample(min(dists[-1],distance+.8));
 if (look-p2).length<.02:look=p2+(path[-1]-path[-2]).normalized()
 # Final view turns toward the bedroom without leaving the route.
 pos=Vector((p2.x,p2.y,1.65));aim=Vector((look.x,look.y,1.62));camera.location=pos;camera.rotation_euler=(aim-pos).to_track_quat('-Z','Y').to_euler();camera.keyframe_insert(data_path='location',frame=f);camera.keyframe_insert(data_path='rotation_euler',frame=f)
for fc in camera.animation_data.action.fcurves:
 for key in fc.keyframe_points:key.interpolation='LINEAR'
# Editable guide curve, hidden in renders and GLB.
cu=bpy.data.curves.new('Walking path guide','CURVE');cu.dimensions='3D';sp=cu.splines.new('POLY');sp.points.add(len(path)-1)
for v,pt in zip(sp.points,path):v.co=(pt.x,pt.y,1.65,1)
ob=bpy.data.objects.new('Walking path · collision checked',cu);current.objects.link(ob);ob.hide_render=True
scene.render.engine='CYCLES' if False else 'BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=32;scene.render.resolution_x=1280;scene.render.resolution_y=720;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.4
scene.render.fps=24;scene.render.use_file_extension=True;scene.render.image_settings.color_mode='RGB';scene.render.image_settings.compression=25
scene['Reference plan']='sequence/04.webp · 11.2 x 11.4 m / pool 1.6 x 4.2 m';scene['Reconstruction scope']='Concept reconstruction from presentation references; not surveyed construction documentation.';scene['Walking route metres']=round(dists[-1],3);scene['Walking eye height']=1.65;scene['Same route for day and night']=True
# Save lights' nominal powers for deterministic render modes.
for o in bpy.data.objects:
 if o.type=='LIGHT':o['nominal_energy']=o.data.energy

def lighting(mode):
 night=mode=='night'
 for o in group('Day lighting').objects:o.data.energy=o['nominal_energy']*(.035 if night else 1)
 for o in group('Night lighting').objects:o.data.energy=o['nominal_energy']*(1 if night else .08)
 scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.025,.045,.1,1) if night else (.54,.68,.85,1)
 scene.world.node_tree.nodes['Background'].inputs[1].default_value=.25 if night else .5
 scene['Lighting mode']=mode
lighting('day');scene.frame_set(80)
# glTF PBR mesh export, excludes cameras/lights and guide. Applied bevels retained.
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
 if o.type=='MESH':o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'casa-mirador.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True,export_materials='EXPORT')
routehash=hashlib.sha256(json.dumps(nodes).encode()).hexdigest()
manifest={'bounds':{'minX':.14,'maxX':11.06,'minZ':-12.7,'maxZ':1.1},'spawn':{'position':[5.6,1.65,-10.5],'yaw':math.pi},'rooms':[{'id':'courtyard','name':'Courtyard','position':[5.6,1.65,-9.5],'yaw':math.pi},{'id':'living','name':'Living room','position':[2.65,1.65,-9.5],'yaw':math.pi/2},{'id':'kitchen','name':'Kitchen & dining','position':[2.8,1.65,-2.2],'yaw':math.pi/2},{'id':'bedroom-1','name':'Bedroom I','position':[8.35,1.65,-9.45],'yaw':-math.pi/2},{'id':'bedroom-2','name':'Bedroom II','position':[8.35,1.65,-2.0],'yaw':-math.pi/2}], 'colliders':colliders,'lights':lamps,'videos':{'day':'/public/casa-tour/day.mp4','night':'/public/casa-tour/night.mp4'},'posters':{'day':'/public/casa-tour/day.webp','night':'/public/casa-tour/night.webp'},'route':{'hash':routehash,'lengthMetres':round(dists[-1],3),'eyeHeight':1.65,'frames':frames,'fps':fps,'durationSeconds':duration,'collisionAudit':'passed','points':[[round(v.x,4),1.65,round(-v.y,4)] for v in path[::10]]},'notes':'Reference-based concept reconstruction. Ground-floor navigation; roof and stair geometry are included, but rooftop walking is not enabled.'}
(OUT/'tour.json').write_text(json.dumps(manifest,indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'Casa-Mirador.blend'),compress=True)
print('CASA_BUILD_COMPLETE',json.dumps({'objects':len(bpy.data.objects),'routeMetres':dists[-1],'frames':frames,'duration':duration,'glbBytes':(OUT/'casa-mirador.glb').stat().st_size}))
if args.preview:
 scene.frame_set(80);scene.render.filepath=str(OUT/'day-preview.png');bpy.ops.render.render(write_still=True)
 lighting('night');scene.render.filepath=str(OUT/'night-preview.png');bpy.ops.render.render(write_still=True)
