"""P02 approval drawings and real Blender schematic geometry; no final visualisations."""
import bpy, math, json, sys, argparse, html
from pathlib import Path
from mathutils import Vector
from collections import deque
p=argparse.ArgumentParser();p.add_argument('--root',required=True);args=p.parse_args(sys.argv[sys.argv.index('--')+1:]);out=Path(args.root)/'blender/casa-mirador/approval'
W,D,H=15.,14.,3.24
rooms={
'GF':[
('G01','Living',.25,.25,4.75,6.,'25.88','Open to dining; courtyard arches'),
('G02','Dining',.25,6.,4.75,10.,'18.00','8-place table; no partition to living/kitchen'),
('G03','Kitchen',.25,10.,4.75,13.75,'16.88','Island, 1.10 m working aisle; pantry nearby'),
('G04','Entrance',5.25,.25,8.1,2.75,'7.12','Entry → living / courtyard / stair lobby'),
('G05','WC',8.25,.25,10.,1.55,'2.28','Guest powder room'),
('G06','Laundry',8.25,11.25,10.75,12.35,'2.75','Rear utility cupboard; garden-room access'),
('G07','Guest suite 1',11.25,3.25,14.75,8.40,'18.03','Includes 1.85 × 2.10 m en-suite'),
('G08','Guest suite 2',11.25,8.55,14.75,13.75,'18.20','Includes 1.85 × 2.10 m en-suite'),
('G09','Garden room / passage',5.25,11.25,8.1,13.75,'7.12','Court → kitchen / rear garden'),
('G10','Pantry / storage',8.25,12.5,10.75,13.75,'3.12','Access from garden room'),
],
'Upper':[
('U01','Library / shared landing',.25,.25,4.75,3.95,'16.65','Shared route to open terrace; not a fourth bedroom'),
('U02','Front landing',5.25,.25,10.75,2.75,'13.75','Stair → library / primary suite'),
('U03','Primary suite',11.25,4.,14.75,13.75,'34.12','Sleeping + dressing + 3.50 × 2.30 m bathroom'),
('U04','Office',.25,11.25,4.75,13.75,'11.25','Access via open terrace; desk for two'),
('U05','Rear landing / linen',5.25,11.25,10.75,13.75,'13.75','Terrace → office / primary suite'),
]}
walls={'GF':[],'Upper':[]};openings={'GF':[],'Upper':[]}
def seg(L,x1,y1,x2,y2,t=.15,gaps=(),kind='partition'):
 horizontal=abs(y2-y1)<.001;lo=x1 if horizontal else y1;hi=x2 if horizontal else y2;cursor=lo
 for c,w,typ in sorted(gaps):
  a,b=c-w/2,c+w/2
  if a>cursor:walls[L].append([cursor,y1,a,y2,t,kind] if horizontal else [x1,cursor,x2,a,t,kind])
  openings[L].append([c,y1,w,'X',typ,kind] if horizontal else [x1,c,w,'Y',typ,kind]);cursor=b
 if cursor<hi:walls[L].append([cursor,y1,hi,y2,t,kind] if horizontal else [x1,cursor,x2,hi,t,kind])
# Outer enclosures, meaningful windows and explicit doors.
for L in walls:
 seg(L,.125,.125,14.875,.125,.25,[(2.5,2.8,'archedwindow'),(6.65,1.5,'arch')] if L=='GF' else [(2.5,2.8,'window'),(7.7,2.5,'window')],'outer')
 seg(L,.125,13.875,14.875,13.875,.25,[(2.5,2.5,'window'),(6.6,1.4,'door' if L=='GF' else 'window'),(13,2.,'window')],'outer')
 seg(L,14.875,.125,14.875,13.875,.25,[(6.,1.8,'window'),(10.4,1.8,'window')],'outer')
 if L=='GF':seg(L,.125,.125,.125,13.875,.25,[(3.,2.,'window'),(7.9,2.,'window'),(11.8,1.6,'window')],'outer')
 else:
  seg(L,.125,.125,.125,4.075,.25,[(2,1.8,'window')],'outer');seg(L,.125,11.125,.125,13.875,.25,[(12.5,1.4,'window')],'outer')
 # Front/rear glazed thresholds remain enclosed when closed; full courtyard stays outdoor.
 seg(L,5,2.875,11,2.875,.25,[(6.65,1.8,'arch'),(9.65,1.8,'arch' if L=='GF' else 'window')],'court')
 seg(L,5,11.125,11,11.125,.25,[(6.65,1.6,'door'),(9.5,1.6,'window')],'court')
 if L=='GF':
  seg(L,4.875,.25,4.875,13.75,.25,[(1.6,1.4,'door'),(4.5,2.2,'arch'),(7.7,2.2,'arch'),(10.25,1.8,'arch'),(12.5,1.4,'door')],'court')
  seg(L,11.125,3.125,11.125,13.75,.25,[(4.3,1.,'door'),(9.5,1.,'door')],'court')
  seg(L,11.25,3.125,14.75,3.125,.25)
  seg(L,11.25,8.475,14.75,8.475,.15)
  seg(L,8.175,.25,8.175,1.55,.15)
  seg(L,10.075,.25,10.075,1.55,.15,[(.9,.8,'door')])
  seg(L,8.25,1.625,10,1.625,.15)
  seg(L,8.175,11.25,8.175,13.75,.15,[(11.8,.8,'door'),(13.1,.8,'door')]);seg(L,8.25,12.425,10.75,12.425,.15)
  for ya,yb in [(6.3,8.4),(11.65,13.75)]:
   seg(L,12.825,ya,12.825,yb,.15,[(ya+.85,.8,'door')]);seg(L,12.9,ya-.075,14.75,ya-.075,.15)
 else:
  seg(L,4.875,.25,4.875,4.2,.25,[(1.5,1.2,'door')])
  seg(L,.25,4.075,4.75,4.075,.25,[(3.6,1.4,'door')],'terrace')
  seg(L,.25,11.125,4.75,11.125,.25,[(3.6,1.4,'door')],'terrace')
  seg(L,4.875,11.25,4.875,13.75,.25,[(12.5,1.1,'door')])
  seg(L,11.125,3,11.125,13.75,.25,[(6.3,1.8,'window'),(9.4,1.8,'window'),(12.5,1.0,'door')],'court')
  seg(L,11.25,3.875,14.75,3.875,.25,[(12.1,1.1,'door')])
  seg(L,11.25,11.375,14.75,11.375,.15,[(11.85,.9,'door')])
# Principal furniture / hard obstacles in plan, shared with Blender and access audit.
furniture={'GF':[],'Upper':[]}
def furn(L,name,rect,kind='wood',height=.8):furniture[L].append(dict(name=name,rect=rect,kind=kind,height=height))
furn('GF','Sofa',[.5,1.,1.4,4.3],'linen',.85);furn('GF','Chaise',[1.4,1.,2.8,1.9],'linen',.6);furn('GF','Coffee table',[2.05,2.6,3.15,3.6],'stone',.4)
furn('GF','Dining table',[2,6.65,3,9.25],'wood',.76)
for y in [7,7.8,8.6]:
 for x in [1.55,3.45]:furn('GF','Dining chair',[x-.22,y-.22,x+.22,y+.22],'wood',.5)
for y in [6.2,9.7]:furn('GF','Dining chair',[2.28,y-.2,2.72,y+.2],'wood',.5)
furn('GF','Kitchen cabinets',[.25,10.1,.85,13.75],'wood',.92);furn('GF','Island',[1.95,10.65,2.85,12.65],'stone',.92)
furn('GF','Pantry shelving',[10.15,12.6,10.75,13.6],'wood',2.)
for L,x,y in [('GF',13.5,5.05),('GF',13.5,10.4),('Upper',13.25,6.8)]:
 furn(L,'Bed',[x-.8,y-1,x+.8,y+1],'linen',.55)
for ya in [6.3,11.65]:
 furn('GF','Shower',[13.8,ya+.1,14.7,ya+1.],'stone',.1);furn('GF','Vanity',[14.25,ya+1.2,14.75,ya+2.],'wood',.8);furn('GF','WC',[13,ya+1.35,13.45,ya+2.],'linen',.45)
furn('Upper','Dressing',[14.15,8.3,14.75,11.2],'wood',2.3)
furn('Upper','Bath',[13.8,11.65,14.6,13.45],'linen',.6);furn('Upper','Vanity',[12.6,13.15,13.6,13.75],'wood',.8);furn('Upper','WC',[11.4,13,11.85,13.65],'linen',.45)
furn('Upper','Library sofa',[.5,.7,1.4,3.2],'linen',.8);furn('Upper','Office desk',[.6,12.8,3.4,13.5],'wood',.75)
bedsGreen=[[5.05,5.8,5.45,6.5],[5.05,8.8,5.45,9.3],[10.55,5.2,10.95,8.4]]
plants=[(5.5,3.7,.35),(10.5,3.7,.35),(5.5,10.3,.35),(10.5,10.3,.35)]
pool=[7,4.5,9,9.5]
# Areas explicitly from geometry, not a room sum.
area={'footprint':W*D,'courtyard':6*8,'groundEnclosedGross':W*D-48,'upperOpenTerrace':5*6.8,'upperEnclosedGross':W*D-48-34,'roofStairEnclosedGross':10.,'totalEnclosedGross':300.,'pool':10.,'courtyardDryAreaBeforePlanting':38.,'proposedGarden':60.,'roofOpenGross':128-10,'pergolaCoverage':15.}
assert abs(area['groundEnclosedGross']+area['upperEnclosedGross']+area['roofStairEnclosedGross']-300)<1e-8
proposal={'revision':'P02','status':'ARCHITECTURAL PROPOSAL — APPROVAL REQUIRED','dimensions':{'width':W,'depth':D,'floorToFloor':H,'courtyard':[6,8],'pool':[2,5],'upperTerrace':[5,6.8],'gardenProposed':[15,4]},'areas':area,'rooms':rooms,'bedrooms':3,'notes':['All P02 dimensions are proposed, not a surveyed reconstruction.','Enclosed gross includes walls and stair allocation on served levels. Courtyard, open terraces, garden and pergola are excluded.','Upper office access uses an open terrace, via the shared library. It never passes through a bedroom.','The garden apron is a 15 x 4 m landscape study, not an assertion of plot ownership or boundary.','Roof gross outdoor area is 118 m² before parapets, planting, furniture and clearance deductions. Pergola covers 15 m² of that area, not additional area.','Closeable courtyard glazing and doors are proposed; moving leaves are omitted from this schematic. Enclosed area assumes these openings can close.','Final finishes, structural design, waterproofing and detailed stair headroom remain to be resolved after architectural approval.']}
(out/'proposal.json').write_text(json.dumps(proposal,indent=2));(out/'layout-geometry.json').write_text(json.dumps({'rooms':rooms,'walls':walls,'openings':openings,'furniture':furniture},indent=2))
# Vector drawings: dimensioned schematic plans.
C={'linen':'#eee7d8','wood':'#b79976','stone':'#c9c2ae'}
def plan(L):
 S=39;ox=68;oy=90; ymax=18 if L=='GF' else 14
 def pt(x,y):return ox+x*S,oy+(ymax-y)*S
 def rect(r,fill,stroke='none',extra=''):
  x,y=pt(r[0],r[3]);return f'<rect x="{x}" y="{y}" width="{(r[2]-r[0])*S}" height="{(r[3]-r[1])*S}" fill="{fill}" stroke="{stroke}" {extra}/>'
 def tx(x,y,t,size=11,fill='#393c33'):
  xx,yy=pt(x,y);return f'<text x="{xx}" y="{yy}" text-anchor="middle" font-size="{size}" fill="{fill}">{html.escape(t)}</text>'
 s=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 890"><style>text{font-family:Arial,sans-serif}</style><rect width="740" height="890" fill="#faf8f1"/>',f'<text x="35" y="32" font-size="16">P02 / {L.upper()} — PROPOSED</text>',rect([0,0,15,14],'#e9dfcf'),rect([5,3,11,11],'#e5e8da')]
 if L=='GF':
  s += [rect([0,14,15,18],'#e7eadc','#7b8968','stroke-dasharray="6 5"'),tx(7.5,17.35,'PROPOSED GARDEN · 15 × 4 m · 60 m²',12),tx(7.5,16.85,'Plot boundary / availability UNVERIFIED',10),rect([6,14,7.2,17.8],'#d9cbb6')]
  for x,y in [(1.4,15.3),(4,16.4),(10,16.6),(13.5,15.6)]:
   xx,yy=pt(x,y);s.append(f'<circle cx="{xx}" cy="{yy}" r="28" fill="#a8b08f"/>')
  s += [tx(3,14.65,'Olive / citrus garden',10),tx(11,14.65,'Pergola-free shaded seating',10),rect(pool,'#739b95','#536f68'),tx(8,7.3,'POOL',12),tx(8,6.8,'2.00 × 5.00',11)]
  for x,y,r in plants:
   xx,yy=pt(x,y);s.append(f'<circle cx="{xx}" cy="{yy}" r="{r*S}" fill="#9ba982"/>')
  for r in bedsGreen:s.append(rect(r,'#b2bb9b'))
  s += [tx(6.2,7.9,'1.43 m min',10),tx(6.2,7.5,'path',9),tx(9.8,7.9,'1.43 m min',10),tx(9.8,7.5,'path',9)]
 elif L=='Upper':
  s += [rect([0,4.2,5,11],'#d7d5be'),tx(2.5,8.5,'OPEN TERRACE',12),tx(2.5,8.0,'5.00 × 6.80 · 34 m²',11),tx(2.5,7.5,'Shared outdoor access to office',9),rect([5,3,11,11],'#faf8f1'),tx(8,7.6,'COURTYARD VOID',12),tx(8,7.1,'6.00 × 8.00',11)]
 elif L=='Roof':
  s += [rect([0,4.2,5,11],'#faf8f1'),tx(2.5,7.5,'LOWER TERRACE',10),rect([5,3,11,11],'#faf8f1'),tx(8,7.5,'COURTYARD VOID',11),rect([11.4,0,15,10/3.6],'#c7baa2','#6b6357'),tx(13.2,1.6,'STAIR',12),tx(13.2,1.1,'10.00 m² gross',10),rect([11.5,7.5,14.5,12.5],'#bba27f','#806747'),tx(13,10.5,'PERGOLA',11),tx(13,10,'3.0 × 5.0',10),tx(7.8,12.5,'OUTDOOR DINING / KITCHEN',10),tx(5,1.4,'ROOF TERRACE · 118 m² gross outdoor',11)]
 for w in walls.get(L,[]):
  x1,y1,x2,y2,t,kind=w;s.append(rect([x1-t/2,y1-t/2,x2+t/2,y2+t/2],'#48483e'))
 for x,y,w,axis,typ,kind in openings.get(L,[]):
  a,b=pt(x-w/2 if axis=='X' else x,y if axis=='X' else y-w/2);c,d=pt(x+w/2 if axis=='X' else x,y if axis=='X' else y+w/2)
  s.append(f'<path d="M{a},{b} L{c},{d}" stroke="'+('#8ca7a1' if typ=='window' else '#af704c')+'" stroke-width="2"/>')
 for f in furniture.get(L,[]):s.append(rect(f['rect'],C[f['kind']],'#a29680'))
 # Same stairs on both residential levels and roof opening.
 if L in ['GF','Upper','Roof']:
  s.append(rect([13.78,.3,14.8,2.5],'#c4b99f'))
  for i in range(8):
   x=11.7+i*.26;s.append(rect([x,.3,x+.245,1.35],'#c4b99f'));s.append(rect([x,1.45,x+.245,2.5],'#c4b99f'))
  s += [tx(13.3,2.9,'18 × 0.18 m / UP',9),tx(13.3,-.48,'3.10 × 2.20 stair clear',9)]
 for rid,name,x0,y0,x1,y1,ar,desc in rooms.get(L,[]):
  # Labels at clear positions, each includes actual clear-zone dimensions.
  pos={'G01':(3.1,5.3),'G02':(2.5,8.0),'G03':(3.6,13.2),'G04':(6.65,2.1),'G05':(9.1,1),'G06':(9.5,11.9),'G07':(12.6,7.6),'G08':(12.6,13),'G09':(6.65,12.7),'G10':(9.5,13.3),'U01':(2.9,3.3),'U02':(7.9,1.6),'U03':(13,9.8),'U04':(2.5,12),'U05':(8,12.6)}
  x,y=pos[rid];s += [tx(x,y,rid+' · '+name,9 if len(name)>12 else 10),tx(x,y-.32,f'{x1-x0:.2f} × {y1-y0:.2f} m',9)]
 # Dashed route: not a cinematic path, explicitly schematic shared circulation.
 routes={'GF':[(6.65,0),(6.65,3.5),(6.2,5.1),(6.2,10.5),(6.65,12),(6.65,15.5)],'Upper':[(10.7,2),(5.4,1.5),(3.6,1.5),(3.6,4.5),(3.6,10.5),(3.6,12)],'Roof':[(11,2),(7,2)]}
 coords=[pt(x,y) for x,y in routes[L]];s.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in coords)+'" fill="none" stroke="#ae6744" stroke-width="1.5" stroke-dasharray="5 5"/>')
 def dim(x1,y1,x2,y2,label):
  ax,ay=pt(x1,y1);bx,by=pt(x2,y2);s.append(f'<path d="M{ax},{ay}L{bx},{by}M{ax-4},{ay-4}l8,8 M{bx-4},{by-4}l8,8" stroke="#817763" fill="none"/>');x=(ax+bx)/2;y=(ay+by)/2-8
  s.append(f'<text x="{x}" y="{y}" font-size="11" text-anchor="middle"'+(f' transform="rotate(-90 {x} {y})"' if x1==x2 else '')+'>'+label+'</text>')
 dim(0,-1.1,15,-1.1,'15.00 m · proposed (+3.80 m)');dim(-.8,0,-.8,14,'14.00 m · proposed (−2.70 m)')
 for a,b,label in [(0,5,'5.00'),(5,11,'6.00'),(11,15,'4.00')]:dim(a,ymax+.65,b,ymax+.65,label)
 if L!='Roof':dim(15.6,3,15.6,11,'8.00 m courtyard')
 s += ['<text x="35" y="853" font-size="10">Clear room-zone dimensions; suite areas include their bathrooms. Gross areas include walls.</text>','<text x="35" y="873" font-size="10">Orange = openings / shared route. Blue = windows. Schematic proposal, not construction drawings.</text></svg>']
 import xml.etree.ElementTree as ET
 xml=ET.fromstring(''.join(s))
 for el in list(xml):
  if el.tag.endswith('text') and ('PROPOSED GARDEN' in (el.text or '') or 'Plot boundary' in (el.text or '')):xml.remove(el);xml.append(el)
 ET.register_namespace('','http://www.w3.org/2000/svg')
 return ET.tostring(xml,encoding='unicode')
for L,n in [('GF','ground-plan.svg'),('Upper','upper-plan.svg'),('Roof','roof-plan.svg')]: (out/n).write_text(plan(L))
# Horizontal access checks including real walls, furniture, pool and stair exclusions.
validation={'areaArithmetic':'passed','scope':'2D schematic connectivity at 0.10 m grid, body radius 0.20 m; excludes door swings, structural/headroom certification and final walking route.','levels':{}}
for L in ['GF','Upper']:
 obstacles=[]
 for x1,y1,x2,y2,t,k in walls[L]:obstacles.append([x1-t/2,y1-t/2,x2+t/2,y2+t/2])
 for x,y,w,axis,typ,k in openings[L]:
  if typ in ['window','archedwindow']:obstacles.append([x-w/2,y-.12,x+w/2,y+.12] if axis=='X' else [x-.12,y-w/2,x+.12,y+w/2])
 obstacles += [f['rect'] for f in furniture[L]]+[[11.7,.3,14.8,2.5]]
 if L=='GF':obstacles += [pool]+bedsGreen
 def valid(i,j):
  x,y=i*.1,j*.1
  if not .25<=x<=14.75 or not .25<=y<=13.75:return False
  if L=='Upper' and 5<=x<=11 and 3<=y<=11:return False
  return not any(a-.2<x<b+.2 and c-.2<y<d+.2 for a,c,b,d in obstacles)
 start=(107,20);seen={start};q=deque([start])
 while q:
  i,j=q.popleft()
  for n in [(i+1,j),(i-1,j),(i,j+1),(i,j-1)]:
   if n not in seen and valid(*n):seen.add(n);q.append(n)
 targets={'living':(3.9,4.8),'dining':(4.1,8),'kitchen':(3.5,11.5),'entry':(6.5,1.5),'WC':(9.3,.9),'utility':(9.3,11.8),'guest1':(12,4.5),'guest2':(12,9.5),'bath1':(13.3,6.9),'bath2':(13.3,12.4),'garden passage':(6.5,12.5),'pantry':(9.2,13.1),'courtyard':(6.2,7)} if L=='GF' else {'library':(3,2),'open terrace':(3.6,6),'office':(3.5,12),'rear landing':(8,12.5),'primary':(12,5),'primary bath':(12,12),'stair lobby':(12,3.1)}
 checks={k:(round(x*10),round(y*10)) in seen for k,(x,y) in targets.items()};validation['levels'][L]={'targets':checks,'reachableCells':len(seen)}
(out/'validation.json').write_text(json.dumps(validation,indent=2))
print('P02_VALIDATION',json.dumps(validation))
# Construct actual, assembled Blender proposal.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);scene=bpy.context.scene;scene.unit_settings.system='METRIC'
def material(name,c,rough=.7):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;n=m.node_tree.nodes['Principled BSDF'];n.inputs['Base Color'].default_value=(*c,1);n.inputs['Roughness'].default_value=rough;return m
mats={'plaster':material('Warm tadelakt — schematic',(.78,.68,.53)),'stone':material('Honed travertine — schematic',(.63,.55,.43)),'wood':material('Oak and cedar',(.28,.15,.065)),'linen':material('Natural linen',(.91,.86,.73)),'green':material('Olive planting',(.22,.31,.13)),'water':material('Green zellige pool',(.08,.30,.28),.2),'bronze':material('Bronze',(.23,.16,.07)),'glass':material('Glazing indication',(.25,.39,.39),.15),'soil':material('Garden soil',(.30,.25,.15))}
cols={}
for name in ['Ground','Upper','Roof','Garden','Lighting']:
 c=bpy.data.collections.new(name);scene.collection.children.link(c);cols[name]=c
current=cols['Ground'];wallobjects=[];roofslabs=[]
def link(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 current.objects.link(o);return o

def box(name,r,z,h,mat='plaster'):
 a,c,b,d=r;bpy.ops.mesh.primitive_cube_add(size=1,location=((a+b)/2,(c+d)/2,z+h/2));o=link(bpy.context.object);o.name=name;o.scale=(b-a,d-c,h);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mats[mat]);return o

def cylinder(name,x,y,z,r,depth,mat):
 bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=r,depth=depth,location=(x,y,z+depth/2));o=link(bpy.context.object);o.name=name;o.data.materials.append(mats[mat]);return o

def tree(x,y,z,scale=1):
 cylinder('Terracotta planter',x,y,z,.34*scale,.5*scale,'stone');cylinder('Olive trunk',x,y,z+.5*scale,.045*scale,1.35*scale,'wood')
 for dx,dy,dz,r in [(-.3,0,1.7,.5),(.3,0,1.8,.5),(0,.25,2.1,.48),(0,-.25,2.2,.45)]:
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=r*scale,location=(x+dx*scale,y+dy*scale,z+dz*scale));o=link(bpy.context.object);o.name='Olive canopy — planting concept';o.data.materials.append(mats['green'])
def arch(x,y,w,axis,z,t=.25):
 # Semicircular archivolt with true unobstructed opening, 2.4m crown.
 radius=w/2;spring=2.45-radius;verts=[];faces=[]
 for i in range(33):
  th=i*math.pi/32
  for dep,r in [(-t/2,radius),(t/2,radius),(-t/2,radius+.16),(t/2,radius+.16)]:
   u=r*math.cos(th);v=z+spring+r*math.sin(th);verts.append((x+u,y+dep,v) if axis=='X' else (x+dep,y+u,v))
 for i in range(32):
  a=i*4;b=a+4;faces.extend([(a,b,b+1,a+1),(a+2,a+3,b+3,b+2),(a,a+2,b+2,b),(a+1,b+1,b+3,a+3)])
 me=bpy.data.meshes.new('True arched opening');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('Courtyard archivolt',me);current.objects.link(o);o.data.materials.append(mats['plaster'])
 for sign in [-1,1]:
  u=sign*(radius+.08);r=[x+u-.08,y-t/2,x+u+.08,y+t/2] if axis=='X' else [x-t/2,y+u-.08,x+t/2,y+u+.08];box('Arch jamb',r,z,spring)
# Slabs from polygonal ring. Explicit holes for real stair opening.
baseSlabs=[[0,0,11.7,3],[14.8,0,15,3],[11.7,0,14.8,.3],[11.7,2.5,14.8,3],[0,3,5,14],[11,3,15,14],[5,11,11,14]]
upperSlabs=[[0,0,11.7,3],[14.8,0,15,3],[11.7,0,14.8,.3],[11.7,2.5,14.8,3],[0,3,5,4.2],[0,11,5,14],[11,3,15,14],[5,11,11,14]]
for L,z,col in [('GF',0,'Ground'),('Upper',H,'Upper')]:
 current=cols[col]
 slabs=baseSlabs if L=='GF' else upperSlabs
 for r in slabs:box(L+' structural floor slab',r,z-.2,.2,'stone')
 if L=='GF':
  box('Ground under stair',[11.7,.3,14.8,2.5],-.2,.2,'stone');box('Courtyard paving',[5,3,11,11],-.2,.2,'stone');box('Pool water',pool,-.08,.09,'water')
  for r in [[6.88,4.38,7,9.62],[9,4.38,9.12,9.62],[7,4.38,9,4.5],[7,9.5,9,9.62]]:box('Pool coping',r,0,.08,'stone')
  for r in bedsGreen:box('Low aromatic planted border',r,0,.2,'green')
  for x,y,r in plants:tree(x,y,0,.85)
 else:
  box('Open terrace over living',[0,4.2,5,11],H-.2,.2,'stone')
  for r in [[0,4.2,.15,11],[4.85,4.2,5,11]]:box('Terrace parapet',r,H,1.0)
  tree(.8,5.2,H,.85);tree(.8,9.7,H,.85)
 for x1,y1,x2,y2,t,kind in walls[L]:
  o=box(L+' '+kind+' wall',[x1-t/2,y1-t/2,x2+t/2,y2+t/2],z,2.99);wallobjects.append(o)
 for x,y,w,axis,typ,kind in openings[L]:
  r=[x-w/2,y-.125,x+w/2,y+.125] if axis=='X' else [x-.125,y-w/2,x+.125,y+w/2]
  if typ in ['arch','archedwindow']:
   arch(x,y,w,axis,z);box('Arch upper lintel',r,z+2.62,.37)
   if typ=='archedwindow':
    rr=[x-w/2,y-.02,x+w/2,y+.02];box('Arched window glazing',rr,z,2.1,'glass')
  else:
   box('Door/window lintel',r,z+2.4,.59)
   if typ in ['window','archedwindow']:
    box('Window sill wall',r,z,.8);rr=[x-w/2,y-.02,x+w/2,y+.02] if axis=='X' else [x-.02,y-w/2,x+.02,y+w/2];box('Window glazing',rr,z+.8,1.6,'glass')
 # Stair: mirrored P01; lower flight west→east, upper east→west. 18 risers at .18.
 for i in range(8):box('Stair lower flight / tread '+str(i+1),[11.7+i*.26,.3,11.96+i*.26,1.35],z+i*.18,.18,'stone')
 box('Stair 180-degree landing',[13.78,.3,14.8,2.5],z+1.44,.18,'stone')
 for i in range(8):box('Stair upper flight / tread '+str(i+1),[13.52-i*.26,1.45,13.78-i*.26,2.5],z+1.62+i*.18,.18,'stone')
 for f in furniture[L]:box(f['name'],f['rect'],z+.03,f['height'],f['kind'])
 # Guard at the inner well, legible in cutaway.
 for i in range(9):
  x=11.7+i*.26;box('Stair guard lower',[x,1.35,x+.025,1.39],z+min(i+1,8)*.18,.95,'bronze');box('Stair guard upper',[x,1.41,x+.025,1.45],z+3.06-min(i,7)*.18,.95,'bronze')
current=cols['Roof'];z=H*2
for r in upperSlabs:roofslabs.append(box('Roof terrace slab',r,z-.2,.2,'stone'))
# 3.60 x 2.7777778 = 10m² roof stair enclosure, same stair opening.
for r in [[11.4,0,15,.2],[14.8,.2,15,10/3.6],[11.4,10/3.6-.2,14.8,10/3.6],[11.4,.2,11.6,1.35],[11.4,2.55,11.6,10/3.6-.2]]:box('Roof stair headhouse wall',r,z,2.7)
box('Roof stair headhouse roof',[11.4,0,15,10/3.6],z+2.7,.2)
for r in [[0,0,11.4,.15],[0,0,.15,4.2],[0,4.05,5,4.2],[4.85,3,5,4.2],[4.85,11,5,14],[0,11,.15,14],[0,13.85,15,14],[14.85,2.78,15,14],[10.85,3,11,11],[5,2.85,11,3],[5,11,11,11.15]]:box('Roof parapet',r,z,1.)
for x in [11.5,14.5]:
 for y in [7.5,12.5]:box('Cedar pergola post',[x-.075,y-.075,x+.075,y+.075],z,2.5,'wood')
for y in [7.5+i*.4 for i in range(14)]:box('Cedar pergola slat',[11.35,y-.055,14.65,y+.055],z+2.5,.14,'wood')
for x in [11.5,14.5]:box('Cedar pergola beam',[x-.08,7.35,x+.08,12.85],z+2.35,.2,'wood')
box('Roof lounge',[13.5,8,14.3,11.5],z,.65,'linen');box('Roof dining',[6,12,8.6,13],z+.7,.08,'wood');box('Outdoor kitchen',[9.5,13.1,10.5,13.75],z,.9,'stone')
for x,y in [(1,1),(3.5,12.5),(11.7,5.8),(13.7,13.3)]:tree(x,y,z,.7)
current=cols['Garden'];box('PROPOSED garden outside unknown plot boundary',[0,14,15,18],-.22,.2,'soil');box('Garden walk',[6,14,7.2,18],-.01,.04,'stone')
for x,y in [(1.4,15.3),(4,16.4),(10,16.6),(13.5,15.6)]:tree(x,y,0,1.4)
box('Garden bench',[9,14.7,12,15.3],0,.45,'wood')
# Simple oblique schematic lighting; deliberately not final photoreal production.
current=cols['Lighting'];bpy.ops.object.light_add(type='AREA',location=(5,-8,25));o=link(bpy.context.object);o.data.energy=2800;o.data.size=16
bpy.ops.object.light_add(type='SUN');o=link(bpy.context.object);o.data.energy=2.2;o.data.angle=.2;o.rotation_euler=(.45,-.4,-.5)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.85,.83,.78,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.8
bpy.ops.object.camera_add();cam=link(bpy.context.object);cam.data.type='ORTHO';scene.camera=cam
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=32;scene.render.resolution_x=1800;scene.render.resolution_y=1500;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
scene['Enclosure note']='Closeable courtyard glazing/doors proposed; moving leaves omitted in approval schematic';scene['P02 status']='APPROVAL SCHEMATIC ONLY — no final render/video authorisation';scene['Enclosed gross m2']=300.;scene['Courtyard open m2']=48.;scene['Plot boundary']='Unknown; rear garden proposed';scene['Stair geometry']='18 risers x .18 =3.24m;8 treads x.26 perflight;1.02m landing;1.05m flights'
def camera(pos,target,scale):cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
camera((-8,-14,55),(7.5,8,2),28)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'Casa-Mirador-300sqm-PROPOSAL.blend'),compress=True)
scene.render.filepath=str(out/'architectural-overview.png');bpy.ops.render.render(write_still=True)
# Cutaway display derives from the same model: roof concealed and walls reduced, no floor separation.
for o in cols['Roof'].objects:o.hide_render=True
for o in wallobjects:o.scale.z=.28;o.location.z-=1.0764
for o in bpy.data.objects:
 if any(n in o.name for n in ['lintel','glazing','sill wall','archivolt','Arch jamb']):o.hide_render=True
camera((29,-25,31),(7.5,7,2),25);scene.render.filepath=str(out/'assembled-cutaway.png');bpy.ops.render.render(write_still=True)
# Isolate the actual two stacked stairs, with cut floor landings at their real elevations.
for c in cols.values():
 if c.name!='Lighting':
  for o in c.objects:o.hide_render=not o.name.startswith('Stair ')
current=cols['Ground']
for zz in [0,H,H*2]:box('Section floor landing',[10.6,.15,11.7,2.65],zz-.2,.2,'stone')
camera((23,-11,13),(12.5,1.4,3.4),10.5);scene.render.filepath=str(out/'stair-section.png');bpy.ops.render.render(write_still=True)
print('P02_SCHEMATIC_COMPLETE')
