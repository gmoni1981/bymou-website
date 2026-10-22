"""Approval-only architectural proposal. Does not render cinematic views or video."""
import bpy, math, json, sys, argparse
from pathlib import Path
from mathutils import Vector
P=argparse.ArgumentParser();P.add_argument('--root',required=True);a=P.parse_args(sys.argv[sys.argv.index('--')+1:]);root=Path(a.root);out=root/'blender/casa-mirador/approval';out.mkdir(parents=True,exist_ok=True)
W,D=11.2,16.7;H=3.24
schedule={
 'status':'PROPOSAL — FOR LAYOUT APPROVAL ONLY',
 'dimensions':{'width':W,'depth':D,'floorToFloor':H,'courtyardGround':[4.2,10],'openSky':[3,10],'pool':[1.6,4.2],'galleryGrossWidth':1.2,'galleryClearWidth':1.1},
 'areas':{'mainFloorEnvelope':187.04,'groundEnclosedGross':145.04,'upperEnclosedGross':145.04,'roofStairEnclosedGross':9.8,'totalEnclosedGross':299.88,'groundCoveredArcade':12,'upperCoveredGallery':12,'groundCourtyardIncludingArcade':42,'openSkyCourtyardIncludingPool':30,'poolSurface':6.72,'openSkyCourtyardExcludingPool':23.28,'roofOpenGrossBeforeParapets':147.24,'combinedCoveredGross':323.88},
 'rooms':[
 ['G01','Entrance hall','GF','4.20 × 3.35','14.07','Shared entrance, stair, services and courtyard'],
 ['G02','Living room','GF','3.10 × 4.78','14.80','Independent arcade door; kitchen connection'],
 ['G03','Kitchen','GF','3.10 × 4.78','14.80','Arcade, living and rear dining space'],
 ['G04','Dining + shared rear circulation','GF','7.45 × 2.85','21.23','Kitchen and courtyard; 6-seat table'],
 ['G05','Guest suite 1','GF','3.10 × 4.78 overall clear zone','14.80','Courtyard access; includes 1.85 × 1.85 en-suite'],
 ['G06','Guest suite 2','GF','3.10 × 4.78 overall clear zone','14.80','Courtyard access; includes 1.85 × 1.85 en-suite'],
 ['G07','Guest WC','GF','1.55 × 1.50','2.33','Front shared service vestibule'],
 ['G08','Laundry','GF','1.55 × 1.55','2.40','Front shared service vestibule'],
 ['G09','Pantry / utility','GF','3.10 × 2.85','8.84','Rear shared dining/circulation'],
 ['S01','U-stair clear allocation','GF / upper / roof','3.10 × 2.20','6.82','Two 1.05m flights; 1.02m landing; open lobby approach'],
 ['U01','Primary bedroom suite','Upper','3.10 × 8.28 overall clear zone','25.65','Front hall; includes dressing and 1.85 × 2.50 bath'],
 ['U02','Bedroom 2 suite','Upper','3.10 × 7.78 overall clear zone','24.10','Rear hall; includes dressing and 1.85 × 2.35 bath'],
 ['U03','Office','Upper','3.10 × 4.78','14.80','Independent west gallery door'],
 ['U04','Family lounge / library','Upper','3.10 × 4.78','14.80','Independent gallery door; rear hall'],
 ['U05','Front landing','Upper','4.20 × 3.35','14.07','Stair, primary suite, gallery'],
 ['U06','Rear landing / linen storage','Upper','7.45 × 2.85','21.23','Gallery, family lounge, Bedroom 2'],
 ['R01','Roof stair enclosure','Roof','3.50 × 2.80 gross','9.80','Continuation of same stair; door to roof terrace']
 ],
 'notes':['Indoor courtyard boundaries have proposed closeable glazing, including glazed doors in the arches and end halls.', 'All new room arrangements, depth, floor heights and upper-floor dimensions are proposals, not surveyed facts.','Room-zone areas are approximate clear planning areas, not net usable room certificates; suite zones include bathrooms and internal partitions. Do not add this room table to calculate gross floor area.','Enclosed gross area includes enclosing/internal walls and stair allocation at each level. Covered outdoor galleries/arcades are reported separately.','The exterior garden boundary and total plot area are unknown; garden planting is contained in the courtyard for this study.','Upper west gallery shelters 12m² of the ground courtyard. Only 3.0m × 10.0m is open to the sky.','Pool retains the supplied 1.6m × 4.2m surface. Landscape beds are proposed at its ends, keeping 1.2m nominal continuous side routes.','Upper and roof slabs have explicit 3.10 × 2.20 stair openings. Stair clear vertical separation is 3.06m between matching flight tread surfaces and their 180mm thick treads above.', '18 risers × 180mm = 3.24m floor-to-floor. Two flights, 8 treads × 260mm per flight and 1.02m turn landing. Stair headroom must be checked in the detailed model before walking footage.','Four bedrooms are proposed: primary, Bedroom 2 and two ground-floor guest suites. This expands the two-bedroom references.','The open roof terrace gross plate is 147.24m² before parapets, planting and furniture; no roof terrace area is counted as enclosed house area.']}
(out/'proposal.json').write_text(json.dumps(schedule,indent=2))
# Diagram and blockout data: all openings are explicit breaks in walls.
rooms={
 'GF': [('G01',3.5,.25,7.7,3.6),('G02',.25,3.75,3.35,8.525),('G03',.25,8.675,3.35,13.45),('G04',.25,13.6,7.7,16.45),('G05',7.85,3.75,10.95,8.525),('G06',7.85,8.675,10.95,13.45),('G07',9.4,.25,10.95,1.75),('G08',9.4,1.9,10.95,3.45),('G09',7.85,13.6,10.95,16.45)],
 'Upper':[('U01',7.85,.25,10.95,8.525),('U02',7.85,8.675,10.95,16.45),('U03',.25,3.75,3.35,8.525),('U04',.25,8.675,3.35,13.45),('U05',3.5,.25,7.7,3.6),('U06',.25,13.6,7.7,16.45)]}
walls={};doors={}
def segment(level,x1,y1,x2,y2,t=.15,openings=[]):
 # open intervals along horizontal x or vertical y, defined by centre and clear width.
 arr=walls.setdefault(level,[]);doors.setdefault(level,[]);horizontal=abs(y2-y1)<.0001;lo=x1 if horizontal else y1;hi=x2 if horizontal else y2;cursor=lo
 for c,w in sorted(openings):
  left,right=c-w/2,c+w/2
  if left>cursor:arr.append([cursor,y1,left,y2,t] if horizontal else [x1,cursor,x2,left,t])
  doors[level].append([c,y1,w,'X'] if horizontal else [x1,c,w,'Y']);cursor=right
 if hi>cursor:arr.append([cursor,y1,hi,y2,t] if horizontal else [x1,cursor,x2,hi,t])
for level in ['GF','Upper']:
 # Outer walls. Front entrance only ground. Windows shown as low-cut wall markers in diagrams.
 segment(level,.125,.125,W-.125,.125,.25,[(5.6,1.3)] if level=='GF' else [])
 segment(level,.125,D-.125,W-.125,D-.125,.25,[(6.7,1.0)] if level=='GF' else [])
 segment(level,.125,.125,.125,D-.125,.25);segment(level,W-.125,.125,W-.125,D-.125,.25)
 # Proposed closeable glazed enclosures separate indoor halls from outdoor court/gallery.
 segment(level,3.5,3.56,7.7,3.56,.08,[(4.1,1.0),(6.0,1.4)] if level=='GF' else [(4.1,1.0)])
 segment(level,3.5,13.64,7.7,13.64,.08,[(4.1,1.0),(5.7,1.4)] if level=='GF' else [(4.1,1.0)])
 # West rooms: clear arcade/gallery opening each; lower front stair/lobby is open.
 segment(level,3.425,3.6,3.425,13.6,.15,[(5.1,1.2),(10.1,1.2)])
 segment(level,.25,3.675,3.35,3.675,.15,[(2.6,1.0)] if level=='GF' else [])
 segment(level,.25,8.6,3.35,8.6,.15,[(2.6,1.0)] if level=='GF' else [])
 segment(level,.25,13.525,3.35,13.525,.15,[(2.6,1.1)])
 # East bedroom wing.
 segment(level,7.775,.25,7.775,16.45,.15,[(1.7,1.0),(7.15,1.0),(10.0,1.0),(14.6,1.0)] if level=='GF' else [(1.7,1.0),(14.6,1.0)])
 segment(level,7.85,8.6,10.95,8.6,.15)
 if level=='GF':
  segment(level,7.85,3.675,10.95,3.675,.15);segment(level,7.85,13.525,10.95,13.525,.15)
  segment(level,9.325,.25,9.325,3.45,.15,[(1.0,.8),(2.65,.8)]);segment(level,9.4,1.825,10.95,1.825,.15)
  for yy0,yy1,doorpos in [(3.75,5.6,4.65),(11.6,13.45,12.5)]:
   segment(level,9.025,yy0,9.025,yy1,.15,[(doorpos,.8)]);segment(level,9.1,yy1 if yy0<6 else yy0,10.95,yy1 if yy0<6 else yy0,.15)
 else:
  for yy0,yy1,doorpos in [(.25,2.75,1.65),(14.1,16.45,15.25)]:
   segment(level,9.025,yy0,9.025,yy1,.15,[(doorpos,.8)]);segment(level,9.1,yy1 if yy0<3 else yy0,10.95,yy1 if yy0<3 else yy0,.15)
(out/'layout-geometry.json').write_text(json.dumps({'walls':walls,'doors':doors,'rooms':rooms},indent=2))
# SVG floorplans with all room ids, dimensional chains and route strips.
colors={'room':'#e8dfd0','wall':'#403c35','water':'#73918b','green':'#b0b59a','route':'#bd6d3d'}
def svg(level):
 sx=42;ox=100;oy=90;hh=920;ww=690
 def xy(x,y):return (ox+x*sx,oy+(D-y)*sx)
 def rect(x0,y0,x1,y1,fill,extra=''):
  x,y=xy(x0,y1);return f'<rect x="{x:.2f}" y="{y:.2f}" width="{(x1-x0)*sx:.2f}" height="{(y1-y0)*sx:.2f}" fill="{fill}" {extra}/>'
 def txt(x,y,s,size=11,fill='#39392f'):
  xx,yy=xy(x,y);return f'<text x="{xx:.2f}" y="{yy:.2f}" font-size="{size}" text-anchor="middle" fill="{fill}">{s}</text>'
 s=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ww} {hh}" role="img" aria-label="{level} proposed dimensioned floor plan">','<style>text{font-family:Arial,sans-serif} .dim{stroke:#7f7b6b;stroke-width:1;fill:none}</style>',f'<rect width="{ww}" height="{hh}" fill="#faf8f1"/>',f'<text x="35" y="30" font-size="13" fill="#a45b36">PROPOSED · {level.upper()} · METRES</text>',rect(0,0,W,D,'#f1ebe0'),rect(3.5,3.6,7.7,13.6,'#e1e4d5'),rect(3.5,3.6,4.7,13.6,'#ded7ca')]
 for rid,x0,y0,x1,y1 in rooms[level]:s.append(rect(x0,y0,x1,y1,colors['room']));s.append(txt((x0+x1)/2,(y0+y1)/2,rid,14))
 for x1,y1,x2,y2,t in walls[level]:s.append(rect(x1-t/2,y1-t/2,x2+t/2,y2+t/2,colors['wall']))
 for x,y,w,axis in doors[level]:
  xx,yy=xy(x,y);s.append(f'<circle cx="{xx}" cy="{yy}" r="3.5" fill="#bd6d3d"/>')
 if level=='GF':
  s.extend([rect(4.8,6.5,6.4,10.7,colors['water']),txt(5.6,8.8,'POOL',11),txt(5.6,8.4,'1.60 × 4.20',10),rect(5.1,4.15,6.6,5.15,colors['green']),rect(5.1,12,6.6,13,colors['green'])])
 else:s.extend([rect(4.7,3.6,7.7,13.6,'#fffdf8'),txt(6.2,8.8,'OPEN VOID',12),txt(6.2,8.3,'3.00 × 10.00',11)])
 s.append(txt(4.1,7.8,'1.10 clear',10));s.append(txt(4.1,7.4,'gallery' if level=='Upper' else 'arcade',10))
 # Schematic real stair treads and return landing.
 s.append(rect(.2,.3,1.22,2.5,'#c1b9a8'))
 for i in range(8):
  xx=1.22+i*.26;s.append(rect(xx,.3,xx+.245,1.35,'#c1b9a8'));s.append(rect(xx,1.45,xx+.245,2.5,'#c1b9a8'))
 s.extend([txt(1.75,2.95,'S01 · 18 risers',10),txt(1.75,2.65,'3.10 × 2.20 clear',10)])
 # Furniture footprints, to make proportions reviewable.
 if level=='GF':beds=[(9.45,7.0),(9.45,10.0)];s.append(rect(.5,5.1,1.35,7.65,'#c2b49c'));s.append(rect(.5,9.0,1.1,12.9,'#bcaa8e'));s.append(rect(1.4,14.9,3.8,15.8,'#bcaa8e'))
 else:beds=[(9.45,6.45),(9.45,10.4)];s.append(rect(.5,5.1,1.2,7.1,'#bcaa8e'));s.append(rect(.5,10.1,1.35,12.6,'#c2b49c'))
 for x,y in beds:s.append(rect(x-.8,y-1,x+.8,y+1,'#fbf8f0','stroke="#a69a83" stroke-width="1"'));s.append(txt(x,y,'1.60 × 2.00',9))
 # Repeat room IDs above furniture, with private suite labels in their clear approaches.
 for rid,x0,y0,x1,y1 in rooms[level]:
  if rid in ['G05','G06','U01','U02']:s.append(txt(x0+.38,(y0+y1)/2,rid,13))
  else:s.append(txt((x0+x1)/2,y1-.45,rid,13))
 bathzones=[(3.75,5.6),(11.6,13.45)] if level=='GF' else [(.25,2.75),(14.1,16.45)]
 for ya,yb in bathzones:
  s.append(rect(10.1,ya+.05,10.9,ya+.85,'#d9ded7','stroke="#888" stroke-width=".7"'))
  s.append(rect(9.2,ya+.10,9.6,ya+.75,'#fffdf9','stroke="#888" stroke-width=".7"'))
  s.append(rect(10.5,yb-.85,10.95,yb-.05,'#c9bba4'))
  s.append(txt(9.95,(ya+yb)/2,'BATH',8))
 # Dimension lines: all major envelope/courtyard values.
 def dim(x1,y1,x2,y2,label,vertical=False):
  ax,ay=xy(x1,y1);bx,by=xy(x2,y2);s.append(f'<path class="dim" d="M{ax},{ay} L{bx},{by} M{ax-4},{ay-4}l8,8 M{bx-4},{by-4}l8,8"/>');mx=(ax+bx)/2;my=(ay+by)/2
  s.append(f'<text x="{mx}" y="{my-7}" text-anchor="middle" font-size="12" fill="#665d4b"'+(f' transform="rotate(-90 {mx} {my-7})"' if vertical else '')+f'>{label}</text>')
 dim(0,-.9,W,-.9,'11.20 m · reference width');dim(-.9,0,-.9,D,'16.70 m · PROPOSED',True)
 dim(0,D+.7,3.5,D+.7,'3.50');dim(3.5,D+.7,7.7,D+.7,'4.20');dim(7.7,D+.7,11.2,D+.7,'3.50')
 dim(12,3.6,12,13.6,'10.00 · PROPOSED',True)
 s.append('<text x="35" y="870" font-size="11" fill="#746a59">Orange points = clear door openings. Room IDs match the schedule.</text>');s.append('<text x="35" y="890" font-size="11" fill="#746a59">Dimensioned schematic · not a construction or surveyed plan.</text></svg>');return ''.join(s)
for level,name in [('GF','ground-plan.svg'),('Upper','upper-plan.svg')]: (out/name).write_text(svg(level))
# Actual editable Blender schematic, without borrowing geometry from the superseded study.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.world.color=(.8,.8,.8)
def mat(name,c):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*c,1);m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.8;return m
stone=mat('Ivory planning mass',(.7,.66,.55));wallmat=mat('Cut plaster walls',(.83,.78,.67));floor=mat('Limestone floor',(.58,.53,.44));water=mat('Pool surface',(.15,.38,.36));green=mat('Planting zones',(.31,.38,.22));furn=mat('Furniture scale blocks',(.37,.27,.16));white=mat('Linen scale blocks',(.91,.86,.73));dark=mat('Dimension lettering',(.15,.15,.12));rail=mat('Bronze gallery rail',(.25,.21,.13))
collections={};current=None
for level in ['GF','Upper','Roof','Annotations']:
 c=bpy.data.collections.new(level);scene.collection.children.link(c);collections[level]=c

def box(name,x0,y0,z0,x1,y1,z1,material):
 bpy.ops.mesh.primitive_cube_add(size=1,location=((x0+x1)/2,(y0+y1)/2,(z0+z1)/2));o=bpy.context.object;o.name=name;o.scale=(x1-x0,y1-y0,z1-z0);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for c in list(o.users_collection):c.objects.unlink(o)
 current.objects.link(o);o.data.materials.append(material);return o

def text(name,x,y,z,size=.24):
 cu=bpy.data.curves.new(name,'FONT');cu.body=name;cu.size=size;cu.align_x='CENTER';ob=bpy.data.objects.new(name,cu);current.objects.link(ob);ob.location=(x,y,z);ob.data.materials.append(dark);return ob

for level,z in [('GF',0),('Upper',H)]:
 current=collections[level]
 # Upper slab leaves a real stair opening. Gross accounting allocates stairs on served floors.
 frontslabs=[(0,0,11.2,3.6)] if level=='GF' else [(0,0,.2,3.6),(.2,0,3.3,.3),(.2,2.5,3.3,3.6),(3.3,0,11.2,3.6)]
 for x0,y0,x1,y1 in frontslabs+[(0,3.6,4.7,13.6),(7.7,3.6,11.2,13.6),(0,13.6,11.2,D)]:box(level+' slab',x0,y0,z-.2,x1,y1,z,floor)
 if level=='GF':
  # Ground landscape/pool are separate open outdoor surfaces, not indoor floor area.
  box('Courtyard paving',4.7,3.6,z-.2,7.7,13.6,z,stone);box('Pool water',4.8,6.5,z+.025,6.4,10.7,z+.04,water)
  for yy in [4.15,12]:box('Courtyard garden',5.1,yy,z+.03,6.6,yy+1,z+.3,green)
 for x1,y1,x2,y2,t in walls[level]:box(level+' wall',x1-t/2,y1-t/2,z,x2+t/2,y2+t/2,z+.8,wallmat)
 for rid,x0,y0,x1,y1 in rooms[level]:text(rid,(x0+x1)/2,(y0+y1)/2,z+.035,.31)
 # Arches indicated as real geometry portals, enough to show retained identity without pretending detailed design.
 for yy in [5.1,10.1]:
  for side in [-1,1]:box('Arch jamb',3.335,yy+side*.675-.075,z,3.515,yy+side*.675+.075,z+1.7,wallmat)
  verts=[];faces=[]
  for i in range(25):
   theta=i*math.pi/24
   for xx,r in [(3.335,.6),(3.515,.6),(3.335,.75),(3.515,.75)]:verts.append((xx,yy+r*math.cos(theta),z+1.7+r*math.sin(theta)))
  for i in range(24):
   a=i*4;b=(i+1)*4;faces.extend([(a,b,b+1,a+1),(a+2,a+3,b+3,b+2),(a,a+2,b+2,b),(a+1,b+1,b+3,a+3)])
  me=bpy.data.meshes.new('Arch approval mesh');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('Proposed courtyard arch',me);current.objects.link(ob);ob.data.materials.append(wallmat)
 if level=='Upper':
  for yy in [3.6+i*.5 for i in range(21)]:box('Gallery guard post',4.62,yy,z,4.67,yy+.04,z+1.1,rail)
  box('Gallery handrail',4.62,3.6,z+1.07,4.67,13.6,z+1.12,rail)
 # Treads are editable real geometry. Stair representation inside the cutaway is shortened visually at high level.
 for i in range(8):
  xx=3.3-(i+1)*.26;box('Stair flight A tread',max(.2,xx),.3,z+i*.18,max(.2,xx)+.26,1.35,z+(i+1)*.18,stone)
 box('Stair turning landing',.2,.3,z+1.44,1.22,2.5,z+1.62,stone)
 for i in range(8):
  xx=1.22+i*.26;box('Stair flight B tread',xx,1.45,z+1.62+i*.18,min(3.56,xx+.26),2.5,z+1.8+i*.18,stone)
 for bx,by in ([(9.45,7),(9.45,10)] if level=='GF' else [(9.45,6.45),(9.45,10.4)]):
  box('Bed scale block',bx-.8,by-1,z+.15,bx+.8,by+1,z+.55,white)
  for px in [bx-.4,bx+.4]:box('Pillow',px-.32,by+.6,z+.55,px+.32,by+.9,z+.68,white)
 if level=='GF':
  box('Living sofa',.5,5.1,z+.1,1.35,7.65,z+.65,white);box('Kitchen cabinets',.5,9,z,1.1,12.9,z+.9,furn);box('Dining table',1.4,14.9,z+.7,3.8,15.8,z+.8,furn)
  for x in [1.8,2.6,3.4]:
   for y in [14.6,16.1]:box('Dining chair',x-.2,y-.2,z,x+.2,y+.2,z+.5,furn)
 else:box('Office desk',.5,5.1,z+.7,1.2,7.1,z+.78,furn);box('Family sofa',.5,10.1,z+.1,1.35,12.6,z+.65,white)
 for ya,yb in ([(3.75,5.6),(11.6,13.45)] if level=='GF' else [(.25,2.75),(14.1,16.45)]):
  box('Shower tray',10.1,ya+.05,z,10.9,ya+.85,z+.08,white)
  box('WC scale block',9.2,ya+.1,z,9.6,ya+.75,z+.4,white)
  box('Vanity scale block',10.5,yb-.85,z,10.95,yb-.05,z+.8,furn)
 text(level+' • PROPOSED',5.6,-.8,z,.4)
 text('11.20 m',5.6,-1.35,z,.3)
current=collections['Roof'];z=H*2
for x0,y0,x1,y1 in [(0,0,.2,3.6),(.2,0,3.3,.3),(.2,2.5,3.3,3.6),(3.3,0,11.2,3.6),(0,3.6,4.7,13.6),(7.7,3.6,11.2,13.6),(0,13.6,11.2,D)]:box('Roof terrace slab',x0,y0,z-.2,x1,y1,z,stone)
# Enclosed roof stair headhouse is explicitly included in the 299.88m² schedule.
for x0,y0,x1,y1 in [(0,0,3.5,.2),(0,.2,.2,2.8),(.2,2.6,3.5,2.8),(3.3,.2,3.5,1.35),(3.3,2.55,3.5,2.6)]:box('Roof stair enclosure',x0,y0,z,x1,y1,z+1,wallmat)
for x0,y0,x1,y1 in [(0,0,11.2,.15),(0,D-.15,11.2,D),(0,0,.15,D),(11.05,0,11.2,D),(4.55,3.6,4.7,13.6),(7.7,3.6,7.85,13.6)]:box('Roof parapet',x0,y0,z,x1,y1,z+.7,wallmat)
box('Roof lounge',.5,6,z+.1,1.4,9,z+.65,white);box('Outdoor dining',8.5,5,z+.7,10.3,6.1,z+.8,furn);box('Outdoor kitchen',10.4,9,z,10.95,12,z+.9,furn)
for x,y in [(1,12),(3,14.8),(9,14.8),(9.5,2)]:box('Roof planter',x-.35,y-.35,z,x+.35,y+.35,z+.65,green)
text('ROOFTOP TERRACE • PROPOSED',5.6,-.8,z,.3)
# Lighting only for clear schematic plans, not final six photorealistic views.
current=collections['Annotations'];bpy.ops.object.light_add(type='AREA',location=(5,-4,25));light=bpy.context.object;light.data.energy=2300;light.data.size=14
bpy.ops.object.light_add(type='SUN',location=(10,-10,20));sun=bpy.context.object;sun.data.energy=2;sun.rotation_euler=(.4,-.5,-.5);sun.data.angle=.2
bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.lens=45
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.8,.8,.75,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.8
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=32;scene.render.resolution_x=1600;scene.render.resolution_y=1400;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
scene['Approval status']='PROPOSAL ONLY — Await layout approval. No final walkthrough or photorealistic production.';scene['Enclosed gross built area']=299.88;scene['Footprint proposed']=f'{W} x {D} m'
# Store explicit dimensions/counters for independent validation.
scene['Stair treads per flight']=8;scene['Stair risers per storey']=18;scene['Stair opening metres']='3.10 x 2.20';scene['Stair enclosure roof gross area']=9.8
# Save the normally aligned editable model first.
bpy.ops.wm.save_as_mainfile(filepath=str(out/'Casa-Mirador-300sqm-PROPOSAL.blend'),compress=True)
for level,z,name in [('GF',0,'ground-3d.png'),('Upper',H,'upper-3d.png'),('Roof',H*2,'roof-3d.png')]:
 for k,c in collections.items():c.hide_render=k not in [level,'Annotations']
 cam.location=(25,-23,30+z);target=Vector((5.6,8,z));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=24;scene.render.filepath=str(out/name);bpy.ops.render.render(write_still=True)
# Three floor plates side by side: architectural overview, not a final perspective render.
for c in collections.values():c.hide_render=False
for level,dx,z0 in [('GF',0,0),('Upper',15,H),('Roof',30,H*2)]:
 for ob in collections[level].objects:ob.location.x+=dx;ob.location.z-=z0
cam.location=(46,-35,49);target=Vector((20.6,8,0));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=51;scene.render.resolution_x=2200;scene.render.resolution_y=1500;scene.render.filepath=str(out/'architectural-overview.png');bpy.ops.render.render(write_still=True)
print('PROPOSAL_READY',out)
