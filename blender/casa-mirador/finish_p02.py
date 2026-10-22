"""Finish APPROVED P02 without moving enclosure lines or rooms. Blender 4.5."""
import bpy,math,random,json,sys,argparse,hashlib
import numpy as np
from pathlib import Path
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--root',required=True);a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);ROOT=Path(a.root);SRC=ROOT/'blender/casa-mirador';OUT=ROOT/'public/casa-tour';OUT.mkdir(exist_ok=True,parents=True)
APP=SRC/'approval';locked={n:hashlib.sha256((APP/n).read_bytes()).hexdigest() for n in ['proposal.json','layout-geometry.json','ground-plan.svg','upper-plan.svg','roof-plan.svg']};(SRC/'P02-LOCK.json').write_text(json.dumps({'approved':True,'instruction':'P02 final approval; dimensions and spatial arrangement locked','sha256':locked},indent=2))
data=json.loads((APP/'layout-geometry.json').read_text());bpy.ops.wm.open_mainfile(filepath=str(APP/'Casa-Mirador-300sqm-PROPOSAL.blend'));scene=bpy.context.scene;random.seed(42)
# Reuse successful furniture / procedural material helpers from the earlier study, never its architecture.
base=bpy.data.collections.get('Ground');source=(SRC/'build_casa.py').read_text();exec(source[source.index('collections={};colliders=[];lamps=[]'):source.index('# Continuous walking floor')])
# Existing architecture remains at P02 coordinates. Replace schematic surfaces with PBR materials.
lookup={'Warm tadelakt':plaster,'Honed travertine':stone,'Oak and cedar':wood,'Natural linen':linen,'Olive planting':leafmat,'Green zellige pool':water,'Bronze':brass,'Glazing indication':None,'Garden soil':terra}
glass=material('Clear architectural glazing',(.83,.93,.93),.12);g=glass.node_tree.nodes['Principled BSDF'];g.inputs['Transmission Weight'].default_value=1;g.inputs['IOR'].default_value=1.45
lookup['Glazing indication']=glass
removePrefixes=['Sofa','Chaise','Coffee table','Dining table','Dining chair','Kitchen cabinets','Island','Pantry shelving','Bed','Shower','Vanity','WC','Dressing','Bath','Library sofa','Office desk','Roof lounge','Roof dining','Outdoor kitchen','Olive canopy','Olive trunk','Terracotta planter','Pool water','Courtyard paving','Arch upper lintel','Arched window glazing']
for o in list(bpy.data.objects):
 if o.type in ['LIGHT','CAMERA'] or o.name.startswith('Olive canopy') or any(o.name==q or o.name.startswith(q+'.') for q in removePrefixes):bpy.data.objects.remove(o,do_unlink=True);continue
 if o.type!='MESH':continue
 for i,m in enumerate(o.data.materials):
  if m:
   for key,new in lookup.items():
    if m.name.startswith(key):o.data.materials[i]=new;break
 # Seal the 50mm schematic wall / slab joint without altering floor heights.
 if o.name.startswith(('GF ','Upper ')) and 'wall' in o.name:
  bottom=o.location.z-o.dimensions.z/2;o.dimensions.z=3.04;o.location.z=bottom+1.52
 if 'lintel' in o.name:o.dimensions.z+=.05;o.location.z+=.025
 if len(o.data.polygons)==6 and 'guard' not in o.name:
  mod=o.modifiers.new('Hand finished edge','BEVEL');mod.width=.014;mod.segments=2
# Fitted arch spandrels and open double doors: real geometry, no openings above the curved soffit.
newObstacles=[]
def obstacle(r,z,h):
 x0,y0,x1,y1=r;newObstacles.append(dict(minX=x0,maxX=x1,minZ=-y1,maxZ=-y0,minY=z,maxY=z+h))
for L,z in [('GF',0),('Upper',3.24)]:
 current=bpy.data.collections['Ground' if L=='GF' else 'Upper']
 for x,y,w,axis,typ,kind in data['openings'][L]:
  if typ in ['arch','archedwindow']:
   r=w/2;spring=2.45-r;verts=[];faces=[]
   for i in range(33):
    u=-r+w*i/32;low=spring+math.sqrt(max(0,r*r-u*u))
    for depth,zz in [(-.125,low),(.125,low),(-.125,3.04),(.125,3.04)]:verts.append((x+u,y+depth,z+zz) if axis=='X' else (x+depth,y+u,z+zz))
   for i in range(32):
    j=i*4;k=j+4;faces.extend([(j,k,k+1,j+1),(j+2,j+3,k+3,k+2),(j,j+2,k+2,k),(j+1,k+1,k+3,j+3)])
   me=bpy.data.meshes.new('Arched spandrel');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('P02 fitted arch spandrel',me);current.objects.link(o);o.data.materials.append(plaster)
   if typ=='archedwindow':
    v=[(x-r,y,z),(x+r,y,z)]+[(x+r*math.cos(t*math.pi/32),y,z+spring+r*math.sin(t*math.pi/32)) for t in range(33)]
    me=bpy.data.meshes.new('Arch shaped glazing');me.from_pydata(v,[],[tuple(range(len(v)))]);o=bpy.data.objects.new('Arch shaped fixed glass',me);current.objects.link(o);o.data.materials.append(glass)
  # Fine bronze window frames and door reveals.
  for sign in [-1,1]:
   xx,yy=(x+sign*w/2,y) if axis=='X' else (x,y+sign*w/2)
   cube('Bronze opening jamb',(xx,yy,z+1.2),(.035,.035,2.4),black,.005)
  if typ in ['door','arch']:
   # Folded back leaves leave approved openings unobstructed. Widths match exactly.
   double=w>1.3;leafwidth=w/2 if double else w
   for sign in ([-1,1] if double else [-1]):
    hinge=(x+sign*w/2,y) if axis=='X' else (x,y+sign*w/2)
    dx,dy=(0,1) if axis=='X' else (-1 if x<10 else 1,0)
    cx=hinge[0]+dx*leafwidth/2;cy=hinge[1]+dy*leafwidth/2
    scale=(.035,leafwidth,2.25) if axis=='X' else (leafwidth,.035,2.25)
    leafmatl=glass if kind in ['court','terrace'] or typ=='arch' else wood
    cube('Open door leaf',(cx,cy,z+1.125),scale,leafmatl,.006)
    for zz in [.05,2.22]:cube('Door bronze rail',(cx,cy,z+zz),(max(scale[0],.045),max(scale[1],.045),.035),black,.004)
    cube('Door outer stile',(hinge[0]+dx*leafwidth,hinge[1]+dy*leafwidth,z+1.125),(.035,.035,2.25),black,.004)
    obstacle([cx-scale[0]/2,cy-scale[1]/2,cx+scale[0]/2,cy+scale[1]/2],z,2.25)
# Furnished, softened pieces inside the approved furniture footprints.
def sofa(r,z):
 x0,y0,x1,y1=r;w=x1-x0;d=y1-y0
 cube('Linen sofa frame',((x0+x1)/2,(y0+y1)/2,z+.28),(w,d,.40),linen,.1)
 if d>w:
  for i in range(3):cube('Seat cushion',(x0+w*.55,y0+(i+.5)*d/3,z+.53),(w*.84,d/3-.025,.22),linen,.09)
  cube('Sofa back',(x0+.13,(y0+y1)/2,z+.78),(.25,d,.6),linen,.1)
  for i in range(3):o=cube('Olive linen pillow',(x0+.35,y0+(i+.5)*d/3,z+.85),(.18,.48,.48),olive if i%2 else linen,.08);o.rotation_euler.y=-.15
 else:cube('Chaise seat',((x0+x1)/2,(y0+y1)/2,z+.5),(w-.05,d-.05,.2),linen,.08)
def chair(r,z):
 x0,y0,x1,y1=r;cx=(x0+x1)/2;cy=(y0+y1)/2
 cube('Woven chair seat',(cx,cy,z+.45),(x1-x0,y1-y0,.08),jute,.025)
 for dx in [x0+.035,x1-.035]:
  for dy in [y0+.035,y1-.035]:rod('Oak chair leg',(dx,dy,z+.02),(dx,dy,z+.48),.025,wood)
 cube('Cane chair back',(cx,y1-.025,z+.72),(x1-x0,.06,.45),jute,.025)
def bed(r,z):
 x0,y0,x1,y1=r;cx=(x0+x1)/2;cy=(y0+y1)/2
 cube('Timber bed base',(cx,cy,z+.2),(1.58,1.98,.3),wood,.05);cube('Linen upholstered mattress',(cx,cy,z+.45),(1.6,2,.28),linen,.09)
 cube('Linen duvet',(cx,cy-.12,z+.61),(1.58,1.7,.12),linen,.06);cube('Woven bed throw',(cx,cy-.45,z+.69),(1.59,.65,.045),jute,.02)
 cube('Bed headboard',(cx,y1-.04,z+.67),(1.6,.1,1.25),linen,.05)
 for x in [cx-.4,cx+.4]:cube('Linen pillow',(x,y1-.32,z+.72),(.65,.43,.18),linen,.085)
for L,z in [('GF',0),('Upper',3.24)]:
 current=bpy.data.collections['Ground' if L=='GF' else 'Upper']
 for f in data['furniture'][L]:
  name=f['name'];r=f['rect'];x0,y0,x1,y1=r;cx=(x0+x1)/2;cy=(y0+y1)/2;w=x1-x0;d=y1-y0
  if name in ['Sofa','Chaise','Library sofa']:sofa(r,z)
  elif name=='Bed':bed(r,z)
  elif name=='Dining chair':chair(r,z)
  elif name=='Coffee table':
   cylinder('Travertine coffee table',(cx,cy,z+.42),.52,.09,stone)
   for dx,dy in [(-.25,-.2),(.25,-.2),(0,.24)]:cylinder('Sculptural table leg',(cx+dx,cy+dy,z+.2),.10,.4,stone)
   cylinder('Ceramic bowl',(cx-.1,cy,z+.50),.14,.07,cream,r2=.19)
  elif name in ['Dining table','Office desk']:
   cube('Oak tabletop',(cx,cy,z+.75),(w,d,.08),wood,.025)
   for xx in [x0+.1,x1-.1]:
    for yy in [y0+.1,y1-.1]:cube('Table leg',(xx,yy,z+.36),(.08,.08,.72),wood,.01)
  elif name in ['Kitchen cabinets','Island','Pantry shelving','Dressing']:
   h=f['height'];cube(name+' joinery',(cx,cy,z+h/2),(w,d,h),wood,.02)
   if name in ['Kitchen cabinets','Island']:cube('Travertine counter',(cx,cy,z+h+.025),(w+.015,d+.015,.05),stone,.012)
   # Slatted door fronts and handles.
   n=max(1,round(d/.55))
   for i in range(n):
    yy=y0+(i+.5)*d/n;cube('Cabinet door',(x1+.008,yy,z+h/2),(.025,d/n-.02,h-.07),wood,.008);rod('Bronze handle',(x1+.04,yy,z+h*.55),(x1+.04,yy,z+h*.55+.12),.007,brass)
  elif name=='Shower':
   cube('Stone shower tray',(cx,cy,z+.04),(w,d,.08),stone,.02);rod('Shower riser',(x1-.1,cy,z+.8),(x1-.1,cy,z+2.2),.012,brass);cylinder('Rain head',(x1-.2,cy,z+2.17),.12,.03,brass)
  elif name=='Vanity':
   cube('Oak vanity',(cx,cy,z+.42),(w,d,.7),wood,.02);cube('Vanity counter',(cx,cy,z+.8),(w,d,.06),stone,.015);uvball('Inset basin',(cx,cy,z+.84),(w*.32,d*.32,.07),cream);rod('Basin faucet',(x1-.1,cy,z+.84),(x1-.1,cy,z+1.05),.009,brass)
   cube('Vanity mirror',(x1-.02,cy,z+1.5),(.02,d*.8,.8),glass,.02)
  elif name=='WC':
   uvball('WC pedestal',(cx,cy,z+.23),(w*.35,d*.32,.23),cream);uvball('WC bowl',(cx,cy,z+.43),(w*.5,d*.5,.12),cream);uvball('WC seat',(cx,cy,z+.53),(w*.43,d*.43,.025),linen)
  elif name=='Bath':
   cube('Freestanding bath',(cx,cy,z+.32),(w,d,.55),cream,.16);cube('Bath inner surface',(cx,cy,z+.6),(w-.15,d-.15,.025),water,.12)
# Kitchen appliances, faucet, shelves, table styling.
current=bpy.data.collections['Ground']
cube('Black oven face',(.872,11,.48),(.025,.58,.6),black,.025);cube('Oven glass',(.89,11,.48),(.015,.48,.42),glass,.015)
for yy in [11.7,12.05]:
 for xx in [.4,.7]:cylinder('Hob burner',(xx,yy,.99),.11,.015,black)
rod('Kitchen mixer',(.55,13.2,.99),(.55,13.2,1.3),.012,brass);rod('Mixer spout',(.55,13.2,1.3),(.72,13.2,1.3),.012,brass)
cube('Kitchen sink',(.55,13.35,.98),(.4,.5,.025),black,.08)
for zz in [1.45,2.05]:
 cube('Kitchen oak open shelf',(.45,11.8,zz),(.35,3.1,.045),wood,.012)
 for yy in [10.5,11.1,12.1,12.7]:cylinder('Handmade pottery',(.5,yy,zz+.12),.09,.22,cream,r2=.07)
# Guest WC and laundry, previously only allocated zones.
uvball('Guest WC',(9.25,.72,.43),(.24,.32,.15),cream);cube('Powder vanity',(8.5,.9,.42),(.45,.9,.8),wood,.02)
cube('Laundry machine',(10.4,11.8,.45),(.6,.75,.9),cream,.025);cylinder('Laundry door',(10.08,11.8,.45),.22,.025,black).rotation_euler.y=math.pi/2
obstacle([8.275,.45,8.725,1.35],0,.85);obstacle([9.01,.40,9.49,1.04],0,.6);obstacle([10.1,11.425,10.7,12.175],0,.9)
# Linen rugs preserve circulation and match original earth palette.
for L,z,r in [('Ground',0,[.4,.5,4.3,5.4]),('Upper',3.24,[11.45,5.45,14.45,8.25])]:
 current=bpy.data.collections[L];cube('Woven natural rug',((r[0]+r[2])/2,(r[1]+r[3])/2,z+.012),(r[2]-r[0],r[3]-r[1],.015),jute,.005)
# Coffered ceiling detailing below existing floor plates, not a change to clear room layout.
for col,z in [('Ground',3.04),('Upper',6.28)]:
 current=bpy.data.collections[col]
 regions=[(.25,.25,4.75,13.75)] if col=='Ground' else [(11.25,4,14.75,11.25),(.25,.25,4.75,3.95)]
 for x0,y0,x1,y1 in regions:
  for x in np.arange(x0+.7,x1,.95):cube('Tadelakt coffer rib',(float(x),(y0+y1)/2,z-.07),(.10,y1-y0,.14),plaster,.015)
  for y in np.arange(y0+.7,y1,.95):cube('Tadelakt coffer cross rib',((x0+x1)/2,float(y),z-.07),(x1-x0,.10,.14),plaster,.015)
# A genuinely recessed pool; preserve approved 2 x 5m perimeter.
current=bpy.data.collections['Ground']
for x0,y0,x1,y1 in [(5,3,7,11),(9,3,11,11),(7,3,9,4.5),(7,9.5,9,11)]:cube('Courtyard travertine paving',((x0+x1)/2,(y0+y1)/2,-.1),(x1-x0,y1-y0,.2),stone,.008)
cube('Zellige basin floor',(8,7,-1.18),(2,5,.15),teal)
for x in [6.98,9.02]:cube('Zellige pool side',(x,7,-.59),(.04,5,1.18),teal)
for y in [4.48,9.52]:cube('Zellige pool end',(8,y,-.59),(2,.04,1.18),teal)
verts=[];faces=[];nx,ny=28,70
for j in range(ny+1):
 for i in range(nx+1):
  x=7+2*i/nx;y=4.5+5*j/ny;verts.append((x,y,-.09+.007*math.sin(x*24+y*13)+.004*math.sin(x*43-y*21)))
for j in range(ny):
 for i in range(nx):k=j*(nx+1)+i;faces.append((k,k+1,k+nx+2,k+nx+1))
me=bpy.data.meshes.new('Physical water ripples');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Pool ripple surface',me);current.objects.link(o);o.data.materials.append(water)
for f in me.polygons:f.use_smooth=True
# Planting: real branches and lanceolate leaf meshes, not low-poly canopy blobs.
def olive_tree(x,y,z,s=1):
 cylinder('Terracotta planter',(x,y,z+.26*s),.32*s,.52*s,terra,r2=.37*s)
 rod('Olive trunk',(x,y,z+.4*s),(x+.06*s,y,z+1.8*s),.045*s,trunkmat)
 verts=[];faces=[]
 for b in range(12):
  ang=b*2.4;end=Vector((x+math.cos(ang)*.62*s,y+math.sin(ang)*.62*s,z+(1.6+random.random()*.9)*s));start=Vector((x,y,z+1.3*s));rod('Olive branch',start,end,.012*s,trunkmat)
  for j in range(28):
   t=random.uniform(.35,1.15);c=start.lerp(end,t)+Vector((random.uniform(-.2,.2)*s,random.uniform(-.2,.2)*s,random.uniform(-.14,.14)*s));ang=random.random()*math.tau;u=Vector((math.cos(ang),math.sin(ang),random.uniform(-.4,.4)))*.085*s;v=Vector((-math.sin(ang),math.cos(ang),.1))*.018*s;k=len(verts);verts += [tuple(c-u),tuple(c+v),tuple(c+u),tuple(c-v),tuple(c+Vector((0,0,.008*s)))];faces += [(k,k+1,k+4),(k+1,k+2,k+4),(k+2,k+3,k+4),(k+3,k,k+4)]
 me=bpy.data.meshes.new('Olive leaves');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Olive foliage',me);current.objects.link(o);o.data.materials.append(leafmat);o.data.materials.append(leaflight)
 for f in me.polygons:f.material_index=random.randrange(2)
for col,z,pts,s in [('Ground',0,[(5.5,3.7),(10.5,3.7),(5.5,10.3),(10.5,10.3)],.85),('Upper',3.24,[(.8,5.2),(.8,9.7)],.85),('Roof',6.48,[(1,1),(3.5,12.5),(11.7,5.8),(13.7,13.3)],.7),('Garden',0,[(1.4,15.3),(4,16.4),(10,16.6),(13.5,15.6)],1.4)]:
 current=bpy.data.collections[col]
 for x,y in pts:olive_tree(x,y,z,s)
# Roof furniture rebuilt at approved positions; retained pergola geometry.
current=bpy.data.collections['Roof'];sofa([13.5,8,14.3,11.5],6.48)
cube('Outdoor travertine table',(7.3,12.5,7.23),(2.6,1,.1),stone,.03)
for x in [6.4,7.3,8.2]:
 for y in [11.7,13.3]:chair([x-.22,y-.22,x+.22,y+.22],6.48)
cube('Roof outdoor kitchen',(10,13.425,6.93),(1,.65,.9),wood,.02);cube('Roof kitchen counter',(10,13.425,7.4),(1.04,.69,.06),stone,.012)
# Continuous handrails along actual flights; include a closeable roof door folded clear.
for z in [0,3.24]:
 current=bpy.data.collections['Ground' if z==0 else 'Upper']
 rod('Lower flight handrail',(11.7,1.37,z+1.13),(13.78,1.37,z+2.57),.025,wood)
 rod('Upper flight handrail',(13.78,1.43,z+2.75),(11.7,1.43,z+4.01),.025,wood)
current=bpy.data.collections['Roof'];cube('Open roof stair door',(10.85,1.35,7.605),(1.1,.04,2.25),wood,.012);obstacle([10.3,1.33,11.4,1.37],6.48,2.25)
# Outdoor arrival remains a proposed level apron, not additional enclosed area.
current=bpy.data.collections['Garden'];cube('Entry approach',(6.65,-1.,-.1),(3.2,2,.2),stone,.015)
# Day/night lights are stored in named collections and a reusable Blender function.
lighting=bpy.data.collections.new('Production lighting');scene.collection.children.link(lighting);current=lighting
for x,y,z,power in [(2.5,3,2.65,70),(2.5,7.8,2.65,65),(2.5,11.6,2.65,70),(6.6,1.5,2.65,45),(6.6,12.5,2.65,50),(13,4.9,2.65,50),(13,10.3,2.65,50),(13,6.5,5.85,70),(2.5,2,5.85,55),(2.5,12.5,5.85,55),(8,12.5,5.85,45),(13,9.5,8.8,55),(6.5,12.5,8.8,50),(5.6,5.6,2.4,40),(10.4,8.7,2.4,40),(8,5,-.35,18),(8,9,-.35,18),(2,15.5,1.,25),(12,15.5,1.,25)]:
 bpy.ops.object.light_add(type='POINT',location=(x,y,z));o=assign(bpy.context.object,'Warm practical light',None);o.data.energy=power;o.data.color=(1,.63,.32);o.data.shadow_soft_size=.35;o.location.z-=.16;o['night_power']=power;lamps.append({'position':[x,z-.16,-y],'color':'#ffd2a0','intensity':power,'distance':8})
 if z>1.5:
  rod('Pendant suspension',(x,y,z+.3),(x,y,z+.8),.008,black);cylinder('Bronze pendant shade',(x,y,z+.14),.19,.22,brass,r2=.10);uvball('Warm lamp diffuser',(x,y,z),(.11,.11,.025),glow)
bpy.ops.object.light_add(type='SUN',location=(-8,-4,16));sun=assign(bpy.context.object,'Marrakech sun',None);sun.rotation_euler=(.5,-.35,-.5);sun.data.angle=.14
# Area fill represents bounced courtyard illumination, separately scaled for night.
for pos,rot,size,power in [((7.8,6.5,8),(0,0,0),5,1200),((3,7,2.8),(0,0,0),3,120),((13,8,2.8),(0,0,0),2,80)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=assign(bpy.context.object,'Indirect daylight fill',None);o.rotation_euler=rot;o.data.shape='DISK';o.data.size=size;o.data.energy=power;o['day_power']=power
scene.world.use_nodes=True

def set_lighting(mode):
 night=mode=='night';sun.data.energy=.08 if night else 2.5;sun.data.color=(.42,.57,1) if night else (1,.87,.68)
 bg=scene.world.node_tree.nodes.get('Background');bg.inputs[0].default_value=(.025,.045,.09,1) if night else (.63,.76,.9,1);bg.inputs[1].default_value=.18 if night else .65
 for o in lighting.objects:
  if 'night_power' in o:o.data.energy=o['night_power']*(1 if night else .12)
  if 'day_power' in o:o.data.energy=o['day_power']*(.015 if night else 1)
 scene['Lighting mode']=mode
set_lighting('day')
# UV coordinates use the same physical scale on differently sized surfaces.
for o in list(scene.objects):
 if o.type!='MESH':continue
 if not o.data.uv_layers:o.data.uv_layers.new(name='UVMap')
 uv=o.data.uv_layers.active.data
 for poly in o.data.polygons:
  axis=max(range(3),key=lambda j:abs(poly.normal[j]));axes=[j for j in range(3) if j!=axis]
  for li in poly.loop_indices:
   co=o.matrix_world@o.data.vertices[o.data.loops[li].vertex_index].co;uv[li].uv=(co[axes[0]]*.6,co[axes[1]]*.6)
# Readable hierarchy and cameras. Same geometry is used for both browser material passes.
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=64;scene.eevee.use_raytracing=True;scene.render.resolution_x=1280;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='WEBP';scene.render.image_settings.quality=90;scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
bpy.ops.object.camera_add(location=(6.25,4.6,1.65));cam=bpy.context.object;cam.name='Walking camera 1.65m';scene.camera=cam;cam.data.lens=22;cam.data.clip_start=.08;cam.data.clip_end=150;cam.rotation_euler=(Vector((8.2,10.8,1.6))-cam.location).to_track_quat('-Z','Y').to_euler()
scene['Approved architecture']='P02: 15x14m footprint,162+128+10=300m² enclosed. Layout locked.';scene['Outdoor areas']='48m²court,34m²upperterrace,118m²roof;60m²garden proposed';scene['Production status']='Editable detailed P02, same mesh for Architectural/Photoreal views'
# Browser circulation manifest. Flat floor rectangles exclude stair wells; ramps match the two flights.
walkable=[]
def walk(r,h):x0,y0,x1,y1=r;walkable.append(dict(minX=x0,maxX=x1,minZ=-y1,maxZ=-y0,height=h))
slabs=[[0,0,11.7,3],[14.8,0,15,3],[11.7,0,14.8,.3],[11.7,2.5,14.8,3],[0,3,5,14],[11,3,15,14],[5,11,11,14]]
for h in [0,3.24]:
 for r in slabs:walk(r,h)
for r in [[0,0,11.7,3],[14.8,0,15,3],[11.7,0,14.8,.3],[11.7,2.5,14.8,3],[0,3,5,4.2],[0,11,5,14],[11,3,15,14],[5,11,11,14]]:walk(r,6.48)
walk([5,3,11,11],0);walk([0,14,15,18],0);walk([5.05,-2,8.25,0],0)
for z in [0,3.24]:
 walkable.append(dict(minX=11.7,maxX=13.78,minZ=-1.35,maxZ=-.3,heightStart=z+.18,heightEnd=z+1.62,axis='x',start=11.7,end=13.78))
 walk([13.78,.3,14.8,2.5],z+1.62)
 walkable.append(dict(minX=11.7,maxX=13.78,minZ=-2.5,maxZ=-1.45,heightStart=z+3.24,heightEnd=z+1.8,axis='x',start=11.7,end=13.78))
colliders=[]
for L,z in [('GF',0),('Upper',3.24)]:
 for x1,y1,x2,y2,t,kind in data['walls'][L]:colliders.append(dict(minX=x1-t/2,maxX=x2+t/2,minZ=-y2-t/2,maxZ=-y1+t/2,minY=z,maxY=z+3.04))
 for x,y,w,axis,typ,kind in data['openings'][L]:
  if typ in ['window','archedwindow']:
   r=[x-w/2,y-.125,x+w/2,y+.125] if axis=='X' else [x-.125,y-w/2,x+.125,y+w/2];obstacle(r,z,2.4)
 for f in data['furniture'][L]:obstacle(f['rect'],z,f['height'])
# Pool, planters, terrace and roof parapets are real barriers.
obstacle([6.88,4.38,9.12,9.62],-.2,.35)
for z,pts,s in [(0,[(5.5,3.7),(10.5,3.7),(5.5,10.3),(10.5,10.3)],.85),(3.24,[(.8,5.2),(.8,9.7)],.85),(6.48,[(1,1),(3.5,12.5),(11.7,5.8),(13.7,13.3)],.7)]:
 for x,y in pts:obstacle([x-.37*s,y-.37*s,x+.37*s,y+.37*s],z,.55*s)
for o in scene.objects:
 if any(k in o.name for k in ['parapet','headhouse wall','Low aromatic planted border']):
  pts=[o.matrix_world@Vector(v) for v in o.bound_box];xs=[v.x for v in pts];ys=[v.y for v in pts];zs=[v.z for v in pts];obstacle([min(xs),min(ys),max(xs),max(ys)],min(zs),max(zs)-min(zs))
colliders+=newObstacles
rooms=[]
for rid,name,x,y,h,yaw in [('entry','Entrance',6.65,1.8,0,0),('living','Living room',3.8,4.8,0,1.57),('dining','Dining',4.05,8,0,1.57),('kitchen','Kitchen',3.6,11.5,0,1.57),('court','Courtyard',6.1,7,0,-1.57),('guest1','Guest suite 1',12,4.5,0,-1.57),('guest2','Guest suite 2',12,9.5,0,-1.57),('primary','Primary suite',12,5,3.24,-1.57),('library','Library',3,2,3.24,1.57),('office','Office',3.5,12,3.24,.2),('terrace','Upper terrace',3.6,6,3.24,0),('garden','Proposed garden',6.6,16,0,1.57),('roof','Roof terrace',8,2,6.48,0)]:rooms.append(dict(id=rid,name=name,position=[x,h+1.65,-y],yaw=yaw))
manifest={'version':'P02-production','units':'metres','eyeHeight':1.65,'speed':1.35,'spawn':rooms[0],'rooms':rooms,'walkable':walkable,'colliders':colliders,'lights':lamps,'bounds':{'minX':0,'maxX':15,'minZ':-18,'maxZ':2},'approvedPlanHash':locked,'area':{'enclosed':300,'courtyard':48,'upperTerrace':34,'roofOutdoor':118,'gardenProposed':60}}
(OUT/'tour.json').write_text(json.dumps(manifest,separators=(',',':')))
# Apply bevels for glTF and keep linked topology/materials; cameras/lights remain in editable .blend only.
for im in bpy.data.images:
 if im.source=='FILE' or im.has_data:
  try:im.pack()
  except:pass
bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'Casa-Mirador-P02.blend'),compress=True)
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
 if o.type=='MESH':o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'casa-mirador.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_cameras=False,export_lights=False,export_materials='EXPORT',export_image_format='AUTO')
for mode in ['day','night']:
 set_lighting(mode);scene.render.filepath=str(OUT/(mode+'.webp'));bpy.ops.render.render(write_still=True)
set_lighting('day');bpy.ops.wm.save_as_mainfile(filepath=str(SRC/'Casa-Mirador-P02.blend'),compress=True)
assert all(hashlib.sha256((APP/n).read_bytes()).hexdigest()==v for n,v in locked.items())
print('P02 detailed source, GLB, manifest and Day/Night previews saved. Architecture hashes unchanged.')
